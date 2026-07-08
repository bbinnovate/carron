import { NextResponse }
from "next/server";


import { generateModelImage }
from "../../lib/nanobanana";
import { analyzeProduct }
from "../../lib/claude";

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

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  req: Request
) {

  try {

    // REQUEST BODY

    const body =
      await req.json();

    const {
      imageUrls,
      backImage,
      gender,
      backgroundColor,
      backgroundType,
      backgroundImage,
      text,
    } = body;

    // VALIDATION

    if (
      !imageUrls ||
      imageUrls.length === 0
    ) {

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



    // GENERATE MODEL IMAGE

    let nanoResult: any;

    let uploadedModelImages: string[] = [];

    try {

      nanoResult =
        await generateModelImage(
          gender,
          imageUrls[0],
          backImage,
          backgroundColor,
          backgroundType,
          backgroundImage,
          text,
        );

      console.log(
        "NANO RESULT:",
        nanoResult
      );

      // SAFE CHECK

      if (!nanoResult?.images?.length) {
    return NextResponse.json(
        {
            success: false,
            message: "No images generated.",
        },
        {
            status: 500,
        }
    );
}

console.log(
    `Received ${nanoResult.images.length} generated images`
);

      // UPLOAD ALL GENERATED IMAGES

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

        if (backImage) {

  console.log(
        "back img",
      );

}

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
        nanoError?.response?.data?.error?.message ||
        nanoError?.message ||
        "Nano Banana image generation failed",
    },
    {
      status:
        nanoError?.response?.status || 500,
    }
  );
}

    // FINAL DATA

    let productContent: any = null;
    try {
      if (imageUrls && imageUrls.length > 0) {
         productContent = await analyzeProduct(imageUrls[0]);
         if (typeof productContent === "string") {
            try {
              productContent = JSON.parse(productContent);
            } catch(e){}
         }
      }
    } catch(err) {
      console.log("Claude analysis failed", err);
    }

    const finalData = {

      uploadedProductImages:
        imageUrls || [],

      generatedModelImages:
        uploadedModelImages || [],

         backImage:
    backImage || "",

      imagePrompt: "",
title: productContent?.title || "",
description: productContent?.description || "",
metaTitle: productContent?.metaTitle || "",
metaDescription: productContent?.metaDescription || "",

      gender,

      backgroundColor:
        backgroundColor || "",

      backgroundType:
        backgroundType || "",

      backgroundImage:
        backgroundImage || "",

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





































































