// Session handling for the /admin area: a single allow-listed Google
// account (ADMIN_EMAIL) signs in via Google Identity Services, the ID
// token is verified server-side in admin-login.js, and this module then
// issues a short, signed JWT held in an httpOnly cookie — no database
// row for "sessions", the cookie itself is the whole session.
import jwt from "jsonwebtoken";

const COOKIE_NAME = "admin_session";
const SESSION_TTL = "7d";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set");
  return value;
}

export function createSessionCookie(email) {
  const token = jwt.sign({ email }, secret(), { expiresIn: SESSION_TTL });
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function readCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

// Returns { email } for a valid, unexpired session cookie, or null —
// callers treat null as "not logged in" rather than distinguishing why.
export function getSession(event) {
  const cookieHeader = event.headers?.cookie || event.headers?.Cookie;
  const token = readCookie(cookieHeader, COOKIE_NAME);
  if (!token) return null;

  try {
    const payload = jwt.verify(token, secret());
    return { email: payload.email };
  } catch {
    return null;
  }
}
