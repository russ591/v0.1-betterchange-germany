// Protected CRUD for discount codes, used by the /admin dashboard.
// GET lists every code; POST upserts one (used for both "create" and
// "edit" — a code is its own primary key, so writing an existing one just
// updates its percentage); DELETE removes one.
import { getSession } from "./lib/admin-auth.js";
import { listCodes, setCode, deleteCode } from "./lib/discount-store.js";

export const handler = async (event) => {
  if (!getSession(event)) {
    return { statusCode: 401, body: JSON.stringify({ error: "Not authenticated" }) };
  }

  if (event.httpMethod === "GET") {
    const codes = await listCodes();
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ codes }) };
  }

  if (event.httpMethod === "POST") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
    }

    try {
      const codes = await setCode(body.code, Number(body.percentage));
      return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ codes }) };
    } catch (error) {
      return { statusCode: 400, body: JSON.stringify({ error: error.message }) };
    }
  }

  if (event.httpMethod === "DELETE") {
    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
    }

    const codes = await deleteCode(body.code);
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ codes }) };
  }

  return { statusCode: 405, body: "Method not allowed" };
};
