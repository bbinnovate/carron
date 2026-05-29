import { NextResponse }
from "next/server";

import { analyzeProduct }
from "../../lib/claude";

import { generateModelImage }
from "../../lib/nanobanana";

import { uploadBase64Image }
from "../../lib/uploadBase64";

import {
  db,
} from "../../lib/firebase";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export async function POST(
  req: Request
) {

  try {

    // REQUEST BODY

    const body =
      await req.json();

    const {
  imageUrl,
  gender,
} = body;

    // VALIDATION

    if (!imageUrl) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Image URL missing",
        },
        {
          status: 400,
        }
      );
    }

    // CLAUDE ANALYSIS

    const result =
      await analyzeProduct(
        imageUrl
      );

    // RAW CLAUDE TEXT

    const text =
      result?.content?.[0]?.text || "";

    console.log(
      "RAW CLAUDE RESPONSE:",
      text
    );

    // EXTRACT JSON

    const jsonMatch =
      text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {

      return NextResponse.json(
        {
          success: false,
          message:
            "No valid JSON found from Claude",
        },
        {
          status: 500,
        }
      );
    }

    const cleaned =
      jsonMatch[0];

    // PARSE JSON

    let parsed: any;

    try {

      parsed =
        JSON.parse(cleaned);

    } catch (parseError) {

      console.log(
        "JSON PARSE ERROR:",
        cleaned
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Claude returned invalid JSON",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "PARSED DATA:",
      parsed
    );

    // GENERATE MODEL IMAGE
let nanoResult: any;

let uploadedModelImages: string[] = [];

try {

  nanoResult =
    await generateModelImage(
      parsed.imagePrompt,
      gender,
      imageUrl
    );

  console.log(
    "NANO RESULT:",
    nanoResult
  );

  // SAFE CHECK

  if (
    !nanoResult?.images ||
    nanoResult.images.length === 0
  ) {

    return NextResponse.json(
      {
        success: false,
        message:
          "No images generated",
      },
      {
        status: 500,
      }
    );
  }

  // UPLOAD ALL IMAGES

  uploadedModelImages =
    await Promise.all(

      nanoResult.images.map(
        async (
          image: string
        ) => {

          return await uploadBase64Image(
            image
          );
        }
      )
    );

} catch (nanoError: any) {

  console.log(
    "NANO BANANA ERROR:",
    nanoError?.response?.data ||
    nanoError
  );

  return NextResponse.json(
    {
      success: false,
      message:
        "Nano Banana image generation failed",
    },
    {
      status: 500,
    }
  );
}
    // FINAL DATA

    const finalData = {

      imageUrl,

      generatedModelImages:
  uploadedModelImages || [],

      imagePrompt:
        parsed?.imagePrompt || "",

      title:
        parsed?.title || "",

      description:
        parsed?.description || "",

      metaTitle:
        parsed?.metaTitle || "",

      metaDescription:
        parsed?.metaDescription || "",

      gender,

      createdAt:
        serverTimestamp(),
    };

    // SAVE TO FIRESTORE

    await addDoc(
      collection(
        db,
        "products"
      ),
      finalData
    );

    // RESPONSE

    return NextResponse.json(
      {
        success: true,
        data: finalData,
      }
    );

  } catch (error: any) {

    console.log(
      "FINAL SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.response?.data?.error?.message ||
          error?.message ||
          "Generation failed",
      },
      {
        status: 500,
      }
    );
  }
}