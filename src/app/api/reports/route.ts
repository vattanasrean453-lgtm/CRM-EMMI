import { NextResponse } from "next/server";
import { getSheetValues, appendSheetValues } from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID_REPORTS;
    if (!sheetId) {
      return NextResponse.json({ configured: false, reports: [] });
    }

    const rows = await getSheetValues(sheetId, "'DailyReports'!A2:H");
    const reports = rows
      .filter((r) => r && r[0])
      .map((row, idx) => ({
        id: `daily-report-${idx}-${row[7] || Date.now()}`,
        seller: row[0] || "",
        date: row[1] || "",
        chatGuests: Number(row[2]) || 0,
        chatTarget: Number(row[3]) || 0,
        oldCustomerBoxes: Number(row[4]) || 0,
        soldCount: Number(row[5]) || 0,
        activities: row[6] || "",
        submittedAt: row[7] || "",
      }));

    return NextResponse.json({ configured: true, reports });
  } catch (err: any) {
    console.error("Error fetching reports:", err);
    return NextResponse.json(
      { configured: false, error: err.message, reports: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID_REPORTS;
    if (!sheetId) {
      return NextResponse.json(
        { ok: false, message: "Missing GOOGLE_SHEET_ID_REPORTS" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { seller, date, chatGuests, chatTarget, oldCustomerBoxes, soldCount, activities } = body;

    const submittedAt = new Date().toISOString();
    const row = [
      seller || "",
      date || new Date().toISOString().slice(0, 10),
      chatGuests ?? 0,
      chatTarget ?? 0,
      oldCustomerBoxes ?? 0,
      soldCount ?? 0,
      activities || "",
      submittedAt,
    ];

    await appendSheetValues(sheetId, "'DailyReports'!A:H", [row]);

    return NextResponse.json({ ok: true, submittedAt });
  } catch (err: any) {
    console.error("Error submitting report:", err);
    return NextResponse.json(
      { ok: false, message: err.message },
      { status: 500 }
    );
  }
}
