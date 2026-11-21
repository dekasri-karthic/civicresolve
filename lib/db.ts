import fs from "fs/promises";
import path from "path";
import { Complaint, ComplaintStatus } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "complaints.json");

// Ensure the data directory and complaints.json exist
async function ensureDbExists(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify([], null, 2), "utf8");
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
