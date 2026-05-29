
import { NextResponse }
from "next/server";

import {
  db,
} from "../../lib/firebase";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import {
  createShopifyProduct,

} from "../../lib/shopify";

export async function POST(
  req: Request
) {

  try {

    const body =
      await req.json();

    const {
      productId,
    } = body;

    if (!productId) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Product ID missing",
        },
        {
          status: 400,
        }
      );
    }

    // FIRESTORE PRODUCT

    const productRef =
      doc(
        db,
        "products",
        productId
      );

    const productSnap =
      await getDoc(
        productRef
      );

    if (
      !productSnap.exists()
    ) {

      return NextResponse.json(
        {
          success: false,
          message:
            "Product not found",
        },
        {
          status: 404,
        }
      );
    }

    const productData =
      productSnap.data();

    // CREATE SHOPIFY PRODUCT

    const shopifyProduct =
      await createShopifyProduct(
        productData
      );

    // DRAFT LINK




const previewLink =`https://${process.env.SHOPIFY_STORE_URL}/products/${shopifyProduct.handle}`;





    // UPDATE FIRESTORE

    await updateDoc(
      productRef,
      {
        shopifyProductId:
          shopifyProduct.id,

        shopifyDraftLink:
          previewLink,

        syncedToShopify:
          true,
      }
    );

    return NextResponse.json(
      {
        success: true,

        draftLink:
          previewLink,
      }
    );

  } catch (error: any) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.response?.data ||
          error?.message ||
          "Shopify sync failed",
      },
      {
        status: 500,
      }
    );
  }
}

