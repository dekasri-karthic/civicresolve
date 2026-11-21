import fs from "fs/promises";
import path from "path";
import os from "os";
import { Complaint, ComplaintStatus } from "./types";
import { SAMPLE_COMPLAINTS } from "./sample-data";

// In production (Cloud Run, Docker containers, etc.), store data and uploads in os.tmpdir()
const isProduction = process.env.NODE_ENV === "production" || !!process.env.K_SERVICE;

export const DATA_DIR = isProduction
  ? path.join(os.tmpdir(), "civicresolve-data")
  : path.join(process.cwd(), "data");

export const UPLOADS_DIR = isProduction
  ? path.join(os.tmpdir(), "civicresolve-uploads")
  : path.join(process.cwd(), "public", "uploads");

export const DB_PATH = path.join(DATA_DIR, "complaints.json");

// Ensure data directory, uploads directory, and complaints.json exist
async function ensureDbExists(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(UPLOADS_DIR, { recursive: true });

    // Check if complaints.json already exists and has content
    try {
      const stats = await fs.stat(DB_PATH);
      if (stats.size > 2) {
        return;
      }
    } catch {
      // File does not exist, proceed to create
    }

    // If running in production / os.tmpdir(), try to copy existing complaints from process.cwd()/data/complaints.json
    const localDbPath = path.join(process.cwd(), "data", "complaints.json");
    if (localDbPath !== DB_PATH) {
      try {
        const localData = await fs.readFile(localDbPath, "utf8");
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          await fs.writeFile(DB_PATH, JSON.stringify(parsed, null, 2), "utf8");
          return;
        }
      } catch {
        // Fall back to sample complaints
      }
    }

    // Create the data file from the 8 sample complaints if missing
    await fs.writeFile(DB_PATH, JSON.stringify(SAMPLE_COMPLAINTS, null, 2), "utf8");
  } catch (err) {
    console.error("[CivicResolve Storage] Error initializing storage:", err);
  }
}

export async function getComplaints(): Promise<Complaint[]> {
  await ensureDbExists();
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      return [];
    }
    // Return sorted newest first
    return data.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("[CivicResolve DB] Error reading complaints.json:", error);
    return [];
  }
}

export async function getComplaintById(id: string): Promise<Complaint | null> {
  const complaints = await getComplaints();
  return complaints.find((c) => c.id === id) || null;
}

export async function createComplaint(
  data: Omit<Complaint, "id" | "createdAt" | "updatedAt">
): Promise<Complaint> {
  await ensureDbExists();
  const complaints = await getComplaints();

  // Create clean short readable ID (e.g. CR-1042 or random 5-digit number)
  const id = `CR-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date().toISOString();

  const newComplaint: Complaint = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  // Prepend to list
  const updatedList = [newComplaint, ...complaints];
  await fs.writeFile(DB_PATH, JSON.stringify(updatedList, null, 2), "utf8");

  return newComplaint;
}

export async function updateComplaintStatus(
  id: string,
  status: ComplaintStatus
): Promise<Complaint | null> {
  await ensureDbExists();
  const complaints = await getComplaints();
  const index = complaints.findIndex((c) => c.id === id);

  if (index === -1) {
    return null;
  }

  complaints[index] = {
    ...complaints[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(DB_PATH, JSON.stringify(complaints, null, 2), "utf8");
  return complaints[index];
}

export async function saveAllComplaints(complaints: Complaint[]): Promise<void> {
  await ensureDbExists();
  await fs.writeFile(DB_PATH, JSON.stringify(complaints, null, 2), "utf8");
}
