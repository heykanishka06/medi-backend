import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {

    // Allow GitHub Pages to call this backend
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

    // Handle browser preflight request
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const { patient } = req.body;

        if (!patient) {
            return res.status(400).json({
                error: "Patient information is required."
            });
        }

        const prompt = `
You are an AI assistant helping a practitioner organize a patient case.

Create a clear and professional CASE SUMMARY from the information provided.

IMPORTANT:
- Do NOT diagnose the patient.
- Do NOT prescribe medicines.
- Do NOT claim certainty about any disease.
- Only summarize the information provided.
- Clearly separate reported symptoms from other information.
- Highlight important patterns that may deserve practitioner attention.

Use this structure:

CASE OVERVIEW

KEY SYMPTOMS

RELEVANT INFORMATION

CLINICAL SUMMARY

POINTS FOR PRACTITIONER REVIEW

Patient information:

${JSON.stringify(patient, null, 2)}

End with:

AI-generated summary. Review by practitioner before clinical use.
`;

        const response = await client.responses.create({
            model: "gpt-5.6-luna",
            input: prompt
        });

        return res.status(200).json({
            summary: response.output_text
        });

    } catch (error) {

        console.error("AI Summary Error:", error);

        return res.status(500).json({
            error: "Unable to generate AI summary."
        });
    }
}