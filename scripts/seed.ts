import fs from "fs/promises";
import path from "path";
import { Complaint } from "../lib/types";

const DB_PATH = path.join(process.cwd(), "data", "complaints.json");

const SAMPLE_COMPLAINTS: Complaint[] = [
  {
    id: "CR-10245",
    title: "Overflowing garbage dump attracting stray animals and blocking sidewalk",
    description:
      "A large pile of uncollected domestic and commercial waste has spilled across the pedestrian walkway near the main market. Stray animals are scattering plastic and organic waste, creating strong foul odors and walking hazards.",
    location: "12th Main, 4th Block, Koramangala, Bengaluru",
    category: "Garbage & Sanitation",
    priority: "High",
    department: "Solid Waste Management Department",
    status: "Reported",
    aiSummary: "Major uncollected waste heap blocking sidewalk near residential apartments.",
    aiReasoning:
      "High sanitation and hygiene risk due to animal scavenging and foot-traffic obstruction near homes.",
    suggestedAction: "Dispatch waste collection compactors to clear accumulated debris and sanitize perimeter.",
    estimatedResolution: "24-48 hours",
    aiSource: "gemini",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "CR-21873",
    title: "Exposed underground power cables sparked after rain near bus stop",
    description:
      "Heavy rains exposed underground electrical junction cables right next to the crowded commuter bus stop shelter. Commuters reported loud snapping sparks and smoke coming from the damp soil.",
    location: "Opposite Bus Stop, S.V. Road, Andheri West, Mumbai",
    category: "Public Safety",
    priority: "Critical",
    department: "Public Safety & Emergency Services",
    status: "In Progress",
    aiSummary: "Exposed live electrical wiring sparking near high-traffic commuter bus shelter.",
    aiReasoning:
      "Critical life safety hazard due to electrocution danger in a pedestrian corridor during wet weather.",
    suggestedAction: "Cordon off danger zone immediately and dispatch rapid-response technical emergency crew.",
    estimatedResolution: "12-24 hours",
    aiSource: "gemini",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "CR-33910",
    title: "Drinking water main pipeline burst gushing thousands of liters",
    description:
      "A 6-inch primary municipal potable water pipeline ruptured underneath the road shoulder. Clean drinking water is shooting up into the air and flooding the roadway, dropping tap water pressure for the surrounding colony.",
    location: "Near Usman Road Flyover, T. Nagar, Chennai",
    category: "Water Supply & Leakage",
    priority: "High",
    department: "Water Supply & Sewerage Board",
    status: "In Progress",
    aiSummary: "Ruptured 6-inch freshwater supply line flooding street and wasting drinking water.",
    aiReasoning:
      "High urgency due to large-scale municipal clean water loss and disruption to local neighborhood water supply.",
    suggestedAction: "Isolate distribution line valve, excavate break point, and install pipe repair clamp.",
    estimatedResolution: "24-48 hours",
    aiSource: "gemini",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "CR-45129",
    title: "Open storm drain without safety slab on primary school route",
    description:
      "Concrete cover slab broke and fell into the storm drainage canal. The open pit is approximately 5 feet deep with sharp rebar edges, situated directly along the walking route to the primary school.",
    location: "Road No. 36, Near Oakridge School, Jubilee Hills, Hyderabad",
    category: "Drainage & Sewage",
    priority: "Critical",
    department: "Stormwater Drainage & Sewage Operations",
    status: "Reported",
    aiSummary: "Uncovered deep storm drain trench poses immediate fall hazard to schoolchildren.",
    aiReasoning:
      "Critical rating due to direct threat of severe physical injury or fatal falls for young pedestrians walking along this route.",
    suggestedAction: "Deploy high-pressure jetting and vacuum suction unit to clear clogged sewer conduit and fit new safety slab.",
    estimatedResolution: "12-24 hours",
    aiSource: "gemini",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "CR-58204",
    title: "Multiple street lights dead creating complete blackout on residential lane",
    description:
      "Four consecutive sodium streetlamps on Lane 5 are not lighting up at night. The 200-meter stretch is in pitch blackness, causing safety concerns for women and elderly residents returning home after dark.",
    location: "Lane 5, Sector 18, Noida",
    category: "Street Lighting",
    priority: "Medium",
    department: "Municipal Electrical & Public Lighting Division",
    status: "In Progress",
    aiSummary: "Four consecutive non-functional streetlights causing dark stretch of 200 meters.",
    aiReasoning:
      "Medium priority for pedestrian security concerns after sunset in a quiet residential sector.",
    suggestedAction: "Deploy aerial line-truck crew to replace damaged luminaires and inspect junction box wiring.",
    estimatedResolution: "2-3 days",
    aiSource: "gemini",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "CR-62941",
    title: "Series of dangerous asphalt depressions and potholes after monsoon showers",
    description:
      "Multiple potholes formed on the downhill turn near Goodluck Cafe. Two-wheelers were frequently skidding on loose gravel. Road repair crew deployed cold asphalt patching.",
    location: "FC Road, Near Goodluck Cafe, Shivajinagar, Pune",
    category: "Road & Potholes",
    priority: "Medium",
    department: "Public Works & Road Maintenance Division",
    status: "Resolved",
    aiSummary: "Cluster of asphalt potholes patched and resurfaced with bitumen mix.",
    aiReasoning:
      "Road deterioration causing vehicle bumper scrapes and reduced traffic flow during peak hours.",
    suggestedAction: "Deploy asphalt road repair gang with cold bituminous mix to level and patch damaged surface.",
    estimatedResolution: "2-3 days",
    aiSource: "gemini",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "CR-74815",
    title: "Faded pedestrian zebra crossing marks and damaged directional sign board",
    description:
      "White reflective zebra crossing paint has completely worn off over time, making it hard for vehicles to see pedestrian crossings. The overhead direction signboard is also tilting.",
    location: "Outer Circle, Near Block C, Connaught Place, New Delhi",
    category: "Other",
    priority: "Low",
    department: "Traffic & Road Infrastructure Cell",
    status: "Resolved",
    aiSummary: "Repainting of weathered pedestrian crossing lines and straightened directional signage.",
    aiReasoning:
      "Low safety urgency; routine road maintenance and cosmetic civic infrastructure upkeep.",
    suggestedAction: "Conduct on-site inspection, repaint crossing lines, and remount directional signage.",
    estimatedResolution: "3-5 days",
    aiSource: "gemini",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "CR-89230",
    title: "Raw sewage backflow from clogged inspection chamber onto main walkway",
    description:
      "Inspection chamber overflowed during peak morning hours, spreading foul effluent onto the paved footpath near the metro station staircase. Municipal suction truck was dispatched to clear the silt blockage.",
    location: "Sector 1, Near Karunamoyee Metro, Salt Lake, Kolkata",
    category: "Drainage & Sewage",
    priority: "High",
    department: "Stormwater Drainage & Sewage Operations",
    status: "Resolved",
    aiSummary: "Sanitary sewer overflow jet-cleaned and cleared by municipal suction truck.",
    aiReasoning:
      "High public health hazard with foul effluent overflowing into a high-footfall metro transit zone.",
    suggestedAction: "Deploy high-pressure jetting and vacuum suction unit to clear clogged sewer conduit.",
    estimatedResolution: "24-48 hours",
    aiSource: "gemini",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

async function seed() {
  console.log("🌱 Running CivicResolve seed script...");

  try {
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

    // Ensure all existing complaints also have suggestedAction and estimatedResolution
    for (const c of existing) {
      if (!c.suggestedAction) {
        c.suggestedAction =
          c.category === "Road & Potholes"
            ? "Deploy road repair crew with cold/hot bituminous asphalt mix to level and patch damaged surface."
            : c.category === "Garbage & Sanitation"
            ? "Dispatch waste collection compactors to clear accumulated debris and sanitize perimeter."
            : c.category === "Street Lighting"
            ? "Deploy aerial line-truck crew to replace damaged luminaires and inspect junction box wiring."
            : c.category === "Water Supply & Leakage"
            ? "Isolate distribution line valve, excavate break point, and install pipe repair clamp."
            : c.category === "Drainage & Sewage"
            ? "Deploy high-pressure jetting and vacuum suction unit to clear clogged sewer conduit."
            : c.category === "Public Safety"
            ? "Cordon off danger zone immediately and dispatch rapid-response technical emergency crew."
            : "Conduct on-site inspection and route grievance to the appropriate ward officer.";
      }
      if (!c.estimatedResolution) {
        c.estimatedResolution =
          c.priority === "Critical"
            ? "12-24 hours"
            : c.priority === "High"
            ? "24-48 hours"
            : c.priority === "Medium"
            ? "2-3 days"
            : "3-5 days";
      }
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
