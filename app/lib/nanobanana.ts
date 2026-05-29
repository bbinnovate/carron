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
    prompt: string,
    gender: string,
    imageUrl: string
  ) => {

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

Create ONE realistic ecommerce fashion model image.

IMPORTANT: is 1 r
- 1:1 square ratio
- ultra realistic
- premium luxury ecommerce photoshoot
- preserve EXACT clothing design
- preserve EXACT colors
- preserve EXACT embroidery
- preserve EXACT fashion details
- DO NOT change the outfit

Use a ${
  gender === "female"
    ? "female"
    : "male"
} fashion model.

Pose:
${angle}

Scene:
- luxury studio
- cinematic lighting
- premium ecommerce photography
- realistic skin texture

Product details:
 

`;

          const response =
            await axios.post(

              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.NANO_BANANA_API_KEY}`,

              {
                contents: [
                  {
                    parts: [

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