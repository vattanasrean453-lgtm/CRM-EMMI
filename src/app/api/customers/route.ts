import { NextResponse } from "next/server";
import { getSheetValues } from "@/lib/googleSheets";

export const dynamic = "force-dynamic";

const monthsMap: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  "1": "01", "2": "02", "3": "03", "4": "04", "5": "05", "6": "06",
  "7": "07", "8": "08", "9": "09", "10": "10", "11": "11", "12": "12",
};

export async function GET() {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID_DATA;
    if (!sheetId) {
      return NextResponse.json({ configured: false, customers: [], sales: [] });
    }

    // 1. Fetch sales from 'Master data'
    const masterRows = await getSheetValues(sheetId, "'Master data'!A4:R1600");
    const rawSales = masterRows.filter(
      (r) => r && r[3] && r[3].trim().toLowerCase() === "sale" && r[8]
    );

    const sales = rawSales.map((r, idx) => {
      const rawDay = (r[0] || "1").trim().padStart(2, "0");
      const rawMonth = (r[1] || "10").trim();
      const rawYear = (r[2] || "2026").trim();
      const m = monthsMap[rawMonth] || "10";
      const formattedDate = `${rawYear}-${m}-${rawDay}`;

      const seller = (r[9] || "").trim();
      const quantity = parseFloat(r[10]) || 1;
      const location = (r[11] || "").trim();
      const phone = (r[15] || "").trim().replace(/[^0-9]/g, "");
      const customerName = (r[16] || "").trim();

      return {
        id: `sale-${idx + 4}`,
        date: formattedDate,
        product: r[7] || "Emmi",
        team: r[8] || "",
        seller,
        quantity,
        location,
        phone,
        customerName,
      };
    });

    const todayDate = new Date(); // e.g. 2026-10-31
    const todayStr = todayDate.toISOString().slice(0, 10);

    // 2. Aggregate sales into unique Customers
    const customerMap = new Map<string, any>();

    sales.forEach((s) => {
      let key = "";
      if (s.phone && s.phone.length >= 8) {
        key = `phone:${s.phone}`;
      } else if (s.customerName) {
        key = `name:${s.customerName.toLowerCase()}:${s.seller.toLowerCase()}`;
      } else {
        key = `loc:${s.seller.toLowerCase()}:${s.location.toLowerCase()}:${s.date}`;
      }

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: `cust-${customerMap.size + 1}`,
          key,
          name: s.customerName || (s.location ? `ភ្ញៀវ (${s.location})` : "ភ្ញៀវថ្មី"),
          phone: s.phone ? (s.phone.startsWith("0") ? s.phone : "0" + s.phone) : "មិនទាន់មានលេខ",
          location: s.location || "មិនបានបញ្ជាក់",
          sellerId: s.seller,
          purchaseDate: s.date,
          firstPurchaseDate: s.date,
          totalPurchases: 1,
          totalBoxes: s.quantity,
          boxes: s.quantity,
          status: "using",
          followUpCount: 0,
          nextFollowUp: "",
          expectedOutDate: "",
          isNearRunout: false,
          isDueToday: false,
          isOverdue: false,
          overdueDays: 0,
          history: [s],
        });
      } else {
        const c = customerMap.get(key)!;
        c.totalPurchases += 1;
        c.totalBoxes += s.quantity;
        if (s.date >= c.purchaseDate) {
          c.purchaseDate = s.date;
          c.boxes = s.quantity;
          if (s.customerName) c.name = s.customerName;
          if (s.phone) c.phone = s.phone.startsWith("0") ? s.phone : "0" + s.phone;
          if (s.location) c.location = s.location;
          if (s.seller) c.sellerId = s.seller;
        }
        c.history.push(s);
      }
    });

    // 3. Compute Milestones:
    // 1 box (lasts 15 days): Follow-up on Day 7 and Day 14
    // 2 boxes (lasts 30 days): Follow-up on Day 7, Day 14, Day 21, and Day 28
    const customers = Array.from(customerMap.values()).map((c) => {
      const pDate = new Date(c.purchaseDate);
      const diffMs = todayDate.getTime() - pDate.getTime();
      const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 3600 * 24)));
      c.daysSincePurchase = diffDays;

      const boxes = c.boxes || 1;
      const duration = boxes * 15;
      const milestones =
        boxes <= 1
          ? [7, 14]
          : boxes === 2
          ? [7, 14, 21, 28]
          : [7, 14, 21, 28, 35, 42];

      const expectedOut = new Date(pDate.getTime() + duration * 24 * 3600 * 1000);
      c.expectedOutDate = expectedOut.toISOString().split("T")[0];

      // Due Today: exactly matches a milestone (7, 14 for 1 box; 7, 14, 21, 28 for 2 boxes)
      const isDueToday = milestones.includes(diffDays);
      c.isDueToday = isDueToday;

      // Nearing Runout: Day 14 for 1 box, Day 28 for 2 boxes, or within 2 days of duration
      const lastMilestone = milestones[milestones.length - 1];
      const isNearRunout = diffDays === lastMilestone || (diffDays >= duration - 2 && diffDays <= duration);
      c.isNearRunout = isNearRunout;

      // Overdue: passed a milestone without follow-up
      let isOverdue = false;
      let overdueDays = 0;

      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        if (diffDays > m && c.followUpCount <= i) {
          isOverdue = true;
          overdueDays = diffDays - m;
        }
      }

      // If due today, it belongs in "Today's Follow-up", NOT "Overdue"
      if (isDueToday) {
        isOverdue = false;
        overdueDays = 0;
      }

      c.isOverdue = isOverdue;
      c.overdueDays = overdueDays;

      // Set human-friendly status
      if (isDueToday) {
        c.status = "due_today";
      } else if (isOverdue) {
        c.status = "overdue";
      } else if (isNearRunout) {
        c.status = "nearing_runout";
      } else if (diffDays > duration + 5) {
        c.status = "runout";
      } else {
        c.status = "using";
      }

      return c;
    });

    return NextResponse.json({
      configured: true,
      source: "Emmi Data Master data (Live)",
      todayStr,
      customersCount: customers.length,
      salesCount: sales.length,
      customers,
      sales,
    });
  } catch (err: any) {
    console.error("Error fetching customers:", err);
    return NextResponse.json(
      { configured: false, error: err.message, customers: [], sales: [] },
      { status: 500 }
    );
  }
}
