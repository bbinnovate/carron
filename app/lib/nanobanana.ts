import axios from "axios";

const sleep = (
  ms: number
) =>
  new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );

export const generateModelImage =
  async (
prompt: string, gender: string, imageUrl: string, characterImage: any  ) => {

    const angles = [
      "front pose",
      "walking pose",
      "portrait close-up",
    ];

    const images: string[] = [];

    for (const angle of angles) {

      let retries = 3;

      while (retries > 0) {

        try {

         const enhancedPrompt = `
A single full-body ${gender === "female" ? "female" : "male"} fashion model on a pure white seamless studio background.

IDENTITY (use reference character exactly):
- SAME face, facial features, and expression
- SAME skin tone and texture
- SAME hairstyle and hair color
- SAME body type and proportions
- DO NOT alter or replace the person in any way

CLOTHING (use reference product image exactly):
- SAME outfit — do not swap, replace, or reimagine
- SAME colors — do not shift, brighten, or alter
- SAME embroidery, prints, and surface patterns
- SAME neckline, sleeve style, and fit
- SAME trims, borders, pockets, and all details
- Garment must appear naturally worn on the model's body

POSE:
${angle}

PHOTOGRAPHY:
- 1:1 square aspect ratio
- Full-body shot, head to toe
- Pure white seamless background — no texture, no gradient, no shadows, no props
- Even, bright studio lighting — shadow-free
- Sharp focus, high resolution
- Realistic skin texture and natural appearance
- Premium luxury ecommerce photoshoot quality
`;


 

          const response =
            await axios.post(

              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.NANO_BANANA_API_KEY}`,

              {
                contents: [
                  {
                    parts: [

                       // CHARACTER REFERENCE

  {
    fileData: {
      mimeType:
        "image/jpeg",

      fileUri:
        characterImage,
    },
  },

                      // PRODUCT IMAGE

                      {
                        fileData: {
                          mimeType:
                            "image/jpeg",

                          fileUri:
                            imageUrl,
                        },
                      },

                      // PROMPT

                      {
                        text:
                          enhancedPrompt,
                      },
                    ],
                  },
                ],
              },

              {
                headers: {
                  "Content-Type":
                    "application/json",
                },
              }
            );

          const parts =
            response?.data
              ?.candidates?.[0]
              ?.content?.parts;

          for (const part of parts || []) {

            if (
              part?.inlineData?.data
            ) {

              images.push(
                `data:image/png;base64,${part.inlineData.data}`
              );
            }
          }

          break;

        } catch (error: any) {

          console.log(
            "IMAGE ERROR:",
            error?.response?.data ||
            error.message
          );

          if (
            error?.response?.status === 503
          ) {

            retries--;

            await sleep(3000);

            continue;
          }

          throw error;
        }
      }
    }

    return {
      images,
    };
};