// Lexware Office (formerly lexoffice) integration for Phase 1 of automated
// invoicing: find-or-create the registrant as a contact, create an ordinary
// (unpaid, bank-transfer) invoice for the course price, and download it as
// a PDF to attach to the registration emails.
//
// API reference verified against developers.lexware.io and the typed
// community Rust client (github.com/Gottox/lexoffice, generated from the
// official docs) as of September 2026:
//   Base URL:    https://api.lexware.io/v1
//   Auth:        Authorization: Bearer <LEXWARE_API_KEY>
//   Contacts:    GET /contacts?email=...   POST /contacts
//   Invoices:    POST /invoices?finalize=true|false  GET /invoices/{id}
//                Response carries files.documentFileId once rendered.
//   Files:       GET /files/{documentFileId} -> raw PDF bytes
//
// Requires two environment variables in the Netlify dashboard:
//   LEXWARE_API_KEY   — already set
//   LEXWARE_TEST_MODE — "true" (default/unset) keeps every invoice a draft
//                       (finalize is never passed as true) and prefixes the
//                       title/remark with "TEST — ", so test runs are
//                       unmistakable and freely deletable in Lexware Office.
//                       Set to the literal string "false" once ready for
//                       real, finalized invoices.
import { toCountryCode } from "./country-codes.js";
import { buildAttendeeList } from "./registration-email.js";
import { resolveDiscount } from "./discount.js";

const LEXWARE_BASE_URL = "https://api.lexware.io/v1";

function isTestMode() {
  return process.env.LEXWARE_TEST_MODE !== "false";
}

// Lexware caps requests at 2/s. A single registration can now chain 4+
// calls (contact lookup, a VAT sync's GET+PUT, invoice create, invoice
// poll, file download) with nothing pacing them — confirmed hitting a real
// 429 once the VAT-sync calls were added. Enforce a minimum gap between
// calls, module-scoped so it holds across every call in one invocation.
let lastRequestAt = 0;
const MIN_REQUEST_INTERVAL_MS = 550;

async function throttle() {
  const wait = lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastRequestAt = Date.now();
}

async function lexwareRequest(path, options = {}, retriesLeft = 2) {
  const apiKey = process.env.LEXWARE_API_KEY;
  if (!apiKey) throw new Error("LEXWARE_API_KEY is not set");

  await throttle();

  const res = await fetch(`${LEXWARE_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  // Retry a 429 once or twice with backoff — a safety net for bursts our
  // own throttling doesn't cover (e.g. two registrations landing close
  // together in separate invocations).
  if (res.status === 429 && retriesLeft > 0) {
    const retryAfterHeader = res.headers?.get?.("retry-after");
    const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : MIN_REQUEST_INTERVAL_MS * 2;
    await new Promise((resolve) => setTimeout(resolve, Math.min(retryAfterMs, 3000)));
    return lexwareRequest(path, options, retriesLeft - 1);
  }

  if (!res.ok) {
    const rawBody = await res.text().catch(() => "");
    const shortPath = path.split("?")[0];
    const contentType = res.headers?.get?.("content-type") ?? "?";
    // Lexware's declared Content-Length vs. what we actually read tells us
    // whether the server sent a genuinely tiny body (plan/gateway
    // rejection) or something got cut in transit (encoding mismatch,
    // stream abort) — the two look identical downstream but need
    // different fixes.
    const declaredLen = res.headers?.get?.("content-length") ?? "?";
    const encoding = res.headers?.get?.("content-encoding") ?? "none";
    throw new Error(
      `Lex ${res.status} ${options.method ?? "GET"} ${shortPath} len=${rawBody.length}/${declaredLen} enc=${encoding} ct=${contentType}: ${summarizeErrorBody(rawBody)}`
    );
  }

  return res;
}

// Netlify's log viewer hard-truncates a single long line with no way to
// expand or scroll it (confirmed by screenshot), and a second, separate
// console.error call logged just before this one's throw was observed to
// go missing entirely in production — a known class of Lambda issue where
// two rapid stdout writes right before the handler returns can lose the
// earlier one to a flush race. So there's exactly one log line for a
// failure (the caller's single catch-and-log of the thrown Error), and it
// has to carry the useful part of the error on its own: pull out each
// IssueList entry's source field + i18nKey (Lexware's validation-error
// shape) into a short "field: reason" summary instead of dumping the raw
// body, which is short enough to survive whatever the display's per-line
// character budget turns out to be.
function summarizeErrorBody(rawBody) {
  try {
    const parsed = JSON.parse(rawBody);
    if (Array.isArray(parsed.IssueList) && parsed.IssueList.length > 0) {
      return parsed.IssueList.map((issue) => `${issue.source ?? "?"}: ${issue.i18nKey ?? issue.type ?? "?"}`).join(
        " | "
      );
    }
    // A separate validation-error shape (seen on /invoices, distinct from
    // /contacts' IssueList) — {message: "Validation failed...", details:
    // [{violation, field, message}]}. Missing this meant every /invoices
    // 406 logged only the generic top-level message and never the actual
    // failing field, which is how the title/shippingConditions bugs ended
    // up needing a full raw-body paste each time to diagnose.
    if (Array.isArray(parsed.details) && parsed.details.length > 0) {
      return parsed.details
        .map((d) => `${d.field ?? "?"}${d.violation ? ` (${d.violation})` : ""}: ${d.message ?? "?"}`)
        .join(" | ");
    }
    if (parsed.message) return String(parsed.message).slice(0, 150);
    if (parsed.error) return String(parsed.error).slice(0, 150);
  } catch {
    // not JSON, or not the expected shape — fall through to raw text
  }
  // Strip characters that make this look like a JSON object: some log
  // viewers/aggregators auto-detect and fold `{...}`-shaped substrings,
  // which would hide exactly the diagnostic text we need to see.
  return rawBody.replace(/[{}"]/g, "").slice(0, 200) || "(empty body)";
}

function parseAmount(value) {
  const n = parseFloat(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// Lexware's docs specify voucherDate as yyyy-MM-ddTHH:mm:ss.SSSXXX with a
// numeric timezone offset (e.g. "+01:00"), not the "Z" suffix
// Date#toISOString() produces. "+00:00" is equivalent to "Z" in UTC terms
// but matches the documented offset format.
function toLexwareDateTime(date) {
  return date.toISOString().replace("Z", "+00:00");
}

const MS_PER_DAY = 86_400_000;

// Due 30 days out by default, pulled in to a week before the course starts
// if that's sooner (so we're not still invoicing after the course has
// begun), and pulled in further to "today" if it's already inside that
// one-week window.
function computeDueDate(voucherDate, sessionDateIso) {
  const defaultDue = new Date(voucherDate.getTime() + 30 * MS_PER_DAY);
  if (!sessionDateIso) return defaultDue;

  const sessionDate = new Date(sessionDateIso);
  if (Number.isNaN(sessionDate.getTime())) return defaultDue;

  const daysUntilSession = (sessionDate.getTime() - voucherDate.getTime()) / MS_PER_DAY;
  if (daysUntilSession >= 30) return defaultDue;

  const oneWeekBefore = new Date(sessionDate.getTime() - 7 * MS_PER_DAY);
  return oneWeekBefore.getTime() > voucherDate.getTime() ? oneWeekBefore : voucherDate;
}

function splitName(fullName) {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { lastName: "Customer" };
  if (parts.length === 1) return { lastName: parts[0] };
  const lastName = parts.pop();
  return { firstName: parts.join(" "), lastName };
}

function buildBillingAddress(data) {
  const countryCode = toCountryCode(data.country);
  return {
    street: data.address,
    zip: data.postcode,
    // The registration form collects a "state" (Bundesland/region) field,
    // not a separate city — there is no city field to draw from. Using
    // state here is a known, deliberate approximation until the form
    // collects a real city.
    city: data.state,
    ...(countryCode ? { countryCode } : {}),
  };
}

async function findContactByEmail(email) {
  const res = await lexwareRequest(`/contacts?email=${encodeURIComponent(email)}`);
  const json = await res.json();
  const contacts = Array.isArray(json) ? json : (json.content ?? []);
  const match = contacts.find((c) =>
    Object.values(c.emailAddresses ?? {}).flat().includes(email)
  );
  return match?.id ?? null;
}

// Lexware rejects vatRegistrationId with a 406 unless the leading country
// code is uppercase (e.g. "DE123456789", not "de123456789") — normalize
// rather than trust however the registrant happened to type it.
function normalizeVatId(vatId) {
  const trimmed = (vatId || "").trim().replace(/\s+/g, "");
  return trimmed ? trimmed.toUpperCase() : null;
}

async function createContact(data) {
  const isCompany = Boolean(data.company);
  const vatId = normalizeVatId(data["vat-id"]);
  const body = {
    version: 0,
    roles: { customer: {} },
    ...(isCompany
      ? { company: { name: data.company, ...(vatId ? { vatRegistrationId: vatId } : {}) } }
      : { person: splitName(data.name) }),
    ...(data.address ? { addresses: { billing: [buildBillingAddress(data)] } } : {}),
    ...(data.email ? { emailAddresses: { business: [data.email] } } : {}),
  };

  const res = await lexwareRequest("/contacts", { method: "POST", body: JSON.stringify(body) });
  const json = await res.json();
  return json.id;
}

// A VAT ID is only ever sent when a *new* contact is created — a repeat
// registrant reusing an existing contact (found by email) would silently
// have any newly-entered VAT ID dropped, since it's never written back to
// their existing Lexware record. Sync it in (Lexware requires a full
// contact PUT with the current `version` for optimistic locking — a
// partial patch isn't accepted).
async function syncContactVatId(contactId, vatId) {
  const res = await lexwareRequest(`/contacts/${contactId}`);
  const contact = await res.json();
  if (!contact.company || contact.company.vatRegistrationId === vatId) return;

  const body = { ...contact, company: { ...contact.company, vatRegistrationId: vatId } };
  await lexwareRequest(`/contacts/${contactId}`, { method: "PUT", body: JSON.stringify(body) });
}

async function findOrCreateContact(data) {
  if (data.email) {
    const existing = await findContactByEmail(data.email);
    if (existing) {
      const vatId = normalizeVatId(data["vat-id"]);
      if (vatId) {
        try {
          await syncContactVatId(existing, vatId);
        } catch (error) {
          // Non-fatal — the invoice still gets created against the
          // existing contact, just without an updated VAT ID this time.
          console.error("Lex fail: could not sync VAT ID onto existing contact —", error.message);
        }
      }
      return existing;
    }
  }
  return createContact(data);
}

// The invoice line item and title lose the "(session-slug)" that used to
// ride along with data.course — put the human-readable session date/
// location and who's actually booked/attending here instead, so that
// context isn't just discarded.
function buildInvoiceIntroduction(data) {
  const lines = [data.course || "Training course"];
  if (data["session-date"]) {
    lines.push(`${data["session-date"]}${data.location ? `. ${data.location}` : ""}`);
  }
  lines.push(`Registered by: ${data.name || "—"} (${data.email || "—"})`);

  const attendees = buildAttendeeList(data);
  const soleAttendeeIsBooker =
    attendees.length === 1 && attendees[0].name === data.name && attendees[0].email === data.email;
  if (attendees.length && !soleAttendeeIsBooker) {
    attendees.forEach((a, i) => {
      const label = attendees.length > 1 ? `Attendee ${i + 1}` : "Attendee";
      lines.push(`${label}: ${a.name || "—"} (${a.email || "—"})`);
    });
  }

  return lines.join("\n");
}

async function createInvoice(data, contactId) {
  const testMode = isTestMode();
  const prefix = testMode ? "TEST — " : "";
  const netAmount = parseAmount(data.total);
  const discount = resolveDiscount(data);
  const voucherDate = new Date();
  const dueDate = computeDueDate(voucherDate, data["session-date-iso"]);
  // Lexware's PDF renders the due date from paymentConditions.paymentTermDuration
  // (days from voucherDate), not from a raw `dueDate` we pass — confirmed by
  // a real test invoice showing Lexware's own 10-day default instead of our
  // computed date. Send both: the day count Lexware actually uses, and
  // `dueDate` as a harmless best-effort in case that changes.
  const paymentTermDuration = Math.max(0, Math.round((dueDate.getTime() - voucherDate.getTime()) / MS_PER_DAY));
  // Every documented example pairs paymentTermDuration with a label —
  // include one defensively rather than risk a "required" validation
  // failure for omitting it.
  const paymentTermLabel =
    paymentTermDuration <= 0 ? "Zahlbar sofort" : `Zahlbar innerhalb von ${paymentTermDuration} Tagen`;

  const body = {
    voucherDate: toLexwareDateTime(voucherDate),
    dueDate: toLexwareDateTime(dueDate),
    paymentConditions: { paymentTermDuration, paymentTermLabel },
    address: {
      contactId,
      name: data.company || data.name,
      ...buildBillingAddress(data),
    },
    lineItems: [
      {
        type: "custom",
        name: data.course || "Training course",
        quantity: 1,
        unitName: "Pauschal",
        unitPrice: {
          currency: "EUR",
          netAmount,
          taxRatePercentage: 19,
        },
        // Lexware's native per-line discount — keeps the original price
        // visible on the PDF alongside the discount, rather than us
        // silently zeroing netAmount ourselves.
        ...(discount ? { discountPercentage: discount.percentage } : {}),
      },
    ],
    totalPrice: { currency: "EUR" },
    taxConditions: { taxType: "net" },
    // Required by Lexware even when nothing is physically shipped — a
    // training course — so "none" is the correct shippingType here.
    shippingConditions: { shippingType: "none" },
    // Lexware caps `title` at 25 characters ("muss zwischen 0 und 25
    // Zeichen liegen") — nowhere near enough for a course name, which is
    // why every real invoice call has been failing. The course name goes
    // in `introduction` instead, which has no such limit — also used to
    // carry the session date/location and who's booked/attending, per
    // buildInvoiceIntroduction above.
    title: `${prefix}Invoice`,
    introduction: buildInvoiceIntroduction(data),
    // Discount code and free-text notes are internal (already visible in
    // the owner-notification email) — they don't belong on a document the
    // customer receives, so the invoice remark stays just the payment terms.
    remark: `${prefix}Payable by bank transfer, per registration terms.`,
  };

  const res = await lexwareRequest(`/invoices?finalize=${testMode ? "false" : "true"}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.json();
}

// The PDF isn't always rendered synchronously with invoice creation, and
// neither is the human-readable voucherNumber ("BC-2026-09-3521") — the
// creation response only reliably carries the internal UUID. Both tend to
// land together once Lexware finishes processing, so poll briefly for
// files.documentFileId and pull voucherNumber off that same response
// rather than trusting whatever the initial creation call returned.
async function getDocumentFileId(invoiceId, createdInvoice) {
  if (createdInvoice?.files?.documentFileId) {
    return { documentFileId: createdInvoice.files.documentFileId, voucherNumber: createdInvoice.voucherNumber };
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const res = await lexwareRequest(`/invoices/${invoiceId}`);
    const json = await res.json();
    if (json?.files?.documentFileId) {
      return { documentFileId: json.files.documentFileId, voucherNumber: json.voucherNumber };
    }
  }
  return { documentFileId: null, voucherNumber: undefined };
}

async function downloadFile(fileId) {
  const res = await lexwareRequest(`/files/${fileId}`, { headers: { Accept: "*/*" } });
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Returns { pdfBuffer, invoiceId, testMode } on success, or null if
// anything failed (logged) — invoice generation is never allowed to block
// the registration emails from sending.
export async function generateInvoicePdf(data) {
  if (!process.env.LEXWARE_API_KEY) {
    console.log("submission-created: LEXWARE_API_KEY not set — skipping invoice generation.");
    return null;
  }

  try {
    const contactId = await findOrCreateContact(data);
    const invoice = await createInvoice(data, contactId);

    // Lexware never renders a PDF for a draft (unfinalized) invoice —
    // confirmed against their docs, not just a rendering delay — so
    // LEXWARE_TEST_MODE=true invoices will reliably have no attachment.
    // That's expected, not an error; only warn when a *finalized*
    // invoice unexpectedly has no PDF.
    if (isTestMode()) {
      console.log(
        `submission-created: invoice ${invoice.id} created as a TEST_MODE draft — Lexware doesn't render a PDF for drafts, so no attachment this time (expected; will attach once LEXWARE_TEST_MODE is "false").`
      );
      return null;
    }

    const { documentFileId, voucherNumber } = await getDocumentFileId(invoice.id, invoice);

    if (!documentFileId) {
      console.error("submission-created: finalized invoice created but PDF never rendered:", invoice.id);
      return null;
    }

    const pdfBuffer = await downloadFile(documentFileId);
    return { pdfBuffer, invoiceId: invoice.id, voucherNumber: voucherNumber || invoice.voucherNumber, testMode: isTestMode() };
  } catch (error) {
    // Log only the message (not the full Error object) so this stays one
    // short line — the stack trace adds nothing we can act on and eats
    // into whatever character budget the log viewer allows per line.
    console.error("Lex fail:", error.message);
    return null;
  }
}
