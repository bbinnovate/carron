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
The description must be highly detailed and returned as a single raw HTML string without any markdown fences. Follow this exact HTML structure, adapting the text to match the uploaded product to ensure a clean, professional layout in Shopify:

<h3>Product Overview</h3>
<p>[Write an elegant, engaging paragraph describing the ensemble, its pieces, and colors here.]</p>
<p>[Write a second paragraph discussing the aesthetic and vibe, keeping spacing clean.]</p>

<h3>Design &amp; Craftsmanship Details</h3>
<ul>
  <li><strong>Silhouette:</strong> [Describe the cut and layers here.]</li>
  <li><strong>The Jacket:</strong> [Describe jacket specifics here.]</li>
  <li><strong>Collar:</strong> [Describe the collar here, if applicable.]</li>
  <li><strong>Front &amp; Sleeves:</strong> [Describe embroidery, motifs, and colors here.]</li>
  <li><strong>The Kurta &amp; Trousers:</strong> [Describe the inner garments here.]</li>
</ul>

<h3>Fabric &amp; Comfort</h3>
<p><strong>Material:</strong> [Describe the fabric blend here.]</p>
<p><strong>Comfort:</strong> [Describe the weave, drape, and visual texture here.]</p>

<h3>Style</h3>
<p>[Write 2 to 3 sentences about the styling, matching accessories, and the occasions this is for.]</p>

<h3>Care Instructions</h3>
<ul>
  <li><strong>Washing:</strong> [Provide washing instruction.]</li>
  <li><strong>Ironing:</strong> [Provide ironing instruction.]</li>
</ul>
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
