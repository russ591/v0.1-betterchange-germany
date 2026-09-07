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

const LEXWARE_BASE_URL = "https://api.lexware.io/v1";

function isTestMode() {
  return process.env.LEXWARE_TEST_MODE !== "false";
}

async function lexwareRequest(path, options = {}) {
  const apiKey = process.env.LEXWARE_API_KEY;
  if (!apiKey) throw new Error("LEXWARE_API_KEY is not set");

  const res = await fetch(`${LEXWARE_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const rawBody = await res.text().catch(() => "");
    // Netlify's log viewer hard-truncates a single long line with no way
    // to expand it, but it does split multi-line console output (as seen
    // with stack traces) into separate rows — so pretty-print the JSON
    // error body across multiple short lines rather than one long one,
    // and log it directly here so it survives even if the caller only
    // logs the thrown Error's own (still short) message.
    let formattedBody = rawBody;
    try {
      formattedBody = JSON.stringify(JSON.parse(rawBody), null, 2);
    } catch {
      // not JSON — log the raw text as-is
    }
    console.error(
      `Lexware API ${options.method ?? "GET"} ${path} failed: ${res.status}\n${formattedBody}`
    );
    throw new Error(`Lexware API ${options.method ?? "GET"} ${path} failed: ${res.status} (see logged body above)`);
  }

  return res;
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

async function findOrCreateContact(data) {
  if (data.email) {
    const existing = await findContactByEmail(data.email);
    if (existing) return existing;
  }
  return createContact(data);
}

async function createInvoice(data, contactId) {
  const testMode = isTestMode();
  const prefix = testMode ? "TEST — " : "";
  const netAmount = parseAmount(data.total);

  const noteParts = [];
  if (data["discount-code"]) noteParts.push(`Discount code entered: ${data["discount-code"]}`);
  if (data.notes) noteParts.push(data.notes);

  const body = {
    voucherDate: toLexwareDateTime(new Date()),
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
      },
    ],
    totalPrice: { currency: "EUR" },
    taxConditions: { taxType: "net" },
    title: `${prefix}Invoice — ${data.course || "Training course"}`,
    remark: `${prefix}${noteParts.join(" — ") || "Payable by bank transfer, per registration terms."}`,
  };

  const res = await lexwareRequest(`/invoices?finalize=${testMode ? "false" : "true"}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.json();
}

// The PDF isn't always rendered synchronously with invoice creation —
// poll briefly for files.documentFileId to appear before giving up.
async function getDocumentFileId(invoiceId, createdInvoice) {
  if (createdInvoice?.files?.documentFileId) return createdInvoice.files.documentFileId;

  for (let attempt = 0; attempt < 5; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const res = await lexwareRequest(`/invoices/${invoiceId}`);
    const json = await res.json();
    if (json?.files?.documentFileId) return json.files.documentFileId;
  }
  return null;
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
    const documentFileId = await getDocumentFileId(invoice.id, invoice);

    if (!documentFileId) {
      console.error("submission-created: invoice created but PDF never rendered:", invoice.id);
      return null;
    }

    const pdfBuffer = await downloadFile(documentFileId);
    return { pdfBuffer, invoiceId: invoice.id, testMode: isTestMode() };
  } catch (error) {
    console.error("submission-created: Lexware invoice generation failed", error);
    return null;
  }
}
