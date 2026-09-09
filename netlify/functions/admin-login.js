// Verifies a Google Identity Services ID token client-side sign-in
// produced, and — only for the single allow-listed admin email — issues
// the signed session cookie the rest of /admin relies on. Anyone else's
// Google account gets a 403; there is no signup, no user table, just one
// allow-listed address.
import { OAuth2Client } from "google-auth-library";
import { createSessionCookie } from "./lib/admin-auth.js";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const clientId = process.env.PUBLIC_GOOGLE_CLIENT_ID;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!clientId || !adminEmail) {
    console.error("admin-login: PUBLIC_GOOGLE_CLIENT_ID or ADMIN_EMAIL not set");
    return { statusCode: 500, body: JSON.stringify({ error: "Admin login is not configured" }) };
  }

  let credential;
  try {
    ({ credential } = JSON.parse(event.body || "{}"));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }
  if (!credential) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing credential" }) };
  }

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();

    if (!payload?.email_verified || payload.email.toLowerCase() !== adminEmail.toLowerCase()) {
      return { statusCode: 403, body: JSON.stringify({ error: "This Google account is not authorized" }) };
    }

    return {
      statusCode: 200,
      headers: { "Set-Cookie": createSessionCookie(payload.email), "Content-Type": "application/json" },
      body: JSON.stringify({ email: payload.email }),
    };
  } catch (error) {
    console.error("admin-login: token verification failed —", error.message);
    return { statusCode: 401, body: JSON.stringify({ error: "Could not verify Google sign-in" }) };
  }
};
