import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { totalWeightKg, companyName } = body;

    // Simulate AI processing delay (1.5s - 2.5s)
    const delay = Math.floor(Math.random() * 1000) + 1500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Hard anomaly triggers for testing:
    // 1. If company name includes "anomaly" or "fraud"
    const nameLower = (companyName || "").toLowerCase();
    if (nameLower.includes("anomaly") || nameLower.includes("fraud")) {
      return NextResponse.json(
        { 
          status: "anomaly", 
          message: "AI flagged this order due to suspicious company identity patterns." 
        },
        { status: 400 }
      );
    }

    // 2. If weight is exactly 999
    if (totalWeightKg === 999) {
      return NextResponse.json(
        { 
          status: "anomaly", 
          message: "AI flagged this order: Unusual exact weight boundary detected." 
        },
        { status: 400 }
      );
    }

    // 3. Random 10% chance for simulation (only if weight > 100kg to avoid annoying small orders)
    if (totalWeightKg > 100 && Math.random() < 0.1) {
      return NextResponse.json(
        { 
          status: "anomaly", 
          message: "AI Risk Engine flagged this logistics profile as high risk for cold-chain failure." 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error in validate-order route:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to validate order." },
      { status: 500 }
    );
  }
}
