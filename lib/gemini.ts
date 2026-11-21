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

// Sensible default actions for fallback
const CATEGORY_ACTIONS: Record<Category, string> = {
  "Road & Potholes": "Deploy road repair crew with cold/hot bituminous asphalt mix to level and patch damaged surface.",
  "Garbage & Sanitation": "Dispatch waste collection compactors to clear accumulated debris and sanitize perimeter.",
  "Street Lighting": "Deploy aerial line-truck crew to replace damaged luminaires and inspect junction box wiring.",
  "Water Supply & Leakage": "Isolate the distribution line valve, excavate break point, and install pipe repair clamp.",
  "Drainage & Sewage": "Deploy high-pressure jetting and vacuum suction unit to clear clogged sewer conduit.",
  "Public Safety": "Cordon off danger zone immediately and dispatch rapid-response technical emergency crew.",
  Other: "Conduct on-site inspection and route grievance to the appropriate ward officer.",
};

// Sensible resolution estimates based on priority
const PRIORITY_RESOLUTION_TIMES: Record<Priority, string> = {
  Critical: "12-24 hours",
  High: "24-48 hours",
  Medium: "2-3 days",
  Low: "3-5 days",
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

  // Category keyword patterns (including common Indian transliterations)
  if (
    text.includes("pothole") ||
    text.includes("road") ||
    text.includes("asphalt") ||
    text.includes("crater") ||
    text.includes("speed bump") ||
    text.includes("footpath") ||
    text.includes("pavement") ||
    text.includes("tar") ||
    text.includes("pallam") ||
    text.includes("kuzhi") ||
    text.includes("gaddha") ||
    text.includes("sadak") ||
    text.includes("ரோடு") ||
    text.includes("பள்ளம்")
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
    text.includes("stench") ||
    text.includes("kuppa") ||
    text.includes("kachra") ||
    text.includes("குப்பை")
  ) {
    category = "Garbage & Sanitation";
  } else if (
    text.includes("light") ||
    text.includes("lamp") ||
    text.includes("dark") ||
    text.includes("street light") ||
    text.includes("streetlight") ||
    text.includes("bulb") ||
    text.includes("pole") ||
    text.includes("vilakku") ||
    text.includes("bijli") ||
    text.includes("விளக்கு")
  ) {
    category = "Street Lighting";
  } else if (
    text.includes("water") ||
    text.includes("leak") ||
    text.includes("pipe") ||
    text.includes("pipeline") ||
    text.includes("tap") ||
    text.includes("drinking water") ||
    text.includes("burst") ||
    text.includes("thani") ||
    text.includes("neer") ||
    text.includes("paani") ||
    text.includes("தண்ணீர்")
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
    text.includes("manhole") ||
    text.includes("saakkadai") ||
    text.includes("சாக்கடை")
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
    text.includes("safety") ||
    text.includes("vibhathu") ||
    text.includes("ஆபத்து") ||
    text.includes("விபத்து")
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
    "ஆபத்து",
    "விபத்து",
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
    "பெரிய",
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
  const suggestedAction = CATEGORY_ACTIONS[category];
  const estimatedResolution = PRIORITY_RESOLUTION_TIMES[priority];

  return {
    category,
    priority,
    department,
    summary,
    reasoning,
    suggestedAction,
    estimatedResolution,
    source: "fallback",
  };
}

/**
 * Server-side Gemini AI Classifier with Multilingual Comprehension & Action Recommendations
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

CRITICAL MULTILINGUAL INSTRUCTION:
The user report (Title, Description, Location) may be written in ANY language (such as Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, Marathi, Spanish, etc.) or transliterated script.
You MUST comprehend the meaning regardless of the language or script, and translate/output ALL JSON values strictly in standard, fluent ENGLISH.

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
  "summary": "<one clean single-line summary of the grievance in English>",
  "reasoning": "<1-2 concise sentences explaining why this category and priority were chosen, in English>",
  "suggestedAction": "<one clear line instructing the department on the exact field or technical action to take, in English>",
  "estimatedResolution": "<realistic timeframe, e.g. '12-24 hours', '24-48 hours', '2-3 days', or '3-5 days'>"
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

    let response;
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          responseMimeType: "application/json",
        },
      });
    } catch (primaryErr: any) {
      console.warn(
        `[CivicResolve Classification] Primary model (${modelName}) encountered an issue, retrying with resilient model...`,
        primaryErr?.message || primaryErr
      );
      await new Promise((r) => setTimeout(r, 1200));
      const altModel = modelName === "gemini-2.5-flash" ? "gemini-2.0-flash" : "gemini-2.5-flash";
      try {
        response = await ai.models.generateContent({
          model: altModel,
          contents,
          config: {
            responseMimeType: "application/json",
          },
        });
      } catch {
        throw primaryErr;
      }
    }

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

    const category = parsed.category as Category;
    const priority = parsed.priority as Priority;

    const department =
      parsed.department && typeof parsed.department === "string"
        ? parsed.department
        : CATEGORY_DEPARTMENTS[category];

    const summary =
      parsed.summary && typeof parsed.summary === "string"
        ? parsed.summary
        : input.title;

    const reasoning =
      parsed.reasoning && typeof parsed.reasoning === "string"
        ? parsed.reasoning
        : `Categorized as ${category} with ${priority} priority.`;

    const suggestedAction =
      parsed.suggestedAction && typeof parsed.suggestedAction === "string"
        ? parsed.suggestedAction
        : CATEGORY_ACTIONS[category];

    const estimatedResolution =
      parsed.estimatedResolution && typeof parsed.estimatedResolution === "string"
        ? parsed.estimatedResolution
        : PRIORITY_RESOLUTION_TIMES[priority];

    return {
      category,
      priority,
      department,
      summary,
      reasoning,
      suggestedAction,
      estimatedResolution,
      source: "gemini",
    };
  } catch (error: any) {
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
