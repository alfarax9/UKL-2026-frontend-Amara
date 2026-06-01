/**
 * POST /api/upload
 *
 * Server-side Cloudinary upload handler.
 * - Menerima file dari frontend (multipart/form-data, field "file")
 * - Membuat signed upload request ke Cloudinary (API Secret tidak pernah ke browser)
 * - Mengembalikan { url, publicId, width, height }
 *
 * Field opsional:
 *   folder  – subfolder di Cloudinary (default: "amara")
 */

import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

function makeSignature(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1")
    .update(sorted + API_SECRET)
    .digest("hex");
}

export async function POST(req: NextRequest) {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return NextResponse.json(
      { error: "Cloudinary belum dikonfigurasi di server." },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Gagal membaca form data." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran file maks 5 MB." }, { status: 400 });
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF." },
      { status: 400 },
    );
  }


  const folder = (formData.get("folder") as string | null) ?? "amara";
  const timestamp = String(Math.floor(Date.now() / 1000));

  const sigParams: Record<string, string> = {
    folder,
    timestamp,
  };
  const signature = makeSignature(sigParams);
  const cldForm = new FormData();
  cldForm.append("file", file);
  cldForm.append("api_key", API_KEY);
  cldForm.append("timestamp", timestamp);
  cldForm.append("signature", signature);
  cldForm.append("folder", folder);

  try {
    const cldRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: cldForm },
    );

    const cldData = (await cldRes.json()) as {
      secure_url?: string;
      public_id?: string;
      width?: number;
      height?: number;
      error?: { message: string };
    };

    if (!cldRes.ok || cldData.error) {
      console.error("[/api/upload] Cloudinary error:", cldData.error?.message);
      return NextResponse.json(
        { error: cldData.error?.message ?? "Upload ke Cloudinary gagal." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      url: cldData.secure_url,
      publicId: cldData.public_id,
      width: cldData.width,
      height: cldData.height,
    });
  } catch (err) {
    console.error("[/api/upload]", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
