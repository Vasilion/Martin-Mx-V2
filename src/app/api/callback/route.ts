import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;
  const origin = request.nextUrl.origin;

  if (!code || !clientId || !clientSecret) {
    return NextResponse.json({ error: "OAuth callback is missing required params." }, { status: 400 });
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${origin}/api/callback`,
    }),
  });

  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    return NextResponse.json({ error: "Failed to get access token from GitHub." }, { status: 401 });
  }

  const script = `
    <!doctype html>
    <html>
      <body>
        <script>
          window.opener.postMessage(
            "authorization:github:success:${tokenData.access_token}",
            window.location.origin
          );
          window.close();
        </script>
      </body>
    </html>
  `;

  return new NextResponse(script, { headers: { "Content-Type": "text/html" } });
}
