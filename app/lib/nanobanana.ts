import axios from "axios";
import path from "path";
import fs from "fs";

import { uploadBase64Image }
from "./uploadBase64";

const sleep = (
  ms: number
) =>
  new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );

const imageUrlToInlineData =
  async (url: string) => {

    const dataUrlMatch =
      url.match(
        /^data:(.*?);base64,(.*)$/
      );

    if (dataUrlMatch) {

      return {
        inlineData: {
          mimeType:
            dataUrlMatch[1] ||
            "image/png",
          data:
            dataUrlMatch[2],
        },
      };
    }

    const response =
      await axios.get(
        url,
        {
          responseType:
            "arraybuffer",
        }
      );

    const contentType =
      response.headers[
        "content-type"
      ];

    const mimeType =
      typeof contentType === "string"
        ? contentType.split(";")[0]
        : "image/jpeg";

    return {
      inlineData: {
        mimeType,
        data:
          Buffer.from(
            response.data
          ).toString("base64"),
      },
    };
  };

export const generateModelImage = async (
  gender: string,
  imageUrl: string,
  backImage: string,
  backgroundColor: any,
  backgroundType: string,
  backgroundImage: string,
  text: string
) => {
    let basePrompt = "";
    try {
      if (gender?.toLowerCase() === "male") {
        basePrompt = fs.readFileSync(path.join(process.cwd(), "app", "components", "maleprompt"), "utf-8");
      } else {
        basePrompt = fs.readFileSync(path.join(process.cwd(), "app", "components", "femaleprompt"), "utf-8");
      }
    } catch (e) {
      console.log("Error reading prompt files", e);
      basePrompt = "Follow the uploaded product reference images exactly.";
    }

    const angles = [
  `
  FRONT VIEW:
  model facing camera directly,
  symmetric body posture,
  both shoulders visible,
  standing straight,
  full body visible,
  exact front garment length visible from neckline to hem,
  exact sleeve length and hemline position preserved,
  ecommerce catalog front angle
  `,

  `
  WALKING ANGLE:
  model walking naturally toward camera,
  one leg forward,
  realistic fashion runway movement, 
  natural garment movement without changing length or silhouette,
  exact hemline remains at the same body landmark as reference,
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
  exact neckline, collar, placket, shoulder seams, sleeve opening, print scale, stitching, texture, and embellishments preserved,
  luxury fashion campaign framing,
  sharp facial details,
  natural skin pores and realistic facial features,
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
- reproduce exact rear garment length
- reproduce exact rear hemline position
- reproduce exact rear sleeve length
- reproduce exact rear seam, border, slit, panel, logo, print, trim, and embellishment placement

DO NOT:
- invent any rear design
- guess rear embroidery
- use front design on rear side
- generate a different back pattern
- modify rear garment details
- lengthen or shorten the garment
- move the hemline, sleeve ends, print, embroidery, border, seams, slits, or trims

POSE:
- standing straight
- arms relaxed
- full body visible
- head to toe visible
- centered composition
- exact garment length and proportions clearly visible

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

    const originalFrontImagePart = await imageUrlToInlineData(imageUrl);

    let referenceImage =
      imageUrl;

    const backImagePart =
      backImage
        ? await imageUrlToInlineData(
            backImage
          )
        : null;

    const backgroundImagePart =
      backgroundType === "image" &&
      backgroundImage
        ? await imageUrlToInlineData(
            backgroundImage
          )
        : null;

    for (const angle of angles) {

      const referenceImagePart =
        await imageUrlToInlineData(
          referenceImage
        );

      let retries = 5;

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
- high-end fashion campaign lighting with natural skin tones
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
- premium commercial studio lighting
- natural realistic skin tones
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
- preserve EXACT clothing length
- preserve EXACT hemline position
- preserve EXACT sleeve length
- preserve EXACT fit and silhouette
- preserve EXACT print, logo, border, seam, slit, button, trim, and embellishment placement
- outfit consistency is mandatory

`;

}

          const enhancedPrompt = `
${basePrompt}

Use this product analysis as a binding product description:
${text || "Follow the uploaded product reference images exactly."}

IMPORTANT:
- 5:6 portrait ratio
- vertical fashion catalog framing
- full body centered composition
- generate a realistic ${gender || "fashion"} model who looks like a real person in a professional photoshoot
- natural skin texture, visible pores, realistic facial features, accurate hands, accurate feet, correct fingers, realistic body proportions
- high-end ecommerce and fashion campaign quality, sharp garment details, realistic fabric behavior, natural posture
- preserve EXACT clothing design from the uploaded product reference
- preserve EXACT garment type and category
- preserve EXACT garment length, including top length, dress length, pant length, sleeve length, hemline position, inseam, rise, neckline depth, shoulder width, cuff position, and overall proportions
- preserve EXACT fit, drape, silhouette, flare, taper, looseness/tightness, waistband placement, slit height, panel shape, and fabric fall
- preserve EXACT colors, color blocking, shade, saturation, contrast, and material finish
- preserve EXACT embroidery, prints, logos, labels, borders, trims, buttons, plackets, pockets, pleats, seams, stitching, embellishments, hardware, texture, weave, sheen, opacity, and pattern scale
- DO NOT change, redesign, recolor, simplify, stylize, crop, lengthen, shorten, widen, tighten, loosen, replace, or accessorize the outfit
- DO NOT move embroidery, prints, logos, borders, hems, seams, buttons, trims, pockets, slits, pleats, or embellishments
- the generated garment must look like the same physical product from the uploaded image, photographed on a model
- each generated image MUST use a completely different camera angle
- do NOT repeat same body posture
- do NOT repeat same framing
- do NOT generate duplicate compositions
- every image must look like separate photoshoot shot

- preserve EXACT same model identity
- same face in all images
- same hairstyle in all images
- same human in all generations
- realistic human anatomy in all generations
- no plastic skin, no doll face, no CGI look, no mannequin, no waxy skin, no distorted hands, no extra fingers, no warped limbs

- First reference image is FRONT VIEW of the garment
- Second reference image is BACK VIEW of the garment
- Use BOTH images to understand the complete outfit
- Preserve front design exactly
- Preserve back design exactly
- Preserve rear embroidery exactly
- Preserve rear stitching exactly
- Preserve rear neckline exactly
- Preserve rear fabric folds exactly
- Preserve exact garment length from all visible references
- Preserve exact front and rear hemline position
- Preserve exact sleeve length and cuff position
- Preserve exact silhouette, fit, drape, and proportions
- Never invent the back side
- Back side must match uploaded back reference image

POSE:
${angle}

Framing:
- full body visible
- head to toe visible
- centered model
- portrait composition
- leave enough space around head and feet so the garment is not cropped
- garment length must be readable in the frame

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
- uploaded product is mandatory source of truth
- garment identity, length, fit, silhouette, color, material, texture, stitching, print, logo, embroidery, trims, and embellishments are mandatory
- reject any result that looks like a similar but different product

Do not change:
- Design
- Color
- Pattern
- Texture
- Material
- Stitching
- Logos
- Embellishments
- Shape
- Fit
- Garment length
- Any other product details

PANTS HANDLING:
If the uploaded product image contains only the upper garment (for example, just a shirt, T-shirt, hoodie, jacket, or top), and no pants are provided, automatically add simple pants that perfectly match the color of the upper garment.
The generated pants should:
- Exactly match the color of the upper garment.
- Be plain and minimal.
- Not distract from the main product.
- Match the overall style naturally.
- Never become the focus of the image.

The uploaded product should always remain the primary focus.
`;


          const response =
            await axios.post(

              `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${process.env.NANO_BANANA_API_KEY}`,

              {
                contents: [
                  {
                    parts: [


                      


                      ...(backgroundType === "image" &&
  backgroundImagePart
  ? [backgroundImagePart]
  : []),

                      // REFERENCE IMAGE

                      ...(angle.includes("BACK VIEW") && backImagePart
                        ? [originalFrontImagePart, backImagePart]
                        : [referenceImagePart]),

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

  referenceImage =
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

            await sleep(7000);

            continue;
          }

          throw error;
        }
      }


      const isBackView =
  angle.includes("BACK VIEW");
    }


    const imageParts = [

  {
    fileData: {
      mimeType: "image/jpeg",
      fileUri: imageUrl,
    },
  },

];


// Nothing generated
if (images.length === 0) {
  throw new Error("No images were generated.");
}

console.log(
  `Generated ${images.length} image(s).`
);

// Return every successfully generated image
return {
  images,
};
};
