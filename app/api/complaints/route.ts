import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { createComplaint, getComplaints } from "@/lib/db";
import { Category, Priority } from "@/lib/types";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function GET() {
  try {
    const complaints = await getComplaints();
    return NextResponse.json(complaints);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch complaints: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let title = "";
    let description = "";
    let location = "";
    let category: Category = "Other";
    let priority: Priority = "Medium";
    let department = "General Grievance Cell";
    let aiSummary = "";
    let aiReasoning = "";
    let suggestedAction = "";
    let estimatedResolution = "";
    let aiSource: "gemini" | "fallback" = "fallback";
    let imageUrl: string | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      title = (formData.get("title") as string)?.trim() || "";
      description = (formData.get("description") as string)?.trim() || "";
      location = (formData.get("location") as string)?.trim() || "Location not specified";
      category = ((formData.get("category") as string) || "Other") as Category;
      priority = ((formData.get("priority") as string) || "Medium") as Priority;
      department = (formData.get("department") as string) || "General Grievance Cell";
      aiSummary = (formData.get("aiSummary") as string) || title;
      aiReasoning = (formData.get("aiReasoning") as string) || "";
      suggestedAction = (formData.get("suggestedAction") as string) || "";
      estimatedResolution = (formData.get("estimatedResolution") as string) || "";
      aiSource = ((formData.get("aiSource") as string) || "fallback") as
        | "gemini"
        | "fallback";

      const file = formData.get("image") as File | null;
      if (file && file.size > 0) {
        // Validate size
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: "Image file exceeds the 5 MB limit." },
            { status: 400 }
          );
        }

        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          return NextResponse.json(
            {
              error:
                "Invalid image format. Only JPG, PNG, and WebP images are allowed.",
            },
            { status: 400 }
          );
        }

        // Generate safe unique filename
        const ext = file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg";
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
        const uploadsDir = path.join(process.cwd(), "public", "uploads");

        // Ensure directory exists
        await fs.mkdir(uploadsDir, { recursive: true });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = path.join(uploadsDir, filename);
        await fs.writeFile(filePath, buffer);

        imageUrl = `/uploads/${filename}`;
      }
    } else {
      // JSON body
      const body = await req.json();
      title = body.title?.trim() || "";
      description = body.description?.trim() || "";
      location = body.location?.trim() || "Location not specified";
      category = (body.category || "Other") as Category;
      priority = (body.priority || "Medium") as Priority;
      department = body.department || "General Grievance Cell";
      aiSummary = body.aiSummary || title;
      aiReasoning = body.aiReasoning || "";
      suggestedAction = body.suggestedAction || "";
      estimatedResolution = body.estimatedResolution || "";
      aiSource = (body.aiSource || "fallback") as "gemini" | "fallback";
      imageUrl = body.imageUrl;
    }

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required." },
        { status: 400 }
      );
    }

    const complaint = await createComplaint({
      title,
      description,
      location,
      category,
      priority,
      department,
      status: "Reported",
      imageUrl,
      aiSummary,
      aiReasoning,
      suggestedAction: suggestedAction || undefined,
      estimatedResolution: estimatedResolution || undefined,
      aiSource,
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error: any) {
    console.error("Error creating complaint:", error);
    return NextResponse.json(
      { error: "Failed to create complaint: " + error.message },
      { status: 500 }
    );
  }
}
