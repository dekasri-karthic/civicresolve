import { GoogleGenAI } from "@google/genai";
import { Category, CATEGORIES, ClassificationResult, Priority, PRIORITIES } from "./types";

interface ClassifyInput {
  title: string;
  description: string;
  location?: string;
  imageBuffer?: Buffer;
  imageMimeType?: string;
}

// Department mapping for categories
const CATEGORY_DEPARTMENTS: Record<Category, string> = {
  "Road & Potholes": "Public Works & Road Maintenance Division",
  "Garbage & Sanitation": "Solid Waste Management Department",
  "Street Lighting": "Municipal Electrical & Public Lighting Division",
  "Water Supply & Leakage": "Water Supply & Sewerage Board",
  "Drainage & Sewage": "Stormwater Drainage & Sewage Operations",
  "Public Safety": "Public Safety & Emergency Services",
  Other: "General Grievance Cell",
};

/**
 * Robust Keyword Fallback Classifier
 * Ensures demo never breaks even if offline, invalid key, or quota limit hit.
 */
export function classifyWithFallback(
  input: ClassifyInput,
  reason: string
): ClassificationResult {
  const text = `${input.title} ${input.description} ${input.location || ""}`.toLowerCase();

  let category: Category = "Other";

  // Category keyword patterns
  if (
    text.includes("pothole") ||
    text.includes("road") ||
    text.includes("asphalt") ||
    text.includes("crater") ||
    text.includes("speed bump") ||
    text.includes("footpath") ||
    text.includes("pavement") ||
    text.includes("tar")
  ) {
    category = "Road & Potholes";
  } else if (
    text.includes("garbage") ||
    text.includes("trash") ||
    text.includes("waste") ||
    text.includes("dump") ||
    text.includes("bin") ||
    text.includes("litter") ||
    text.includes("debris") ||
    text.includes("smell") ||
    text.includes("stench")
  ) {
    category = "Garbage & Sanitation";
  } else if (
    text.includes("light") ||
    text.includes("lamp") ||
    text.includes("dark") ||
    text.includes("street light") ||
    text.includes("streetlight") ||
    text.includes("bulb") ||
    text.includes("pole")
  ) {
    category = "Street Lighting";
  } else if (
    text.includes("water") ||
    text.includes("leak") ||
    text.includes("pipe") ||
    text.includes("pipeline") ||
    text.includes("tap") ||
    text.includes("drinking water") ||
    text.includes("burst")
  ) {
    category = "Water Supply & Leakage";
  } else if (
    text.includes("drain") ||
    text.includes("sewage") ||
    text.includes("sewer") ||
    text.includes("gutter") ||
    text.includes("overflow") ||
    text.includes("clog") ||
    text.includes("stagnant") ||
    text.includes("manhole")
  ) {
    category = "Drainage & Sewage";
  } else if (
    text.includes("wire") ||
    text.includes("shock") ||
    text.includes("danger") ||
    text.includes("hazard") ||
    text.includes("fire") ||
    text.includes("accident") ||
    text.includes("collapse") ||
    text.includes("emergency") ||
    text.includes("tree fall") ||
    text.includes("safety")
  ) {
    category = "Public Safety";
  }

  // Priority detection
  let priority: Priority = "Medium";
  const criticalWords = [
    "danger",
    "deadly",
    "severe",
    "sparking",
    "live wire",
    "open manhole",
    "sinkhole",
    "accident",
    "emergency",
    "burst pipe",
    "flooding homes",
    "electric shock",
  ];
  const highWords = [
    "urgent",
    "major",
    "deep",
    "school",
    "hospital",
    "busy road",
    "overflowing",
    "blocked",
    "no water",
    "blackout",
    "huge",
  ];
  const lowWords = ["minor", "small", "dim", "flickering", "cosmetic", "paint", "delay"];

  if (criticalWords.some((w) => text.includes(w))) {
    priority = "Critical";
  } else if (highWords.some((w) => text.includes(w))) {
    priority = "High";
  } else if (lowWords.some((w) => text.includes(w))) {
    priority = "Low";
  }

  const department = CATEGORY_DEPARTMENTS[category];
  const summary = `${category} issue reported at ${input.location || "unspecified location"}: ${input.title}`;
  const reasoning = `Keyword-based triage identified keywords related to ${category}. Assigned ${priority} priority based on safety and situational risk indicators.`;

  return {
    category,
    priority,
    department,
    summary,
    reasoning,
    source: "fallback",
  };
}

/**
 * Server-side Gemini AI Classifier
 */
export async function classifyComplaint(
  input: ClassifyInput
): Promise<ClassificationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  // Check if API key is missing or still placeholder
  if (!apiKey || apiKey.trim() === "" || apiKey === "placeholder" || apiKey.includes("your_")) {
    const errorMsg =
      "GEMINI_API_KEY is not set or is still a placeholder in .env.local.";
    console.error(`[CivicResolve Classification] ${errorMsg} Using fallback.`);
    return classifyWithFallback(input, errorMsg);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const promptText = `You are the municipal intelligence triage system for CivicResolve.
Analyze the following civic grievance report and classify it into structured JSON.

Report Details:
- Title: ${input.title}
- Description: ${input.description}
- Location: ${input.location || "Not specified"}

Available Categories (MUST choose exactly one):
${JSON.stringify(CATEGORIES)}

Priority Levels (MUST choose exactly one):
- "Critical": Imminent danger to life/limb, exposed live wires, massive sinkhole, sewer flood into homes, major emergency.
- "High": Significant safety risk, major road obstruction, entire block blackout, contaminated water supply, active water main break.
- "Medium": Standard civic problem causing disruption, moderate pothole, broken streetlight, overflowing public trash bin.
- "Low": Minor inconvenience, cosmetic issue, small puddle, dim light, early-stage wear.

Your response MUST be strict JSON with these exact keys:
{
  "category": "<one of the 7 allowed categories>",
  "priority": "<Low | Medium | High | Critical>",
  "department": "<recommended municipal department name, e.g. Public Works Department (PWD)>",
  "summary": "<one clean single-line summary of the grievance>",
  "reasoning": "<1-2 concise sentences explaining why this category and priority were chosen>"
}`;

    // Prepare contents: optional multimodal image + prompt
    const contents: any[] = [];
    if (input.imageBuffer && input.imageMimeType) {
      contents.push({
        inlineData: {
          mimeType: input.imageMimeType,
          data: input.imageBuffer.toString("base64"),
        },
      });
    }
    contents.push(promptText);

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        responseMimeType: "application/json",
      },
    });

    const textOutput = response.text?.trim() || "";
    if (!textOutput) {
      throw new Error("Gemini returned an empty response.");
    }

    // Parse JSON
    const parsed = JSON.parse(textOutput);

    // Validate fields
    if (!CATEGORIES.includes(parsed.category)) {
      throw new Error(`Invalid category returned by Gemini: "${parsed.category}"`);
    }

    if (!PRIORITIES.includes(parsed.priority)) {
      throw new Error(`Invalid priority returned by Gemini: "${parsed.priority}"`);
    }

    if (!parsed.department || typeof parsed.department !== "string") {
      parsed.department = CATEGORY_DEPARTMENTS[parsed.category as Category];
    }

    if (!parsed.summary || typeof parsed.summary !== "string") {
      parsed.summary = input.title;
    }

    if (!parsed.reasoning || typeof parsed.reasoning !== "string") {
      parsed.reasoning = `Categorized as ${parsed.category} with ${parsed.priority} priority.`;
    }

    return {
      category: parsed.category as Category,
      priority: parsed.priority as Priority,
      department: parsed.department,
      summary: parsed.summary,
      reasoning: parsed.reasoning,
      source: "gemini",
    };
  } catch (error: any) {
    // Crucial requirement: Log real error to terminal so user can debug
    console.error(
      "❌ [CivicResolve Classification Error] Gemini classification failed:",
      error?.message || error
    );
    if (error?.stack) {
      console.error(error.stack);
    }
    return classifyWithFallback(input, error?.message || "Gemini API error");
  }
}
