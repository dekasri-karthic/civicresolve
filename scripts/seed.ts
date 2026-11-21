import fs from "fs/promises";
import path from "path";
import { Complaint } from "../lib/types";
import { SAMPLE_COMPLAINTS } from "../lib/sample-data";
import { DB_PATH, DATA_DIR } from "../lib/db";

async function seed() {
  console.log("🌱 Running CivicResolve seed script...");

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    let existing: Complaint[] = [];
    try {
      const raw = await fs.readFile(DB_PATH, "utf8");
      existing = JSON.parse(raw);
      if (!Array.isArray(existing)) {
        existing = [];
      }
    } catch {
      existing = [];
    }

    const existingIds = new Set(existing.map((c) => c.id));
    let addedCount = 0;

    for (const sample of SAMPLE_COMPLAINTS) {
      if (!existingIds.has(sample.id)) {
        existing.push(sample);
        existingIds.add(sample.id);
        addedCount++;
      }
    }

    // Sort newest first
    existing.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    await fs.writeFile(DB_PATH, JSON.stringify(existing, null, 2), "utf8");

    console.log(
      `✅ Seeding complete! Added ${addedCount} new sample complaint(s). Total complaints: ${existing.length}`
    );
  } catch (error) {
    console.error("❌ Failed to seed complaints:", error);
    process.exit(1);
  }
}

seed();
