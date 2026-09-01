// Local-only preview: renders the registration confirmation email to a
// standalone HTML file so it can be screenshotted, without needing a real
// email service configured. Not part of the site build or deploy.
import { writeFileSync } from "node:fs";
import { buildRegistrationEmailHtml } from "../netlify/functions/lib/registration-email.js";

const sampleData = {
  course: "Kanban Systems Design (KMP I) — Live Online",
  name: "Anna Weber",
  email: "anna.weber@example-corp.de",
  company: "Example Corp GmbH",
  address: "Musterstraße 12",
  postcode: "10115",
  state: "Berlin",
  country: "Germany",
  seats: "2",
  total: "€2,590",
  "attendee-name-1": "Anna Weber",
  "attendee-email-1": "anna.weber@example-corp.de",
  "attendee-name-2": "Jonas Richter",
  "attendee-email-2": "jonas.richter@example-corp.de",
};

writeFileSync(process.argv[2], buildRegistrationEmailHtml(sampleData));
