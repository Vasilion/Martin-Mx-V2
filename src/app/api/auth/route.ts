import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const origin = request.nextUrl.origin;
  if (!clientId) {
    return NextResponse.json({ error: "OAUTH_GITHUB_CLIENT_ID is not configured." }, { status: 500 });
  }

  const callbackUrl = `${origin}/api/callback`;
  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", callbackUrl);
  authorizeUrl.searchParams.set("scope", "repo");

  return NextResponse.redirect(authorizeUrl.toString());
}
