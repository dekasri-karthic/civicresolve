import { NextRequest, NextResponse } from "next/server";
import { updateComplaintStatus } from "@/lib/db";
import { ComplaintStatus } from "@/lib/types";

const VALID_STATUSES: ComplaintStatus[] = ["Reported", "In Progress", "Resolved"];

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Complaint ID is required." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updated = await updateComplaintStatus(id, status);

    if (!updated) {
      return NextResponse.json(
        { error: `Complaint with ID "${id}" was not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating complaint status:", error);
    return NextResponse.json(
      { error: "Failed to update complaint status: " + error.message },
      { status: 500 }
    );
  }
}
