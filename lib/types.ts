export type Category =
  | "Road & Potholes"
  | "Garbage & Sanitation"
  | "Street Lighting"
  | "Water Supply & Leakage"
  | "Drainage & Sewage"
  | "Public Safety"
  | "Other";

export const CATEGORIES: Category[] = [
  "Road & Potholes",
  "Garbage & Sanitation",
  "Street Lighting",
  "Water Supply & Leakage",
  "Drainage & Sewage",
  "Public Safety",
  "Other",
];

export type Priority = "Low" | "Medium" | "High" | "Critical";

export const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Critical"];

export type ComplaintStatus = "Reported" | "In Progress" | "Resolved";

export interface ClassificationResult {
  category: Category;
  priority: Priority;
  department: string;
  summary: string;
  reasoning: string;
  source: "gemini" | "fallback";
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  location: string;
  category: Category;
  priority: Priority;
  department: string;
  status: ComplaintStatus;
  imageUrl?: string;
  aiSummary: string;
  aiReasoning: string;
  aiSource: "gemini" | "fallback";
  createdAt: string;
  updatedAt: string;
}
