import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD || "Emmi@1111";

    if (!password || password !== adminPassword) {
      return NextResponse.json(
        { ok: false, message: "Password មិនត្រឹមត្រូវ។" },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err.message || "Server Error" },
      { status: 500 }
    );
  }
}
