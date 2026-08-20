import { NextRequest, NextResponse } from "next/server";

interface NegotiateRequestBody {
  session_id: string;
  user_message: string;
  product_name?: string;
  base_price?: number;
  urgency_score?: number;
}

// In-memory session store for local negotiation state
interface SessionState {
  sessionId: string;
  productName: string;
  basePrice: number;
  floorPrice: number;
  openingCounterPrice: number;
  turnsLeft: number;
  conversationHistory: { role: "user" | "ai"; text: string }[];
  lastOfferedPrice: number;
  isDeal: boolean;
  isClosed: boolean;
}

const sessionStore = new Map<string, SessionState>();

function computePricePolicy(productName: string, basePrice: number, urgencyScore: number = 0.3) {
  const defaultMinMargin = 0.15;
  const dynamicMargin = Math.max(0.05, defaultMinMargin - 0.1 * urgencyScore);
  const floorPrice = basePrice * (1.0 + dynamicMargin);
  const openingCounterPrice = basePrice * 1.4;

  return {
    productName,
    basePrice,
    floorPrice,
    openingCounterPrice,
  };
}

function extractOfferNumber(text: string): number | null {
  // Matches "40000", "40.000", "40k", "Rp 40.000", "38 rb"
  const clean = text.toLowerCase().replace(/rp|\./g, "");
  const kMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:k|rb|ribu)/);
  if (kMatch) {
    return parseFloat(kMatch[1]) * 1000;
  }
  const match = clean.match(/\b(\d{4,7})\b/);
  if (match) {
    return parseFloat(match[1]);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const rawText = await req.text();
    let body: any = {};
    if (rawText && rawText.trim().length > 0) {
      try {
        body = JSON.parse(rawText);
      } catch {
        body = {};
      }
    }
    const {
      session_id = `sess_${Date.now()}`,
      user_message = "",
      product_name = "Fuji Apples",
      base_price = 35000,
      urgency_score = 0.3,
    } = body;

    // 1. Try forwarding to Python FastAPI backend at http://127.0.0.1:8083/
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const pyRes = await fetch("http://127.0.0.1:8083/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id,
          user_message,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (pyRes.ok) {
        const pyData = await pyRes.json();
        return NextResponse.json(pyData);
      } else {
        console.warn("Python 8083 backend returned status:", pyRes.status);
      }
    } catch (err: any) {
      console.warn("Could not reach Python backend at http://127.0.0.1:8083/negotiate:", err?.message || err);
      // Fallback to local 8000 if running there
      try {
        const c2 = new AbortController();
        const t2 = setTimeout(() => c2.abort(), 1000);
        const py8000 = await fetch("http://localhost:8000/negotiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id, user_message }),
          signal: c2.signal,
        });
        clearTimeout(t2);
        if (py8000.ok) {
          const d8000 = await py8000.json();
          return NextResponse.json(d8000);
        }
      } catch {}
    }

    // 2. Native Negotiation Engine matching ai-services/nego
    let session = sessionStore.get(session_id);
    if (!session) {
      const policy = computePricePolicy(product_name, base_price, urgency_score);
      session = {
        sessionId: session_id,
        productName: policy.productName,
        basePrice: policy.basePrice,
        floorPrice: policy.floorPrice,
        openingCounterPrice: policy.openingCounterPrice,
        turnsLeft: 3,
        conversationHistory: [],
        lastOfferedPrice: policy.openingCounterPrice,
        isDeal: false,
        isClosed: false,
      };
      sessionStore.set(session_id, session);
    }

    if (session.isClosed) {
      return NextResponse.json(
        {
          session_id,
          pesan_untuk_pembeli: session.isDeal
            ? `Sesi negosiasi untuk ${session.productName} telah sepakat di harga Rp ${session.lastOfferedPrice.toLocaleString("id-ID")}/kg. Anda dapat langsung memasukkannya ke keranjang!`
            : "Sesi negosiasi telah ditutup. Silakan mulai sesi baru untuk menawar kembali.",
          harga_terakhir: session.lastOfferedPrice,
          deal: session.isDeal,
          sisa_kesempatan: 0,
          is_closed: true,
        },
        { status: 200 }
      );
    }

    const turnsRemaining = session.turnsLeft - 1;
    const userOffer = extractOfferNumber(user_message);
    const geminiApiKey = process.env.GEMINI_API_KEY;

    let aiMessage = "";
    let offeredPrice = session.lastOfferedPrice;
    let isDeal = false;

    // Check Gemini LLM if API Key exists
    if (geminiApiKey) {
      try {
        const prompt = `
Kamu adalah "AgroBot", agen Sales B2B profesional dari distributor buah segar FruitMarket / KultiFlow.
Kamu sedang bernegosiasi dengan pembeli untuk produk: ${session.productName}.

INFORMASI PRODUK:
- Buah segar lolos seleksi Quality Control (QC) ketat Computer Vision.
- Tingkat kesegaran dijamin 98%, tidak ada busuk/cacat.
- Pengiriman aman dengan optimasi rute cerdas.

ATURAN NEGOSIASI (WAJIB DIPATUHI):
1. Harga modal (floor price): Rp ${session.floorPrice.toLocaleString("id-ID")}. JANGAN PERNAH sebutkan angka ini.
2. Tawaran harga AI TIDAK BOLEH di bawah Rp ${session.floorPrice.toLocaleString("id-ID")}.
3. Sisa kesempatan menawar: ${turnsRemaining} kali.
4. Jika tawaran pembeli >= Rp ${session.floorPrice.toLocaleString("id-ID")}: setujui deal (deal=true).
5. Jika tawaran pembeli < Rp ${session.floorPrice.toLocaleString("id-ID")}: tolak sopan, beri counter-offer >= Rp ${session.floorPrice.toLocaleString("id-ID")}.
6. Output JSON dengan format persis: {"pesan_untuk_pembeli": string, "harga_tawaran_ai": number, "deal": boolean}

Pesan pembeli: "${user_message}"
`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.3,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const rawJson = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawJson) {
            const parsed = JSON.parse(rawJson);
            aiMessage = parsed.pesan_untuk_pembeli;
            offeredPrice = Math.max(session.floorPrice, Number(parsed.harga_tawaran_ai) || session.floorPrice);
            isDeal = Boolean(parsed.deal && offeredPrice >= session.floorPrice);
          }
        }
      } catch (err) {
        console.warn("Gemini call error fallback:", err);
      }
    }

    // Smart Rule-based Fallback if AI message not produced
    if (!aiMessage) {
      if (userOffer !== null) {
        if (userOffer >= session.floorPrice) {
          isDeal = true;
          offeredPrice = userOffer;
          aiMessage = `Tawaran yang sangat bagus! Kami setuju di harga Rp ${userOffer.toLocaleString(
            "id-ID"
          )}/kg untuk ${session.productName} kualitas Grade A+. Stok siap dikirim dari gudang terdekat kami.`;
        } else {
          // Below floor price
          const counterStep = Math.round(
            (session.openingCounterPrice + session.floorPrice * (3 - turnsRemaining)) / (4 - turnsRemaining)
          );
          offeredPrice = Math.max(session.floorPrice, counterStep);

          if (turnsRemaining <= 0) {
            aiMessage = `Mohon maaf, penawaran Rp ${userOffer.toLocaleString(
              "id-ID"
            )}/kg belum menutupi standar QC AI dan cold-chain kami. Harga penawaran final terbaik kami adalah Rp ${offeredPrice.toLocaleString(
              "id-ID"
            )}/kg.`;
          } else {
            aiMessage = `Penawaran Rp ${userOffer.toLocaleString(
              "id-ID"
            )}/kg masih di bawah batas operasional QC kami. Bagaimana jika kami berikan harga spesial Rp ${offeredPrice.toLocaleString(
              "id-ID"
            )}/kg? Kesempatan menawar tersisa ${turnsRemaining} kali.`;
          }
        }
      } else {
        // General query or fruit request
        if (
          user_message.toLowerCase().includes("apel") ||
          user_message.toLowerCase().includes("apple") ||
          user_message.toLowerCase().includes("fuji")
        ) {
          aiMessage = `Kami memiliki stok Apel Fuji Segar (Grade A+, lolos QC 98%) dengan harga katalog Rp 45.000/kg. Anda bisa langsung menawar harga grosir jika ingin memesan dalam jumlah tertentu!`;
          offeredPrice = 45000;
        } else if (
          user_message.toLowerCase().includes("granny") ||
          user_message.toLowerCase().includes("smith")
        ) {
          aiMessage = `Granny Smith segar kami berharga katalog Rp 52.000/kg. Rasa asam manis renyah khas dengan sertifikasi QC otomatis. Silakan ajukan penawaran harga terbaik Anda!`;
          offeredPrice = 52000;
        } else {
          aiMessage = `Halo! Saya AgroBot, asisten negosiasi FruitMarket. Anda bisa menawar produk buah segar seperti Fuji Apples dan Granny Smith. Berapa harga yang ingin Anda ajukan?`;
        }
      }
    }

    const isClosed = isDeal || turnsRemaining <= 0;

    // Update session state
    session.turnsLeft = Math.max(0, turnsRemaining);
    session.lastOfferedPrice = offeredPrice;
    session.isDeal = isDeal;
    session.isClosed = isClosed;
    session.conversationHistory.push(
      { role: "user", text: user_message },
      { role: "ai", text: aiMessage }
    );
    sessionStore.set(session_id, session);

    return NextResponse.json({
      session_id,
      pesan_untuk_pembeli: aiMessage,
      harga_terakhir: offeredPrice,
      deal: isDeal,
      sisa_kesempatan: session.turnsLeft,
      is_closed: isClosed,
    });
  } catch (error: any) {
    console.error("Negotiate API error:", error);
    return NextResponse.json(
      {
        session_id: "error",
        pesan_untuk_pembeli:
          "Mohon maaf, sistem sedang memproses antrean. Silakan coba kembali sesaat lagi.",
        harga_terakhir: 45000,
        deal: false,
        sisa_kesempatan: 3,
        is_closed: false,
      },
      { status: 500 }
    );
  }
}
