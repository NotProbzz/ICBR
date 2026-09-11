import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Support large image payloads for livestock photos
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// Lazy initialize GoogleGenAI client
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Clean error message parser for Gemini API errors
function extractCleanErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred.";
  const rawMsg = error.message || String(error);
  try {
    const parsed = JSON.parse(rawMsg);
    if (parsed?.error?.message) {
      return parsed.error.message;
    }
  } catch {}
  return rawMsg;
}

// Check if error is transient / temporary high demand / unavailable / rate limit
function isTransientError(error: any): boolean {
  const msg = (error?.message || String(error)).toLowerCase();
  const status = error?.status || error?.code;
  return (
    status === 503 ||
    status === 429 ||
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("high demand") ||
    msg.includes("unavailable") ||
    msg.includes("temporarily") ||
    msg.includes("resource_exhausted") ||
    msg.includes("overloaded") ||
    msg.includes("try again later")
  );
}

// Candidate models for automated fallback in case of high demand (503)
const PRIMARY_MODEL = "gemini-3.1-flash-lite";
const FALLBACK_MODELS = ["gemini-3.8-flash", "gemini-flash-latest"];

// Robust generation helper with automatic retry and model fallback
async function generateWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  },
  candidateModels: string[] = [PRIMARY_MODEL, ...FALLBACK_MODELS]
): Promise<{ text: string; model: string }> {
  let lastError: any = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    
    // For each model, attempt up to 2 times with a backoff if transient error
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini] Calling ${model} (attempt ${attempt}/2)...`);
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        if (response && response.text) {
          console.log(`[Gemini] Model ${model} succeeded.`);
          return { text: response.text, model };
        }
      } catch (err: any) {
        lastError = err;
        const cleanMsg = extractCleanErrorMessage(err);
        console.warn(`[Gemini] ${model} attempt ${attempt} failed: ${cleanMsg.substring(0, 150)}`);

        if (isTransientError(err) && attempt === 1) {
          // Wait 800ms before retry on same model
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }

        // Break to try next candidate model
        break;
      }
    }
  }

  throw lastError;
}

// Safe JSON parser that handles code blocks or outer brackets
function safeParseJson(rawText: string): any {
  const trimmed = (rawText || "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Strip markdown code fences if model enclosed them
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch) {
      return JSON.parse(fenceMatch[1].trim());
    }
    // Extract outermost JSON brackets
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(trimmed.substring(start, end + 1));
    }
    throw new Error("Invalid JSON structure returned by model");
  }
}

// 1. Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: Date.now(),
  });
});

// 2. Breed Recognition AI Endpoint
app.post("/api/recognize-breed", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", userNotes } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 in request body" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is not configured in the environment.",
      });
    }

    let cleanBase64 = imageBase64;
    let finalMimeType = mimeType;

    // Handle web URLs (e.g. from sample images or direct links)
    if (typeof imageBase64 === "string" && (imageBase64.startsWith("http://") || imageBase64.startsWith("https://"))) {
      try {
        const imgFetch = await fetch(imageBase64);
        if (!imgFetch.ok) {
          throw new Error(`HTTP error ${imgFetch.status}`);
        }
        const arrayBuf = await imgFetch.arrayBuffer();
        cleanBase64 = Buffer.from(arrayBuf).toString("base64");
        const contentType = imgFetch.headers.get("content-type");
        if (contentType && contentType.startsWith("image/")) {
          finalMimeType = contentType;
        }
      } catch (fetchErr: any) {
        console.error("Failed to fetch image URL server-side:", fetchErr);
        return res.status(400).json({
          error: `Could not retrieve specimen image from URL: ${fetchErr.message}`,
        });
      }
    } else if (typeof imageBase64 === "string") {
      // Extract data URL mime type if present
      const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
      if (mimeMatch) {
        finalMimeType = mimeMatch[1];
      }
      cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "").trim();
    }

    const ai = getGenAI();

    const systemPrompt = `You are a premier Senior Veterinary Livestock Geneticist and ICAR-NBAGR (National Bureau of Animal Genetic Resources, India) specialist.
Your task is to analyze the provided image of an Indian Bovine (Cattle or Buffalo) and perform rigorous, scientifically grounded morphological breed identification.

Key Indian Cattle Breeds (Bos indicus) to consider:
- Dairy/Milch: Gir (convex dome forehead, pendulous folded leaf ears with notch, half-moon horns), Sahiwal (reddish dun, loose navel flap/Lola, voluminous dewlap, stumpy horns), Red Sindhi (deep mahogany red, compact frame, thick upturned horns), Rathi (brown/white spotted, desert milch).
- Dual-Purpose: Kankrej (massive lyre-shaped horns, Sawai Chal high-stepping gait, silver grey), Tharparkar (white/light grey, heat-resilient, desert dual), Hariana (white/light grey, flat forehead, upright horns), Ongole (majestic white, elliptical eyes with black rims, large muscular frame, Brazilian Nelore ancestor), Deoni (black & white spotted, Gir-Dangi cross).
- Draught: Hallikar (swept-back long horns, Mysore trotter, compact frame), Kangayam (Kongu Nadu, grey, compact, strong crescent horns, black points), Amritmahal, Khillari, Bargur.

Key Indian Buffalo Breeds (Bubalus bubalis) to consider:
- Dairy: Murrah (jet black, tightly coiled spiral horns like ringlets / "Jalebi" horns, wedge dairy shape), Jaffarabadi (heavy drooped horns framing face, massive dome forehead, riverine giant), Nili-Ravi (Panch Kalyani 5 white markings: forehead, muzzle, 4 socks, switch; Wall eyes), Surti (sickle-shaped flat horns, two white collars/chevrons on lower neck 'Janeu'), Mehsana (Murrah x Surti intermediate horn curl, consistent lactation), Bhadawari (copper/light brown coat, white neck lines, world's highest milk fat 8.5-13%), Pandharpuri (ultra-long flat sword horns 45-60cm sweeping back over withers), Toda, Banni, Nagpuri.

If the image is NOT a bovine animal (e.g. dog, cat, goat, car, landscape, person):
- Set species to "Non-Bovine / Unrecognized"
- Provide clear explanation in summaryVerdict and explain what is visible.

Output strictly valid JSON with the exact requested fields.`;

    const userPrompt = `Examine this livestock image in detail. Perform an ICAR-NBAGR morphological analysis.
${userNotes ? `User Observation / Context: ${userNotes}` : ""}
Return the identification with confidence score, anatomical markers (horns, ears, hump, dewlap, coat, forehead, body frame), breed category, milk yield, fat %, and differential diagnosis.`;

    const { text, model } = await generateWithFallback(ai, {
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: finalMimeType,
              data: cleanBase64,
            },
          },
          {
            text: userPrompt,
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            species: {
              type: Type.STRING,
              description: "Must be one of: 'Cattle (Bos indicus)', 'Buffalo (Bubalus bubalis)', 'Exotic / Crossbred Bovine', or 'Non-Bovine / Unrecognized'",
            },
            breedName: {
              type: Type.STRING,
              description: "Canonical breed name (e.g., 'Gir', 'Murrah', 'Sahiwal', 'Kankrej', etc.)",
            },
            scientificName: {
              type: Type.STRING,
              description: "e.g., 'Bos indicus' or 'Bubalus bubalis'",
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: "Confidence percentage from 0 to 100",
            },
            summaryVerdict: {
              type: Type.STRING,
              description: "Concise summary verdict of the recognition",
            },
            structuralTraits: {
              type: Type.ARRAY,
              description: "5 key structural hotspots for a 3D structural breakdown overlay.",
              items: {
                type: Type.OBJECT,
                properties: {
                  part: { type: Type.STRING, description: "Must be exactly one of: 'head_horns', 'hump', 'dewlap', 'body_frame', 'udder_tail'" },
                  trait: { type: Type.STRING, description: "Short label for the trait, e.g. 'Convex Forehead'" },
                  description: { type: Type.STRING, description: "Detailed structural explanation and unique traits" },
                },
                required: ["part", "trait", "description"]
              }
            },
            morphologicalMarkers: {
              type: Type.OBJECT,
              properties: {
                horns: { type: Type.STRING },
                ears: { type: Type.STRING },
                humpAndDewlap: { type: Type.STRING },
                coatColorAndPattern: { type: Type.STRING },
                foreheadAndFace: { type: Type.STRING },
                bodyFrameAndStature: { type: Type.STRING },
                tailSwitch: { type: Type.STRING },
              },
              required: [
                "horns",
                "ears",
                "humpAndDewlap",
                "coatColorAndPattern",
                "foreheadAndFace",
                "bodyFrameAndStature",
                "tailSwitch",
              ],
            },
            classification: {
              type: Type.OBJECT,
              properties: {
                species: { type: Type.STRING },
                category: {
                  type: Type.STRING,
                  description: "'Dairy', 'Draught', or 'Dual-Purpose'",
                },
                nativeTract: { type: Type.STRING },
                states: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                icarNbagrCode: { type: Type.STRING },
                averageMilkYieldPerLactation: { type: Type.STRING },
                milkFatPercentage: { type: Type.STRING },
                conservationStatus: {
                  type: Type.STRING,
                  description: "'Abundant', 'Stable', 'Vulnerable', 'Endangered', or 'Rare'",
                },
              },
              required: [
                "species",
                "category",
                "nativeTract",
                "states",
                "icarNbagrCode",
                "averageMilkYieldPerLactation",
                "milkFatPercentage",
                "conservationStatus",
              ],
            },
            managementAndCare: {
              type: Type.OBJECT,
              properties: {
                climateSuitability: { type: Type.STRING },
                feedingRecommendations: { type: Type.STRING },
                commonDiseasesAndVaccination: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                breedingTips: { type: Type.STRING },
                draughtOrDairyUtility: { type: Type.STRING },
              },
              required: [
                "climateSuitability",
                "feedingRecommendations",
                "commonDiseasesAndVaccination",
                "breedingTips",
                "draughtOrDairyUtility",
              ],
            },
            keyDistinguishingCharacteristics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            confidenceAnalysis: {
              type: Type.STRING,
              description: "Scientific justification of why this breed was selected and anatomical points of certainty.",
            },
            alternatePossibilities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  breedName: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  differentiatingTraits: { type: Type.STRING },
                },
                required: ["breedName", "confidence", "differentiatingTraits"],
              },
            },
          },
          required: [
            "species",
            "breedName",
            "scientificName",
            "confidenceScore",
            "summaryVerdict",
            "structuralTraits",
            "morphologicalMarkers",
            "classification",
            "managementAndCare",
            "keyDistinguishingCharacteristics",
            "confidenceAnalysis",
            "alternatePossibilities",
          ],
        },
      },
    });

    const parsed = safeParseJson(text);
    const resultId = "rec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);

    return res.json({
      id: resultId,
      timestamp: Date.now(),
      modelUsed: model,
      ...parsed,
    });
  } catch (error: any) {
    console.error("Error recognizing breed:", error);
    const cleanError = extractCleanErrorMessage(error);
    return res.status(500).json({
      error: cleanError || "Failed to analyze livestock image",
    });
  }
});

// 3. Bovine AI Veterinary Expert Consultation Endpoint
app.post("/api/chat-expert", async (req, res) => {
  try {
    const { message, breedContext, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing message in request body" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "GEMINI_API_KEY not configured" });
    }

    const ai = getGenAI();

    const systemInstruction = `You are "Dr. PashuMitra", an expert AI veterinary consultant specializing in indigenous Indian cattle (Bos indicus) and buffalo (Bubalus bubalis) breeds.
You are grounded in ICAR-NDRI (National Dairy Research Institute), ICAR-IVRI (Indian Veterinary Research Institute), and ICAR-NBAGR standards.
${
  breedContext
    ? `The user is currently examining the breed: "${breedContext.breedName}" (${breedContext.species || "Indigenous Bovine"}), native to ${breedContext.nativeTract || "India"}.`
    : ""
}
Provide practical, scientific, actionable advice regarding:
- Breed standard verification & morphological questions
- Nutrition & fodder (green fodder, dry roughage, mineral mixture, bypass fat, silage)
- Milk yield optimization & A2 milk management
- Seasonal health management (heat stress mitigation, HS, BQ, FMD vaccination calendar, deworming)
- Selective breeding, artificial insemination (AI), and conservation of indigenous germplasm.

Keep your tone helpful, culturally respectful to Indian farmers/pastoralists, scientifically accurate, and well-structured with clear bullet points.`;

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history) {
        if (h.content) {
          contents.push({
            role: h.role === "user" ? "user" : "model",
            parts: [{ text: h.content }],
          });
        }
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const { text } = await generateWithFallback(ai, {
      contents,
      config: {
        systemInstruction,
      },
    });

    return res.json({
      reply: text,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("Chat expert error:", error);
    const cleanError = extractCleanErrorMessage(error);
    return res.status(500).json({
      error: cleanError || "Failed to consult bovine expert",
    });
  }
});

// 4. Breed Comparison API Endpoint
app.post("/api/compare-breeds", async (req, res) => {
  try {
    const { breedA, breedB } = req.body;
    if (!breedA || !breedB) {
      return res.status(400).json({ error: "Please provide breedA and breedB" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: "GEMINI_API_KEY not configured" });
    }

    const ai = getGenAI();
    const prompt = `Provide a comprehensive comparative technical evaluation between two Indian bovine breeds: "${breedA}" and "${breedB}".
Cover:
1. Origin & Agro-climatic Adaptation
2. Key Morphological Distinctions (Horns, Ears, Hump, Dewlap, Coat)
3. Productivity & Economics (Lactation Yield, Fat %, Lactation Length)
4. Draught / Dairy / Dual Utility
5. Fodder Conversion & Maintenance Cost
6. Best Choice Scenario (Which farmer should choose which breed and why).

Return clean structured markdown.`;

    const { text } = await generateWithFallback(ai, {
      contents: prompt,
    });

    return res.json({
      comparison: text,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("Comparison error:", error);
    const cleanError = extractCleanErrorMessage(error);
    return res.status(500).json({
      error: cleanError || "Failed to generate breed comparison",
    });
  }
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bovine Breed Recognition Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
