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
    backImage: string,
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

  ...(backImage ? [

`
BACK VIEW:

MODEL MUST FACE AWAY FROM CAMERA

CRITICAL:
- camera positioned directly behind model
- only rear side visible
- no front garment visible
- no chest visible
- no front embroidery visible
- no front neckline visible

GARMENT ACCURACY:
- use uploaded BACK IMAGE as source of truth
- back design must match uploaded back image exactly
- reproduce exact rear embroidery
- reproduce exact rear stitching
- reproduce exact rear neckline
- reproduce exact rear fabric texture
- reproduce exact rear garment structure
- reproduce exact rear silhouette
- reproduce exact rear color placement

DO NOT:
- invent any rear design
- guess rear embroidery
- use front design on rear side
- generate a different back pattern
- modify rear garment details

POSE:
- standing straight
- arms relaxed
- full body visible
- head to toe visible
- centered composition

OUTPUT:
- premium ecommerce catalog photography
- professional studio quality
- rear garment fully visible
`

] : [])
];

let colorDescription = "neutral studio backdrop";

switch (backgroundColor?.toUpperCase()) {
  case "#A9B682":
    colorDescription =
      "soft sage green luxury backdrop";
    break;

  case "#ACD4E4":
    colorDescription =
      "soft pastel blue luxury backdrop";
    break;

  case "#F1B492":
    colorDescription =
      "soft peach beige luxury backdrop";
    break;

  case "#FFFFFF":
    colorDescription =
      "pure white seamless studio backdrop";
    break;

  default:
    colorDescription =
      "neutral luxury studio backdrop";
}
    const images: string[] = [];

    // THIS WILL KEEP SAME MODEL

let garmentReference = imageUrl;
let modelReference = "";

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
- background color exactly ${backgroundColor}
- perfectly uniform backdrop
- use this exact hex color ${backgroundColor}
- no gradients
- no texture
- flat studio catalog background
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

- First reference image is FRONT VIEW of the garment
- Second reference image is BACK VIEW of the garment
- Use BOTH images to understand the complete outfit
- Preserve front design exactly
- Preserve back design exactly
- Preserve rear embroidery exactly
- Preserve rear stitching exactly
- Preserve rear neckline exactly
- Preserve rear fabric folds exactly
- Never invent the back side
- Back side must match uploaded back reference image

POSE:
${angle}

Framing:
- full body visible
- head to toe visible
- centered model
- portrait composition

${backgroundPrompt}

REFERENCE MODEL RULE:

The uploaded reference image contains the exact model identity.

Use the same face.
Use the same skin tone.
Use the same hairstyle.
Use the same body shape.
Use the same age.
Use the same model in every image.

Never generate a different person.

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



BACK GARMENT REFERENCE:

Use the uploaded back garment image
as source of truth.

Recreate rear embroidery exactly.
Recreate rear neckline exactly.
Recreate rear stitching exactly.
Recreate rear fabric texture exactly.
Do not invent rear details.



REFERENCE HIERARCHY:

1. Previous generated model image = source of identity
2. Front garment image = source of garment details
3. Back garment image = source of rear details

Never change identity.
Never change background.
Never change lighting.

`;



console.log(
  "FRONT:",
  garmentReference
);

console.log(
  "BACK:",
  backImage
);

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

                      ...(modelReference
  ? [
      {
        fileData: {
          mimeType: "image/jpeg",
          fileUri: modelReference,
        },
      },
    ]
  : []),

{
  fileData: {
    mimeType: "image/jpeg",
    fileUri: garmentReference,
  },
},


                     ...(angle.includes("BACK VIEW") &&
backImage
  ? [
      {
        fileData: {
          mimeType: "image/jpeg",
          fileUri: backImage,
        },
      },
    ]
  : []),

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

let addedImageForThisAngle = false;

for (const part of parts || []) {

  if (!part?.inlineData?.data) {
    continue;
  }

  // TAKE ONLY FIRST IMAGE
  if (addedImageForThisAngle) {
    continue;
  }

  addedImageForThisAngle = true;
  imageGenerated = true;

  const generatedImage =
    `data:image/png;base64,${part.inlineData.data}`;

  images.push(generatedImage);

const uploadedReference =
  await uploadBase64Image(
    generatedImage
  );

modelReference =
  uploadedReference;




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


  

const expectedCount =
  backImage ? 4 : 3;

if (
  images.length < expectedCount
) {
  throw new Error(
    `Expected ${expectedCount} images but got ${images.length}`
  );
}

    return {
  images: images.slice(
    0,
    backImage ? 4 : 3
  ),
};
};