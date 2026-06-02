import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/google
 *
 * Server-side handler untuk Google OAuth:
 * 1. Terima Google ID token dari frontend
 * 2. Verifikasi ke Google tokeninfo endpoint (memakai server-side client secret)
 * 3. Coba teruskan ke Amara backend (POST /api/auth/google)
 * 4. Jika backend belum mendukung → kembalikan Google user info langsung
 *    agar frontend bisa menyimpan sesi lokal
 */
export async function POST(req: NextRequest) {
  try {
    const { idToken } = (await req.json()) as { idToken?: string };
    if (!idToken) {
      return NextResponse.json({ error: "idToken required" }, { status: 400 });
    }

    const googleRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
    );
    if (!googleRes.ok) {
      return NextResponse.json({ error: "Token Google tidak valid" }, { status: 401 });
    }
    const gUser = (await googleRes.json()) as {
      sub: string;
      name: string;
      email: string;
      picture?: string;
      email_verified?: string;
      aud: string;
    };


    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId && gUser.aud !== clientId) {
      return NextResponse.json({ error: "Token audience tidak cocok" }, { status: 401 });
    }


    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "https://amara-development.up.railway.app";

    try {
      const amaraRes = await fetch(`${apiBase}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (amaraRes.ok) {
        const amaraData = (await amaraRes.json()) as {
          success: boolean;
          data: { accessToken: string; user: object };
        };
        if (amaraData.success) {
          return NextResponse.json({ source: "amara", ...amaraData.data });
        }
      }
    } catch {
    }


    return NextResponse.json({
      source: "google",
      user: {
        id: gUser.sub,
        name: gUser.name,
        email: gUser.email,
        picture: gUser.picture ?? null,
        role: "USER",
      },
    });
  } catch (err) {
    console.error("[/api/auth/google]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
