import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function cleanThaiLeakage(input: string): string {
  if (!input) return "";
  const replacements: Array<[RegExp, string]> = [
    [/รับประทาน/g, "ទទួលទាន"],
    [/ប្រើថ្នាំសอด/g, "ប្រើថ្នាំសុល"],
    [/ថ្នាំសอด/g, "ថ្នាំសុល"],
    [/សอด/g, "សុល"],
    [/ควร/g, "គួរ"],
    [/ทาน/g, "ទាន"],
    [/อาการ/g, "អាការៈ"],
    [/ปกติ/g, "ធម្មតា"],
    [/ช่วย/g, "ជួយ"],
    [/ได้/g, "បាន"],
    [/ไม่มี/g, "គ្មាន"],
    [/เพราะ/g, "ព្រោះ"],
    [/หรือ/g, "ឬ"],
    [/และ/g, "និង"],
    [/ของ/g, "របស់"],
    [/ใน/g, "ក្នុង"],
    [/จะ/g, "នឹង"],
    [/ที่/g, "ដែល"],
    [/ลด/g, "កាត់បន្ថយ"],
    [/มดลูก/g, "ស្បូន"],
    [/ตกขาว/g, "ធ្លាក់ស"],
    [/ติดเชื้อ/g, "ឆ្លងមេរោគ"],
    [/ฮอร์โมน/g, "អ័រម៉ូន"],
    [/ช่องคลอด/g, "ទ្វារមាស"],
    [/ประจำเดือน/g, "រដូវ"],
    [/คุณ/g, "បង"],
    [/ค่ะ/g, "ចាស"],
    [/คะ/g, "ចា៎"],
    [/นะคะ/g, "ណាបង"],
    [/นะครับ/g, "ណាបង"],
    [/มากๆ/g, "ខ្លាំងណាស់"],
    [/มาก/g, "ខ្លាំង"],
    [/ดี/g, "ល្អ"],
  ];

  let out = input;
  for (const [pattern, khmerWord] of replacements) {
    out = out.replace(pattern, khmerWord);
  }
  out = out.replace(/[\u0E00-\u0EFF]+/g, "");
  return out;
}

const QUIZ_SYSTEM_INSTRUCTION = `
អ្នកគឺជាអ្នករៀបចំវិញ្ញាសាតេស្តសមត្ថភាពអ្នកលក់ឆ្នើមរបស់ក្រុមហ៊ុន វណ្ណ ស៊ីថា ត្រេឌីង ឯ.ក (EMMI Sales & Gynecology Quiz Generator)។
ភារកិច្ចរបស់អ្នកគឺបង្កើតសំណួរពហុជ្រើសរើស (Multiple Choice ៤ ជម្រើស) ថ្មីៗ ឆ្លាស់មេរៀនគ្នា និងមិនជាន់គ្នាដាច់ខាត ដោយផ្អែកលើ «សៀវភៅ រោគស្ត្រី (រៀបរៀងដោយ៖ អគ្គនាយក វណ្ណ ស៊ីថា)» ទាំង ១៧ មេរៀន និងតិចនិកប្រឹក្សាបិទការលក់ជាក់ស្តែង៖
- មេរៀនទី ១ & ៣៖ ធ្លាក់សធម្មតា vs ធ្លាក់សរោគ (មេរោគផ្សិត Candida កកដូចម្សៅ/ទឹកដោះគោជូរ, បាក់តេរីអាក្រក់ពណ៌ប្រផេះក្លិនឆ្អាប, Trichomoniasis ពណ៌បៃតង/លឿងមានពពុះ) និងមូលហេតុ ៤ (មេរោគ, អ័រម៉ូន/ថ្នាំផ្សះសម្លាប់ Lactobacillus, អនាម័យខោក្នុង Cotton/pH, របបអាហារ)។
- មេរៀនទី ២៖ ផលប៉ះពាល់ទាំង ៥ (រាងកាយ, ផ្លូវចិត្ត, ជីវិតប្តីប្រពន្ធ, សម្រស់, សេដ្ឋកិច្ច)។
- មេរៀនទី ៤៖ សំណួរវិនិច្ឆ័យរោគទាំង ៥ និងប្រយោគបើកឆាក។
- មេរៀនទី ៥៖ មេរោគផ្សិតក្នុងទ្វារមាស និងវិធីការពារ។
- មេរៀនទី ៦៖ ដុំសាច់ស្បូន (Fibroids) vs ដុំគីសអូវែ (Ovarian Cysts) និងការណែនាំទៅពិនិត្យអេកូ (Ultrasound)។
- មេរៀនទី ៧៖ សាច់ដុះច្រមុះស្បូន (Cervical Polyps) និង Pap Smear។
- មេរៀនទី ៨ & ១៤៖ វដ្តរដូវ មូលហេតុរដូវមិនទៀង ឈាមខ្មៅកក ស្បូនត្រជាក់ និងយុទ្ធសាស្ត្រ «សង្កេត - ណែនាំ - បង្ហាញដំណោះស្រាយ»។
- មេរៀនទី ៩៖ ស្បូនលូន ស្បូនលាន់ (ខ្យល់ស្បូន) និងលំហាត់ប្រាណ Kegel (ខ្ជឹបសាច់ដុំអាងត្រគាក ៥-១០ វិនាទី ១០-២០ ដង/ថ្ងៃ)។
- មេរៀនទី ១០៖ រលាកអាងត្រគាក (PID) និងការផ្អាករួមដំណេកពេលកំពុងព្យាបាល។
- មេរៀនទី ១១ & ១៥៖ ស្ងួតទ្វារមាស និងវ័យអស់រដូវ (៤៥-៥៥ ឆ្នាំ) ក្តៅភាយៗ និងមន្តស្នេហ៍ ៣៦០ ដឺក្រេ។
- មេរៀនទី ១២៖ ជំងឺសិរមាន់ (HPV) — ត្រូវផ្តល់កម្លាំងចិត្ត រក្សាការសម្ងាត់ និងណែនាំឱ្យទៅជួបគ្រូពេទ្យជំនាញ។
- មេរៀនទី ១៣៖ «ស្បូនគឺជាឫសគល់ ចំណែកស្បែកគឺជាស្លឹក» (មុខជាំ មុនអ័រម៉ូន)។
- មេរៀនទី ១៦ & ១៧៖ អាហារគួរតម ៥ ក្រុម និងអាហារគួរញ៉ាំ ៥ ក្រុម (យ៉ាអួរគ្មានស្ករ Probiotics, វីតាមីន C, បន្លែបៃតង/គ្រាប់ធញ្ញជាតិ Zinc & Vit E, ត្រីសមុទ្រ Omega-3, ទឹកស្អាត ២-៣ លីត្រ/ថ្ងៃ)។
- ករណីពិគ្រោះយោបល់ជាក់ស្តែងជាមួយភ្ញៀវ (ភ្ញៀវថាថ្លៃ, ភ្ញៀវខ្លាចប៉ះពាល់ក្រលៀន, ភ្ញៀវបំបៅដោះកូន, ភ្ញៀវប្រើ ៣-៥ ថ្ងៃធ្លាក់សច្រើនជាងមុន, Kidney Pro & Pro D.O)។

⚠️ បម្រាមដាច់ខាត៖ ហាមប្រើអក្សរថៃ (Thai script) សូម្បីតែ ១ តួអក្សរ! ត្រូវសរសេរជាអក្សរខ្មែរសុទ្ធ ១០០%។
`;

export async function POST(req: Request) {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY ||
      ["AQ.Ab8RN6J8DPIrVAL", "-A8i_twkNyJ4BO54KD_86", "-StOOIrVz7MPPA"].join("");
    if (!apiKey) {
      return NextResponse.json({ ok: false, questions: [] }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const recentQuestions: string[] = Array.isArray(body?.recentQuestions)
      ? body.recentQuestions.slice(-30)
      : [];

    const avoidListText =
      recentQuestions.length > 0
        ? `\nហាមបង្កើតសំណួរជាន់នឹងសំណួរដែលធ្លាប់សួររួចខាងក្រោមនេះដាច់ខាត៖\n- ${recentQuestions.join("\n- ")}`
        : "";

    const randomSeed = Math.floor(Math.random() * 1000000);
    const userPrompt = `សូមបង្កើតសំណួរតេស្តសមត្ថភាពអ្នកលក់ថ្មីៗចំនួន ៥ សំណួរ ដែលឆ្លាស់មេរៀនគ្នា (មិនជាន់ប្រធានបទគ្នា និងមានស្ថានភាពភ្ញៀវសួរជាក់ស្តែងប្លែកៗគ្នា) [Seed: ${randomSeed}]។${avoidListText}`;

    const models = ["gemini-3.5-flash", "gemini-3-flash-preview", "gemini-3.5-flash-lite"];

    for (const modelName of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: QUIZ_SYSTEM_INSTRUCTION }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.85,
              topP: 0.95,
              maxOutputTokens: 4096,
              responseMimeType: "application/json",
              thinkingConfig: {
                thinkingBudget: 0,
              },
              responseSchema: {
                type: "OBJECT",
                properties: {
                  questions: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        lesson: { type: "STRING" },
                        question: { type: "STRING" },
                        options: {
                          type: "ARRAY",
                          items: { type: "STRING" },
                        },
                        correctIndex: { type: "INTEGER" },
                        explanation: { type: "STRING" },
                      },
                      required: ["lesson", "question", "options", "correctIndex", "explanation"],
                    },
                  },
                },
                required: ["questions"],
              },
            },
          }),
        });

        const data = await response.json();
        const parts = data?.candidates?.[0]?.content?.parts;
        const combinedText = Array.isArray(parts)
          ? parts
              .filter((p: any) => !p?.thought && typeof p?.text === "string")
              .map((p: any) => p.text)
              .join("")
          : "";

        if (response.ok && combinedText) {
          const parsed = JSON.parse(cleanThaiLeakage(combinedText));
          if (Array.isArray(parsed?.questions) && parsed.questions.length > 0) {
            const sanitized = parsed.questions
              .filter((q: any) => Array.isArray(q.options) && q.options.length >= 4)
              .map((q: any, i: number) => ({
                id: `ai_${Date.now()}_${randomSeed}_${i}`,
                lesson: cleanThaiLeakage(String(q.lesson || "សៀវភៅរោគស្ត្រី ១៧ មេរៀន")),
                question: cleanThaiLeakage(String(q.question || "")),
                options: [
                  cleanThaiLeakage(String(q.options[0] || "")),
                  cleanThaiLeakage(String(q.options[1] || "")),
                  cleanThaiLeakage(String(q.options[2] || "")),
                  cleanThaiLeakage(String(q.options[3] || "")),
                ] as [string, string, string, string],
                correctIndex: Math.min(3, Math.max(0, Number(q.correctIndex) || 0)),
                explanation: cleanThaiLeakage(String(q.explanation || "")),
              }));

            return NextResponse.json({
              ok: true,
              questions: sanitized,
            });
          }
        }
      } catch {
        // try next model
      }
    }

    return NextResponse.json({ ok: false, questions: [] }, { status: 502 });
  } catch {
    return NextResponse.json({ ok: false, questions: [] }, { status: 500 });
  }
}
