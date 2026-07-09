import axios from "axios";

export const analyzeProduct =
  async (imageUrl: string) => {

    try {

    const imageResp = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const contentType = imageResp.headers["content-type"];
    const mimeType = typeof contentType === "string" ? contentType.split(";")[0] : "image/jpeg";
    const base64Data = Buffer.from(imageResp.data).toString("base64");

    const promptText = `
You are a strict JSON API. Your entire response must be one valid JSON object. The first character must be { and the last character must be }. Do not write markdown, code fences, comments, explanations, or any text outside the JSON object.

Analyze the uploaded fashion product image as the source of truth. Identify the exact product type, colors, material, texture, pattern, print, embroidery, logo, trims, stitching, seams, buttons, closures, neckline, collar, sleeves, cuffs, waist, hemline, garment length, fit, silhouette, drape, proportions, and every visible construction detail. 

Return exactly these JSON keys as strings: "title", "description", "metaTitle", "metaDescription".

The title should be a catchy SEO-friendly product title.
The description should be a detailed product description for an e-commerce page.
The metaTitle should be an SEO meta title.
The metaDescription should be an SEO meta description.

Return only this JSON object shape, filled with real values:
{"title":"","description":"","metaTitle":"","metaDescription":""}
`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NANO_BANANA_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
              {
                text: promptText,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Clean up potential markdown fences just in case
    rawText = rawText.trim();
    if (rawText.startsWith("\`\`\`json")) {
      rawText = rawText.replace(/^\`\`\`json\n?/, "").replace(/\n?\`\`\`$/, "");
    } else if (rawText.startsWith("\`\`\`")) {
      rawText = rawText.replace(/^\`\`\`\n?/, "").replace(/\n?\`\`\`$/, "");
    }

    return JSON.parse(rawText);

  } catch (error: any) {
    console.log(
      "FULL GEMINI ERROR:",
      JSON.stringify(error?.response?.data || error.message, null, 2)
    );
    throw error;
    }
};
