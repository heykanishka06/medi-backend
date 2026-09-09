import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

export default async function handler(req, res) {

    // =====================================================
    // CORS
    // =====================================================

    res.setHeader(
        "Access-Control-Allow-Origin",
        "https://heykanishka06.github.io"
    );

    res.setHeader(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    // Browser preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Only POST is allowed
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        // =====================================================
        // GET PATIENT INFORMATION
        // =====================================================

        const { patient } = req.body;

        if (!patient) {
            return res.status(400).json({
                error: "Patient information is required."
            });
        }

        // =====================================================
        // AI PROMPT
        // =====================================================

        const prompt = `
You are an AI assistant helping a healthcare practitioner organize a patient case.

Create a clear, professional and easy-to-read CASE SUMMARY from the patient information provided below.

IMPORTANT SAFETY RULES:

- Do NOT diagnose the patient.
- Do NOT prescribe medicines.
- Do NOT recommend a treatment.
- Do NOT claim certainty about any disease or medical condition.
- Do NOT invent information that is not provided.
- Only summarize the information given.
- Clearly distinguish reported symptoms from other information.
- Highlight important patterns or observations that may deserve practitioner attention.
- Use professional but simple language.
- If information is missing, do not guess.

Use exactly this structure:

CASE OVERVIEW

KEY SYMPTOMS

RELEVANT INFORMATION

CLINICAL SUMMARY

POINTS FOR PRACTITIONER REVIEW

Patient information:

${JSON.stringify(patient, null, 2)}

At the end write:

AI-generated summary. Review by practitioner before clinical use.
`;

        // =====================================================
        // GEMINI AI
        // =====================================================

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        const summary = response.text;

        // =====================================================
        // SEND RESPONSE TO FRONTEND
        // =====================================================

        return res.status(200).json({
            summary: summary
        });

    } catch (error) {

        console.error("Gemini AI Summary Error:", error);

        return res.status(500).json({
            error: "Unable to generate AI summary.",
            details: error.message
        });
    }
}
