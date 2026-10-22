/** Cookie value proving the staging password was entered (works in proxy and server code). */
export async function gateToken(password: string) {
  const bytes = new TextEncoder().encode(`martin-mx-staging:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
