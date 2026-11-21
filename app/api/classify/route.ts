import { NextRequest, NextResponse } from "next/server";
import { classifyComplaint } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let title = "";
    let description = "";
    let location = "";
    let imageBuffer: Buffer | undefined;
    let imageMimeType: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      title = (formData.get("title") as string) || "";
      description = (formData.get("description") as string) || "";
      location = (formData.get("location") as string) || "";

      const file = formData.get("image") as File | null;
      if (file && file.size > 0) {
        // Enforce 5MB limit
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Image size must be 5 MB or less." },
            { status: 400 }
          );
        }
        const bytes = await file.arrayBuffer();
        imageBuffer = Buffer.from(bytes);
        imageMimeType = file.type;
      }
    } else {
      // JSON body
      const body = await req.json();
      title = body.title || "";
      description = body.description || "";
      location = body.location || "";

      if (body.imageBase64 && body.imageMimeType) {
        imageBuffer = Buffer.from(body.imageBase64, "base64");
        imageMimeType = body.imageMimeType;
      }
    }

    if (!title.trim() || !description.trim()) {
      return NextResponse.json(
        { error: "Please provide both a title and description of the issue." },
        { status: 400 }
      );
    }

    const result = await classifyComplaint({
      title,
      description,
      location,
      imageBuffer,
      imageMimeType,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("API /api/classify unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to classify grievance: " + (err?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
