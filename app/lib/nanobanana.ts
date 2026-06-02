import axios from "axios";

import { uploadBase64Image }
from "./uploadBase64";

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
    imageUrl: string,
    backgroundColor: any,
    backgroundType: string,
    backgroundImage: string
  ) => {

    const angles = [
  `
  FRONT VIEW:
  model facing camera directly,
  symmetric body posture,
  both shoulders visible,
  standing straight,
  full body visible,
  ecommerce catalog front angle
  `,

  `
  WALKING ANGLE:
  model walking naturally toward camera,
  one leg forward,
  realistic fashion runway movement, 
  dynamic kurta flow,
  full body visible,
  premium ecommerce fashion photography,
  3/4 body angle,
  natural confident walking pose
  `,

  `
  CLOSE-UP PORTRAIT:
  upper body close-up shot,
  chest to head visible,
  detailed embroidery focus,
  luxury fashion campaign framing,
  sharp facial details,
  premium ethnic fashion photography,
  detailed fabric texture visible
  `,
];
let colorDescription = "";

if (
  backgroundColor === "#EBB392"
) {

  colorDescription =
    "soft peach beige luxury backdrop";
}
    const images: string[] = [];

    // THIS WILL KEEP SAME MODEL

    let referenceImage =
      imageUrl;

    for (const angle of angles) {

      let retries = 3;

      while (retries > 0) {

        try {


       let backgroundPrompt = "";

if (
  backgroundType === "default"
) {

backgroundPrompt = `

Scene:
- luxury seamless studio backdrop
- warm neutral beige gray background
- soft matte studio wall
- subtle natural floor shadow
- minimal premium ethnicwear studio setup
- soft diffused lighting
- realistic commercial fashion photography
- clean luxury ecommerce environment
- plain elegant background
- smooth seamless floor transition
- no props
- no furniture
- no decorative elements
- no gradients
- no text
- no watermark
- same exact background in all images
- same lighting setup in all images
- same environment consistency

`;

}

else if (
  backgroundType === "solid"
) {

  backgroundPrompt = `

Scene:
- plain solid color background
- ${colorDescription}
- perfectly uniform backdrop
- no gradients
- no texture
- no shadows
- flat catalog background
`;

}

else if (
  backgroundType === "image"
) {

backgroundPrompt = `

Scene:
- use uploaded background reference image EXACTLY
- preserve same background structure
- preserve same background colors
- preserve same lighting mood
- preserve same wall and floor design
- preserve same environment composition
- background consistency is mandatory
- DO NOT invent new environment
- DO NOT change backdrop style
- keep same studio setup in all images
- preserve EXACT garment shape
- preserve EXACT embroidery placement
- preserve EXACT sleeves
- preserve EXACT neckline
- preserve EXACT fabric texture
- preserve EXACT outfit proportions
- outfit consistency is mandatory

`;

}

          const enhancedPrompt = `

Create ONE flat catalog fashion image.

IMPORTANT:
- 5:6 portrait ratio
- vertical fashion catalog framing
- full body centered composition
- preserve EXACT clothing design
- preserve EXACT colors
- preserve EXACT embroidery
- preserve EXACT fashion details
- DO NOT change the outfit
- each generated image MUST use a completely different camera angle
- do NOT repeat same body posture
- do NOT repeat same framing
- do NOT generate duplicate compositions
- every image must look like separate photoshoot shot

- preserve EXACT same model identity
- same face in all images
- same hairstyle in all images
- same human in all generations

POSE:
${angle}

Framing:
- full body visible
- head to toe visible
- centered model
- portrait composition

${backgroundPrompt}

CRITICAL:
- KEEP SAME EXACT MODEL in all generated images
- SAME FACE
- SAME SKIN TONE
- SAME BODY TYPE
- SAME PERSON
- SAME HAIRSTYLE
- SAME BACKGROUND STYLE in all images
- DO NOT change model identity between generations
- DO NOT generate different humans
- background consistency is mandatory
- preserve same environment across all outputs





`;


 

          const response =
            await axios.post(

              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${process.env.NANO_BANANA_API_KEY}`,

              {
                contents: [
                  {
                    parts: [


                      ...(backgroundType === "image"
  ? [
      {
        fileData: {
          mimeType:
            "image/jpeg",

          fileUri:
            backgroundImage,
        },
      },
    ]
  : []),

                      // REFERENCE IMAGE

                      {
                        fileData: {
                          mimeType:
                            "image/jpeg",

                         fileUri:
  referenceImage,
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

        let imageGenerated = false;

for (const part of parts || []) {

  if (
    part?.inlineData?.data
  ) {

    imageGenerated = true;

    const generatedImage =
      `data:image/png;base64,${part.inlineData.data}`;

    images.push(
      generatedImage
    );

    const uploadedReference =
      await uploadBase64Image(
        generatedImage
      );

    referenceImage =
      uploadedReference;
  }
}

if (imageGenerated) {

  break;

}

retries--;
await sleep(2000);

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