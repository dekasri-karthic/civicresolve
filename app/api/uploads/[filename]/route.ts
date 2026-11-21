import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { UPLOADS_DIR } from "@/lib/db";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    // Prevent directory traversal
    const safeName = path.basename(filename);
    const ext = path.extname(safeName).toLowerCase();
    const mimeType = MIME_MAP[ext] || "application/octet-stream";

    // 1. Check UPLOADS_DIR (os.tmpdir() in production, or public/uploads in dev)
    const primaryPath = path.join(UPLOADS_DIR, safeName);
    try {
      const buffer = await fs.readFile(primaryPath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // Continue to fallbacks
    }

    // 2. Check public/uploads
    const localUploadsPath = path.join(process.cwd(), "public", "uploads", safeName);
    try {
      const buffer = await fs.readFile(localUploadsPath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // Continue to fallbacks
    }

    // 3. Check public root (e.g. sample-pothole.jpg)
    const localPublicPath = path.join(process.cwd(), "public", safeName);
    try {
      const buffer = await fs.readFile(localPublicPath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // Not found
    }

    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to serve image." },
      { status: 500 }
    );
  }
}
