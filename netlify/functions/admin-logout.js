import { clearSessionCookie } from "./lib/admin-auth.js";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  return {
    statusCode: 200,
    headers: { "Set-Cookie": clearSessionCookie(), "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true }),
  };
};
