import { NextResponse } from "next/server";
import { getSheetValues, appendSheetValues, updateSheetValues } from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID_REPORTS;
    if (!sheetId) {
      return NextResponse.json({ configured: false, events: [] });
    }

    const rows = await getSheetValues(sheetId, "'FollowUpHistory'!A2:M");
    const events = rows
      .filter((r) => r && r[0])
      .map((row, idx) => ({
        id: `followup-event-${idx}`,
        customerId: row[0] || "",
        buyerName: row[1] || "",
        phone: row[2] || "",
        location: row[3] || "",
        seller: row[4] || "",
        followUpDate: row[5] || "",
        method: row[6] || "",
        status: row[7] || "",
        boxes: Number(row[8]) || 0,
        nextFollowUp: row[9] || "",
        expectedRunout: row[10] || "",
        note: row[11] || "",
        updatedAt: row[12] || "",
      }));

    return NextResponse.json({ configured: true, events });
  } catch (err: any) {
    console.error("Error fetching follow-up events:", err);
    return NextResponse.json(
      { configured: false, error: err.message, events: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const sheetIdReports = process.env.GOOGLE_SHEET_ID_REPORTS;
    const sheetIdData = process.env.GOOGLE_SHEET_ID_DATA;

    const body = await req.json();
    const {
      customer,
      actor,
      followUpDate,
      method,
      status,
      note,
      nextFollowUp,
      boxes,
      expectedRunout,
      rowIndex, // if provided, row index in Customer Follow-up sheet
    } = body;

    const updatedAt = new Date().toISOString();

    // 1. Log to FollowUpHistory in Reports sheet
    if (sheetIdReports) {
      const historyRow = [
        customer?.id || "",
        customer?.name || "",
        customer?.phone || "",
        customer?.location || "",
        actor || customer?.sellerId || "",
        followUpDate || updatedAt.slice(0, 10),
        method || "តាមឆាត",
        status || customer?.status || "",
        boxes ?? customer?.boxes ?? 1,
        nextFollowUp || "",
        expectedRunout || "",
        note || "",
        updatedAt,
      ];
      await appendSheetValues(sheetIdReports, "'FollowUpHistory'!A:M", [historyRow]);
    }

    // 2. If customer has a specific row in 'Customer Follow-up ', update that row in Emmi Data sheet
    if (sheetIdData && rowIndex && rowIndex >= 7) {
      // Map columns: F=ថ្ងៃត្រូវ Follow-up, H=ស្ថានភាព, M=កំណត់សម្គាល់ចុងក្រោយ, O=Follow up តាម
      const updateData = [
        [
          nextFollowUp || "", // Col F
          "",                 // Col G
          status || "",       // Col H
          "",                 // Col I
          "",                 // Col J
          expectedRunout || "", // Col K
          "",                 // Col L
          note || "",         // Col M
          "",                 // Col N
          method || "",       // Col O
        ]
      ];
      await updateSheetValues(sheetIdData, `'Customer Follow-up '!F${rowIndex}:O${rowIndex}`, updateData);
    }

    return NextResponse.json({ ok: true, updatedAt });
  } catch (err: any) {
    console.error("Error logging follow-up:", err);
    return NextResponse.json(
      { ok: false, message: err.message },
      { status: 500 }
    );
  }
}
