import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { CATEGORIES, Category } from "@/lib/types";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let imageBuffer: Buffer | undefined;
    let imageMimeType: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image") as File | null;

      if (!file || file.size === 0) {
        return NextResponse.json(
          { error: "No image file provided." },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Image file exceeds 5 MB limit." },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: "Only JPG, PNG, and WebP images are supported." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      imageBuffer = Buffer.from(bytes);
      imageMimeType = file.type;
    } else {
      const body = await req.json();
      if (!body.imageBase64 || !body.imageMimeType) {
        return NextResponse.json(
          { error: "Image base64 data and mimeType required." },
          { status: 400 }
        );
      }
      imageBuffer = Buffer.from(body.imageBase64, "base64");
      imageMimeType = body.imageMimeType;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    if (!apiKey || apiKey.trim() === "" || apiKey === "placeholder" || apiKey.includes("your_")) {
      console.warn("[CivicResolve Photo-First] GEMINI_API_KEY is not set. Cannot run multimodal analysis.");
      return NextResponse.json(
        { error: "Gemini API key is not configured for image vision analysis." },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are an expert municipal infrastructure inspector analyzing an uploaded civic issue photograph.
Examine the image carefully and detect the visible civic problem (such as a pothole, road crater, garbage overflow, broken streetlight, water pipe burst, open drain, exposed cable, fallen branch, etc.).

MULTILINGUAL INSTRUCTION:
The photograph may include street signs, hoardings, milestone markers, vehicle plates, or shop boards written in ANY script or language (such as Tamil, Hindi, Kannada, Telugu, etc.). Regardless of the visible language, you MUST write and return ALL fields (title, description, category) strictly in fluent, standard ENGLISH.

Return strict JSON with these exact fields:
{
  "title": "<A clear, professional civic grievance title in English, e.g. 'Deep asphalt pothole causing traffic obstruction' or 'Uncollected garbage pile overflowing on sidewalk'>",
  "description": "<A detailed 2-3 sentence description in English of what is clearly visible in the image, noting surface condition, severity, and potential hazards to pedestrians or motorists>",
  "category": "<One of: 'Road & Potholes', 'Garbage & Sanitation', 'Street Lighting', 'Water Supply & Leakage', 'Drainage & Sewage', 'Public Safety', 'Other'>"
}

Make the title and description realistic and ready for municipal review.`;

    // Safe timeout helper (8 seconds)
    const withTimeout = <T>(promise: Promise<T>, ms = 8000): Promise<T> => {
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`Vision request timed out after ${ms}ms`)), ms);
      });
      return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
    };

    // Generate content with multi-model fallback for resilience
    let response: any;
    try {
      response = await withTimeout(
        ai.models.generateContent({
          model: modelName,
          contents: [
            {
              inlineData: {
                mimeType: imageMimeType,
                data: imageBuffer.toString("base64"),
              },
            },
            prompt,
          ],
          config: {
            responseMimeType: "application/json",
          },
        }),
        8000
      );
    } catch (primaryErr: any) {
      console.warn(
        `[CivicResolve Image Analysis] Primary model (${modelName}) failed or reached limit, trying resilient alternatives...`,
        primaryErr?.message || primaryErr
      );
      const fallbackModels = ["gemini-2.5-flash", "gemini-2.0-flash"].filter(
        (m) => m !== modelName
      );
      let success = false;
      for (const altModel of fallbackModels) {
        try {
          response = await withTimeout(
            ai.models.generateContent({
              model: altModel,
              contents: [
                {
                  inlineData: {
                    mimeType: imageMimeType,
                    data: imageBuffer.toString("base64"),
                  },
                },
                prompt,
              ],
              config: {
                responseMimeType: "application/json",
              },
            }),
            6000
          );
          success = true;
          break;
        } catch (altErr: any) {
          console.warn(
            `[CivicResolve Image Analysis] Alt model ${altModel} failed:`,
            altErr?.message || altErr
          );
        }
      }
      if (!success) {
        throw primaryErr;
      }
    }

    const textOutput = response.text?.trim() || "";
    if (!textOutput) {
      throw new Error("Gemini returned empty analysis for the image.");
    }

    const parsed = JSON.parse(textOutput);

    // Validate category
    let category: Category = "Other";
    if (CATEGORIES.includes(parsed.category)) {
      category = parsed.category;
    }

    return NextResponse.json({
      success: true,
      title: parsed.title || "Civic issue detected in photograph",
      description: parsed.description || "Issue identified from uploaded photograph.",
      category,
    });
  } catch (error: any) {
    console.error("❌ [CivicResolve /api/analyze-image Error]:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to analyze photo with Gemini AI.",
      },
      { status: 500 }
    );
  }
}
