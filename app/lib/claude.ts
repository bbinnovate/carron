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
You are a JSON API.

CRITICAL RULES:
- Return ONLY valid raw JSON
- No markdown
- No explanation
- No \`\`\`
- No extra text
- No comments

Analyze the uploaded fashion product image carefully.

Detect:
- product type
- age category
- colors
- fabric details
- design elements
- patterns
- embroidery
- neckline
- sleeves

Generate:
- title
- ecommerce description
- meta title
- meta description
- realistic AI fashion photoshoot prompts for 4 angles

IMPORTANT: Each prompt must generate a SEPARATE image. Do NOT reuse or modify the same image 4 times.

Generate 4 DIFFERENT angle prompts for ECOMMERCE PRODUCT PHOTOGRAPHY:

1. FRONT ANGLE:
Professional Indian fashion model, full-body shot head to toe, PURE WHITE BACKGROUND (absolutely plain white, no texture, no shadows), wearing [exact product details], facing camera directly, arms at sides, professional studio lighting, sharp focus. PRESERVE: exact colors, exact design, exact embroidery. CRITICAL: White background ONLY, no gradient, no studio elements.

2. RIGHT ANGLE:
Professional Indian fashion model, full-body shot head to toe, PURE WHITE BACKGROUND (absolutely plain white, no texture, no shadows), wearing [exact product details], standing in right profile (right side facing camera), professional studio lighting, sharp focus. PRESERVE: exact colors, exact design, exact embroidery. CRITICAL: White background ONLY, no gradient, no studio elements.

3. LEFT ANGLE:
Professional Indian fashion model, full-body shot head to toe, PURE WHITE BACKGROUND (absolutely plain white, no texture, no shadows), wearing [exact product details], standing in left profile (left side facing camera), professional studio lighting, sharp focus. PRESERVE: exact colors, exact design, exact embroidery. CRITICAL: White background ONLY, no gradient, no studio elements.

4. BACK ANGLE:
Professional Indian fashion model, full-body shot head to toe, PURE WHITE BACKGROUND (absolutely plain white, no texture, no shadows), wearing [exact product details], standing with back to camera (facing away), back of garment fully visible, professional studio lighting, sharp focus. PRESERVE: exact colors, exact design, exact embroidery. CRITICAL: White background ONLY, no gradient, no studio elements. Show complete back view.

DO NOT:
- Add gradients to background
- Add shadows
- Add studio props or furniture
- Change colors
- Modify design
- Change clothing
- Add accessories
- Add effects or filters

Return EXACTLY this JSON structure:

{
  "title": "",
  "description": "",
  "metaTitle": "",
  "metaDescription": "",
  "imagePromptFront": "Professional Indian fashion model, full-body head to toe, pure white background, [product details], front facing, arms at sides, white studio lighting, sharp focus, ecommerce photography",
  "imagePromptRight": "Professional Indian fashion model, full-body head to toe, pure white background, [product details], right profile view, white studio lighting, sharp focus, ecommerce photography",
  "imagePromptLeft": "Professional Indian fashion model, full-body head to toe, pure white background, [product details], left profile view, white studio lighting, sharp focus, ecommerce photography",
  "imagePromptBack": "Professional Indian fashion model, full-body head to toe, pure white background, [product details], back facing away, back of garment fully visible, white studio lighting, sharp focus, ecommerce photography"
}
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

      return response.data;

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