import { NextRequest, NextResponse } from "next/server";
import { llama } from "@/lib/llama";

export async function GET(req: NextRequest) {
  try {
    const jobId = req.nextUrl.searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "Missing jobId" },
        { status: 400 }
      );
    }

    const result = await llama.parsing.get(jobId, {
      expand: ["markdown"],
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch parse status",
      },
      {
        status: 500,
      }
    );
  }
}