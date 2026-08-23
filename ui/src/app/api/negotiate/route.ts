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
  const kMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:k|rb|ribu|thousand)/);
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
            ? `Negotiation for ${session.productName} is agreed at Rp ${session.lastOfferedPrice.toLocaleString("id-ID")}/unit. You can directly add it to your shopping cart!`
            : "Negotiation session has concluded. Please start a new session to negotiate again.",
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
You are "AgroBot", a professional B2B Sales agent from fresh produce distributor KultiFlow.
You are negotiating with a buyer for product: ${session.productName}.

PRODUCT INFORMATION:
- Fresh produce certified through Computer Vision Quality Control (QC).
- Freshness guaranteed 98%, zero rot or defects.
- Safe cold-chain transit with route optimization.

NEGOTIATION RULES (STRICT):
1. Floor price: Rp ${session.floorPrice.toLocaleString("id-ID")}. NEVER reveal this number.
2. AI price offer MUST NOT fall below Rp ${session.floorPrice.toLocaleString("id-ID")}.
3. Remaining negotiation turns: ${turnsRemaining} times.
4. If buyer offer >= Rp ${session.floorPrice.toLocaleString("id-ID")}: accept deal (deal=true).
5. If buyer offer < Rp ${session.floorPrice.toLocaleString("id-ID")}: politely decline and provide counter-offer >= Rp ${session.floorPrice.toLocaleString("id-ID")}.
6. Output in English JSON format: {"pesan_untuk_pembeli": string, "harga_tawaran_ai": number, "deal": boolean}

Buyer message: "${user_message}"
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
          aiMessage = `Great offer! We agree to lock the price at Rp ${userOffer.toLocaleString(
            "id-ID"
          )}/unit for ${session.productName} (Grade A+ quality). The batch is ready for shipment from our cold-storage facility.`;
        } else {
          // Below floor price
          const counterStep = Math.round(
            (session.openingCounterPrice + session.floorPrice * (3 - turnsRemaining)) / (4 - turnsRemaining)
          );
          offeredPrice = Math.max(session.floorPrice, counterStep);

          if (turnsRemaining <= 0) {
            aiMessage = `Thank you for your offer. Unfortunately, Rp ${userOffer.toLocaleString(
              "id-ID"
            )}/unit does not cover our AI QC and cold-chain logistics standards. Our best final price is Rp ${offeredPrice.toLocaleString(
              "id-ID"
            )}/unit.`;
          } else {
            aiMessage = `An offer of Rp ${userOffer.toLocaleString(
              "id-ID"
            )}/unit is below our operating threshold for Grade A produce. How about a special counter-offer of Rp ${offeredPrice.toLocaleString(
              "id-ID"
            )}/unit? You have ${turnsRemaining} negotiation turns remaining.`;
          }
        }
      } else {
        // General query or fruit request
        if (
          user_message.toLowerCase().includes("apple") ||
          user_message.toLowerCase().includes("fuji")
        ) {
          aiMessage = `We have fresh Premium Fuji Apples (Grade A+, 98% QC Pass) at a catalog price of Rp 45,000/unit. You can make a bulk offer directly!`;
          offeredPrice = 45000;
        } else if (
          user_message.toLowerCase().includes("granny") ||
          user_message.toLowerCase().includes("smith")
        ) {
          aiMessage = `Our fresh Granny Smith Apples are listed at Rp 52,000/unit. Crisp tartness with automated QC certification. Feel free to propose your bulk price!`;
          offeredPrice = 52000;
        } else {
          aiMessage = `Hello! I'm AgroBot, your KultiFlow negotiation assistant. You can negotiate prices for fresh produce batches like Fuji Apples and Granny Smith. What price would you like to propose?`;
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
          "Our negotiation assistant is currently processing high volume. Please try again shortly.",
        harga_terakhir: 45000,
        deal: false,
        sisa_kesempatan: 3,
        is_closed: false,
      },
      { status: 500 }
    );
  }
}
