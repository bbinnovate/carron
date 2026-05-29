
import axios from "axios";

interface ShopifyProductData {
  title?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  generatedModelImages?: string[];
}

export const createShopifyProduct =
  async (
    product: ShopifyProductData
  ) => {

    try {

      // CREATE PRODUCT

      const response =
        await axios.post(

          `https://${process.env.SHOPIFY_STORE_URL}/api/${process.env.SHOPIFY_API_VERSION}/products.json`,

          {
            product: {

              title:
                product.title,

              body_html:
                product.description,

              status:
                "draft",

              published:
                true,

              published_scope:
                "web",

              images:
                (
                  product.generatedModelImages || []
                ).map(
                  (image) => ({
                    src: image,
                  })
                ),

              metafields: [

                {
                  namespace: "custom",
                  key: "meta_title",
                  value:
                    product.metaTitle || "",
                  type:
                    "single_line_text_field",
                },

                {
                  namespace: "custom",
                  key: "meta_description",
                  value:
                    product.metaDescription || "",
                  type:
                    "multi_line_text_field",
                },

              ],
            },
          },

          {
            headers: {

              "X-Shopify-Access-Token":
                process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,

              "Content-Type":
                "application/json",
            },
          }
        );

      const createdProduct =
        response.data.product;

      // GET PREVIEW LINK

      const previewResponse =
        await axios.get(

          `https://${process.env.SHOPIFY_STORE_URL}/api/${process.env.SHOPIFY_API_VERSION}/products/${createdProduct.id}.json`,

          {
            headers: {

              "X-Shopify-Access-Token":
                process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,

              "Content-Type":
                "application/json",
            },
          }
        );

      const storefrontUrl =
        previewResponse.data.product;

      return {
  ...createdProduct,
  preview_url: storefrontUrl,
};

    } catch (error: any) {

      console.log(
        "SHOPIFY ERROR:",
        error?.response?.data ||
        error.message
      );

      throw error;
    }
};
