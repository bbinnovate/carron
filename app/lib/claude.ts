import axios from "axios";

export const analyzeProduct =
  async (imageUrl: string) => {

    try {

      const response =
        await axios.post(
          "https://api.anthropic.com/v1/messages",

          {
            model:
              "claude-sonnet-4-6",

            max_tokens: 1200,

            messages: [
              {
                role: "user",

                content: [

                  {
                    type: "image",

                    source: {
                      type: "url",
                      url: imageUrl,
                    },
                  },

                  {
                    type: "text",

                                  text: `
You are a strict JSON API. Your entire response must be one valid JSON object. The first character must be { and the last character must be }. Do not write markdown, code fences, comments, explanations, or any text outside the JSON object.

Analyze the uploaded fashion product image as the source of truth. Identify the exact product type, colors, material, texture, pattern, print, embroidery, logo, trims, stitching, seams, buttons, closures, neckline, collar, sleeves, cuffs, waist, hemline, garment length, fit, silhouette, drape, proportions, and every visible construction detail. 

Return exactly these JSON keys as strings: "title", "description", "metaTitle", "metaDescription".

The title should be a catchy SEO-friendly product title.
The description should be a detailed product description for an e-commerce page.
The metaTitle should be an SEO meta title.
The metaDescription should be an SEO meta description.

Return only this JSON object shape, filled with real values:
{"title":"","description":"","metaTitle":"","metaDescription":""}
`,
                  },
                ],
              },
            ],
          },

          {
            headers: {
              "x-api-key":
                process.env.CLAUDE_API_KEY,

              "anthropic-version":
                "2023-06-01",

              "content-type":
                "application/json",
            },
          }
        );

      const rawText = response.data?.content?.[0]?.text || "{}";
      return JSON.parse(rawText);

    } catch (error: any) {

      console.log(
        "FULL CLAUDE ERROR:",
        JSON.stringify(
          error?.response?.data,
          null,
          2
        )
      );

      throw error;
    }
};
