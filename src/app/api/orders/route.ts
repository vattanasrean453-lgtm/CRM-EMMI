import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSd_hP30dqB-F5gCV44AuxcftgmoDjo5zzkN-NSMiK-1rDEqPQ/formResponse";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      date,
      team,
      sellerName,
      sellerNo,
      productName,
      productQuantity,
      bonusQuantity,
      price,
      receiverPhone,
      receiverName,
      address,
      deliveryMethod,
      note,
    } = body;

    if (!receiverPhone || !address || !deliveryMethod) {
      return NextResponse.json(
        { ok: false, message: "សូមបំពេញព័ត៌មានចាំបាច់ (លេខអ្នកទទួល, អាសយដ្ឋាន, សេវាដឹក)!" },
        { status: 400 }
      );
    }

    const orderDate = date || new Date().toISOString().slice(0, 10);
    const dateParts = orderDate.split("-");
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];

    const formData = new URLSearchParams();
    // Q1: Date (Type 9)
    formData.append("entry.1581364351_year", year);
    formData.append("entry.1581364351_month", month);
    formData.append("entry.1581364351_day", day);
    formData.append("entry.1581364351", orderDate);

    // Q2: Team (Default: Vann_Sitha as requested)
    formData.append("entry.2053044994", team || "Vann_Sitha");

    // Q3: Seller Name
    formData.append("entry.193760049", sellerName || "");

    // Q4: Seller No
    formData.append("entry.1250998064", sellerNo || "");

    // Q5: Product Quantity (1-10) - Form entry.1166279805
    const qtyStr = String(productQuantity || "1");
    formData.append("entry.1166279805", qtyStr);
    formData.append("entry.1229436075", qtyStr);

    // Q6: Bonus (0-5)
    if (bonusQuantity && String(bonusQuantity) !== "0") {
      formData.append("entry.1353799287", String(bonusQuantity));
    }

    // Q7: Price
    formData.append("entry.615821671", String(price || ""));

    // Q8: Receiver Phone (required)
    formData.append("entry.1618786820", String(receiverPhone));

    // Q9: Recipient Name
    formData.append("entry.485783433", receiverName || "");

    // Q10: Address (required)
    formData.append("entry.1844490282", String(address));

    // Q11: Delivery Method (required)
    formData.append("entry.77621526", String(deliveryMethod || "VET"));

    // Q12: Note (records product name + custom note)
    const productTag = productName ? `[ផលិតផល: ${productName}]` : "";
    const noteText = note ? String(note).trim() : "";
    const combinedNote = [productTag, noteText].filter(Boolean).join(" ");
    if (combinedNote) {
      formData.append("entry.1529022117", combinedNote);
    }

    // Q13: Seller's Name duplicate
    formData.append("entry.1608045144", sellerName || "");

    // Submit directly to Google Forms formResponse
    await fetch(GOOGLE_FORM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    return NextResponse.json({
      ok: true,
      message: "ការកុម្ម៉ង់ត្រូវបានកត់ត្រាចូលទៅក្នុង Google Sheet ជោគជ័យ!",
    });
  } catch (error: any) {
    console.error("Error submitting order to Google Form:", error);
    return NextResponse.json(
      { ok: false, message: "មិនអាចបញ្ជូនការកុម្ម៉ង់បានទេ សូមព្យាយាមម្តងទៀត!", error: error.message },
      { status: 500 }
    );
  }
}
