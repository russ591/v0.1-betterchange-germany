import { getSession } from "./lib/admin-auth.js";

export const handler = async (event) => {
  const session = getSession(event);
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session ? { authenticated: true, email: session.email } : { authenticated: false }),
  };
};
