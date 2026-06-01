
"use client";

import axios from "axios";
import { useState } from "react";
import {
  db,
} from "../lib/firebase";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from "firebase/firestore";

import {
  useEffect,
} from "react";
import { uploadImage } from "../lib/upload";

interface ProductData {
  id?: string;
  generatedModelImages?: string[];
  imagePrompt?: string;
  title?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  gender?: string;
  shopifyDraftLink?: string;
syncedToShopify?: boolean;
}
export default function UploadForm() {

  const [loading, setLoading] =
    useState(false);
    

 const [products, setProducts] =
  useState<ProductData[]>([]);

  const [error, setError] =
    useState("");

 const [previews, setPreviews] =
  useState<string[]>([]);

    const [selectedFiles, setSelectedFiles] =
  useState<File[]>([]);

    const [selectedGender, setSelectedGender] =
  useState("male");

  const [currentPage, setCurrentPage] =
  useState(1);


const [selectedProducts, setSelectedProducts] =
  useState<string[]>([]);

const [bulkSyncLoading, setBulkSyncLoading] =
  useState(false);


  const [previewModal, setPreviewModal] =
  useState("");

const nonDraftProducts =
  products.filter(
    (product) =>
      !product.syncedToShopify
  );

const allSelected =
  nonDraftProducts.length > 0 &&
  selectedProducts.length ===
    nonDraftProducts.length;



  const fetchProducts =
  async () => {

    try {

      const q = query(
        collection(
          db,
          "products"
        ),
        orderBy(
          "createdAt",
          "desc"
        )
      );

      const snapshot =
        await getDocs(q);

      const fetchedProducts =
        snapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

      setProducts(
        fetchedProducts as unknown as ProductData[]
      );

    } catch (error) {

      console.log(error);
    }
};

useEffect(() => {

  fetchProducts();

}, []);

const handleUpload = (
  e: React.ChangeEvent<HTMLInputElement>
) => {

  const files =
  Array.from(
    e.target.files || []
  ).slice(0, 4);

if (
  files.length > 4
) {

  setError(
    "You can upload maximum 4 images only."
  );

  return;
}

  setSelectedFiles(files);

  const previewUrls =
    files.map(
      (file) =>
        URL.createObjectURL(file)
    );

  setPreviews(previewUrls);

 

  setError("");
};


const handleGenerate =
  async () => {

    try {

      if (!selectedFiles.length) {

        setError(
          "Please upload an image first."
        );

        return;
      }

      setLoading(true);

      setError("");

      // UPLOAD TO FIREBASE

      const uploadedImages =
        await Promise.all(
          selectedFiles.map(async (file) => {
            return await uploadImage(file);
          })
        );

      // CALL API

      const response =
        await axios.post(
          "/api/generate",
          {
            imageUrl:
  uploadedImages[0],
            gender:
              selectedGender,
          }
        );

      if (
        !response.data.success
      ) {

        throw new Error(
          response.data.message
        );
      }

      await fetchProducts();

    } catch (err: any) {

      console.log(err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong."
      );

    } finally {

      setLoading(false);
    }
};


const removePreview = (
  indexToRemove: number
) => {

  const updatedPreviews =
    previews.filter(
      (_, index) =>
        index !== indexToRemove
    );

  const updatedFiles =
    selectedFiles.filter(
      (_, index) =>
        index !== indexToRemove
    );

  setPreviews(updatedPreviews);

  setSelectedFiles(updatedFiles);
};


const handleShopifySync =
  async (
    productId?: string
  ) => {

    try {

      if (!productId) return;

      const response =
        await axios.post(
          "/api/shopify-sync",
          {
            productId,
          }
        );

      if (
        !response.data.success
      ) {

        throw new Error(
          response.data.message
        );
      }

      await fetchProducts();

    } catch (error: any) {

      console.log(error);

      alert(
        error?.response?.data?.message ||
        "Shopify sync failed"
      );
    }
};


const handleBulkShopifySync =
  async () => {

    try {

      setBulkSyncLoading(true);

      for (const productId of selectedProducts) {

        await axios.post(
          "/api/shopify-sync",
          {
            productId,
          }
        );
      }

      await fetchProducts();

      setSelectedProducts([]);

    } catch (error) {

      console.log(error);

      alert(
        "Bulk Shopify sync failed"
      );

    } finally {

      setBulkSyncLoading(false);
    }
};



const handleSelectAll =
  () => {

    if (allSelected) {

      setSelectedProducts([]);

    } else {

      const allIds =
        nonDraftProducts
          .map(
            (product) =>
              product.id
          )
          .filter(Boolean) as string[];

      setSelectedProducts(allIds);
    }
};



const handleDeleteAllProducts =
  async () => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete all products?"
      );

    if (!confirmDelete) return;

    try {

      const snapshot =
        await getDocs(
          collection(
            db,
            "products"
          )
        );

      const deletePromises =
        snapshot.docs.map(
          async (product) => {

            await deleteDoc(
              doc(
                db,
                "products",
                product.id
              )
            );
          }
        );

      await Promise.all(
        deletePromises
      );

      setProducts([]);

      setSelectedProducts([]);

      alert(
        "All products deleted successfully"
      );

    } catch (error: any) {

      console.log(error);

      alert(
        error?.message ||
        "Delete failed"
      );
    }
};

  return (

    <div className="container mx-auto px-4 py-4 bg-white">

      <div>

        {/* HEADER */}
        <div className="text-center mb-12">

          <h1 className="text-5xl font-bold mb-4 title-highlight">
            AI Product Generator
          </h1>

          <p className="text-lg subtitle-highlight max-w-2xl mx-auto">
            Upload any product image and
            generate SEO content,
            descriptions, titles,
            meta data, and AI model visuals.
          </p>

        </div>

{/* UPLOAD SECTION */}
<div
  className="
    bg-gray-50
    border
    border-gray-200
    rounded-[10px]
    p-4
    md:p-8
    shadow-sm
  "
>

  {/* UPLOAD BOX */}

  <label
    htmlFor="fileUpload"
    className="
      border-2
      border-dashed
      border-gray-300
      rounded-[10px]
      px-6
      py-12
      md:px-10
      md:py-16
      flex
      flex-col
      items-center
      justify-center
      cursor-pointer
      transition
      hover:border-[var(--highlight)]
      hover:bg-white
      text-center
    "
  >

    <div
      className="
        w-16
        h-16
        md:w-20
        md:h-20
        rounded-full
        bg-[var(--highlight)]
        text-white
        flex
        items-center
        justify-center
        text-3xl
        mb-5
      "
    >
      ↑
    </div>

    <h3
      className="
        text-2xl
        md:text-3xl
        font-semibold
        title-highlight
        mb-3
      "
    >
     Upload Raw Images
    </h3>

    <p
      className="
        subtitle-highlight
        text-sm
        md:text-base
      "
    >
  Supports PNG, JPG, and WEBP. Upload up to 4 images at a time for a single product. Each product generation can take up to 2–3 minutes.
    </p>

    <input
  id="fileUpload"
  type="file"
  multiple
  accept="image/*"
  onChange={handleUpload}
  className="hidden"
/>

  </label>

  {/* IMAGE PREVIEW */}

{previews.length > 0 && (

  <div
    className="
      mt-8
      grid
      grid-cols-4
sm:grid-cols-5
md:grid-cols-7
lg:grid-cols-9
xl:grid-cols-10
      gap-3
    "
  >

    {previews.map(
      (
        image,
        index
      ) => (

        <div
          key={index}
          className="
            relative
            w-full
            aspect-square
          "
        >

          {/* REMOVE BUTTON */}

          <button
            type="button"
            onClick={() =>
              removePreview(index)
            }
            className="
              absolute
              -top-2
              -left-2
              z-20
              w-6
              h-6
              rounded-full
              cursor-pointer
              bg-black
              text-white
              text-xs
              flex
              items-center
              justify-center
              shadow-md
            "
          >
            ✕
          </button>

          {/* IMAGE BOX */}

          <div
            className="
              w-full
              h-full
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
            "
          >

            <img
              src={image}
              alt=""
              className="
                w-full
                h-full
                object-cover
              "
            />

          </div>

        </div>

      )
    )}

  </div>

)}




  {/* GENDER SELECTION */}

  <div
    className="
      mt-10
      flex
      flex-row
      sm:flex-row
      items-center
      justify-center
      gap-4
    "
  >

    <label
      className="
        flex
        items-center
        gap-3
        cursor-pointer
        bg-white
        border
        border-gray-200
        rounded-[10px]
        px-6
        py-4
        min-w-[180px]
        justify-center
      "
    >

      <input
        type="radio"
        value="male"
        checked={selectedGender === "male"}
        onChange={(e) =>
          setSelectedGender(e.target.value)
        }
        className="w-5 h-5"
      />

      <span className="font-medium">
        Male Model
      </span>

    </label>

    <label
      className="
        flex
        items-center
        gap-3
        cursor-pointer
        bg-white
        border
        border-gray-200
        rounded-[10px]
        px-6
        py-4
        min-w-[180px]
        justify-center
      "
    >

      <input
        type="radio"
        value="female"
        checked={selectedGender === "female"}
        onChange={(e) =>
          setSelectedGender(e.target.value)
        }
        className="w-5 h-5"
      />

      <span className="font-medium">
        Female Model
      </span>

    </label>

  </div>

  {/* GENERATE BUTTON */}

  {/* {previews.length > 0 && !loading && ( */}

<div className="flex justify-center mt-10">

  <button
    onClick={handleGenerate}
    disabled={loading}
    className="
      bg-[var(--highlight)]
      text-white

      px-8
      md:px-12

      py-4

      rounded-[10px]

      font-semibold
      text-base
      md:text-lg

      hover:opacity-90
      transition

      w-full
      sm:w-auto

      disabled:opacity-70
      disabled:cursor-not-allowed

      flex
      items-center
      justify-center
      gap-4
    "
  >

    {loading && (

      <div
        className="
          w-5
          h-5
          border-2
          border-white
          border-t-transparent
          rounded-full
          animate-spin
          shrink-0
        "
      />

    )}

    <span>

      {
        loading
          ? "Generating Product..."
          : "Start Generation"
      }

    </span>

  </button>

</div> 

  {/* ERROR */}

  {error && (

    <div
      className="
        mt-8
        bg-red-100
        border
        border-red-300
        text-red-700
        px-5
        py-4
        rounded-[10px]
      "
    >

      {error}

    </div>

  )}

</div>


{/* <div
  className="
    flex
    items-center
    justify-end
    mb-6
  "
>

  <button
    onClick={handleDeleteAllProducts}
    className="
      bg-red-600
      text-white
      px-6
      py-3
      rounded-[10px]
      font-semibold
      hover:bg-red-700
      transition
    "
  >
    Delete All Products
  </button>

</div> */}

        {/* RESULT */}

<div className="mt-14">

  {(() => {

    const isMobile =
      typeof window !== "undefined" &&
      window.innerWidth < 768;

    const itemsPerPage =
      isMobile ? 5 : 50;

      const totalPages =
  Math.ceil(
    products.length /
    itemsPerPage
  );



    const paginatedData =
      products.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      );

    return (

      <div
        className="
          bg-white
          border
          border-gray-200
          rounded-[10px]
          shadow-sm
          overflow-visible
        "
      >

        {/* DESKTOP HEADER */}


        

      <div
  className="
    sticky
top-0
left-0
right-0
z-50
    hidden
    lg:grid
    lg:grid-cols-[150px_280px_1.2fr_2fr_250px]
    items-center
    bg-[var(--highlight)]
    text-white
    px-8
    py-3
    font-semibold
    rounded-t-[10px]
  "
>


  

<div
  className="
    flex
    items-center
    gap-4
  "
>

  <input
    type="checkbox"
    checked={allSelected}
    onChange={handleSelectAll}
    className="
      w-5
      h-5
      cursor-pointer
    "
  />

  <div
    className="
      flex
      items-center
      gap-1
      whitespace-nowrap
    "
  >

    <span
      className="
        font-semibold
      "
    >
      All
    </span>

    <span
      className="
        opacity-50
      "
    >
      |
    </span>

    <span
      className="
        font-semibold
      "
    >
      Sr No
    </span>

  </div>

</div>

  <div>
    Images
  </div>

  <div>
    Title
  </div>

  <div>
    Description
  </div>

  <div className="flex justify-end">

    {selectedProducts.length > 0 && (

      <button
        onClick={handleBulkShopifySync}
        disabled={bulkSyncLoading}
        className="
          bg-white
          text-black
          px-6
          py-3
          rounded-[10px]
          font-semibold
          hover:opacity-90
          transition
          whitespace-nowrap
        "
      >
        {
          bulkSyncLoading
            ? "Syncing..."
            : `Sync (${selectedProducts.length})`
        }
      </button>

    )}

  </div>

</div>




<div

className="
  sticky
  top-0
  left-0
  right-0
  z-50

  bg-[var(--highlight)]
  text-white

  px-4
  py-3

  rounded-t-[10px]

  flex
  items-center
  justify-between

  lg:hidden
  w-full
"
>

<div
  className="
    flex
    items-center
    gap-4
  "
>

  {/* CHECKBOX */}

  <input
    type="checkbox"
    checked={allSelected}
    onChange={handleSelectAll}
    className="
      w-5
      h-5
      cursor-pointer
      shrink-0
    "
  />

  {/* TEXT */}

  <div
    className="
      flex
      items-center
      gap-3
      whitespace-nowrap
    "
  >

    <span
      className="
        font-semibold
        text-base
      "
    >
      All
    </span>

    <span
      className="
        opacity-40
      "
    >
      |
    </span>

   
 

    <div
      className="
        text-left
        font-semibold
        text-xl
        md:text-2xl
        leading-none
      "
    >
      Products
    </div>

  </div>

</div>



  {selectedProducts.length > 0 && (

    <div
      className="
        flex
        justify-end
      "
    >

      <button
        onClick={handleBulkShopifySync}
        disabled={bulkSyncLoading}
        className="
          bg-white
          text-black
          px-4
          sm:px-3
          py-2.5
          sm:py-3
          rounded-[10px]
          font-semibold
          hover:opacity-90
          transition
          text-sm
          sm:text-base
          whitespace-nowrap
        "
      >
        {
          bulkSyncLoading
            ? "Syncing..."
            : `Sync To Shopify (${selectedProducts.length})`
        }
      </button>

    </div>

  )}

</div>


        {/* TABLE BODY */}

        <div className="w-full">

          {paginatedData.length > 0 ? (

            paginatedData.map(
              (
                item,
                index
              ) => (

                <div
                  key={index}
                  className="
                    border-b
                    border-gray-200

                    lg:grid
          lg:grid-cols-[100px_120px_1.2fr_2fr]


                    lg:gap-6
                    lg:px-6
                    lg:py-6
                    lg:items-center

                    flex
                    flex-col
                    gap-5
                    p-5
                  "
                >

                  {/* MOBILE SR */}

       
<div
  className="
    flex
    items-center
    gap-4
  "
>

  <input
    type="checkbox"

    disabled={
      item.syncedToShopify
    }

    checked={
      selectedProducts.includes(
        item.id || ""
      )
    }

    onChange={(e) => {

      if (
        !item.id ||
        item.syncedToShopify
      ) return;

      if (e.target.checked) {

        setSelectedProducts([
          ...selectedProducts,
          item.id,
        ]);

      } else {

        setSelectedProducts(
          selectedProducts.filter(
            (id) =>
              id !== item.id
          )
        );
      }
    }}

    className={`
      w-5
      h-5

      ${
        item.syncedToShopify

          ? "cursor-not-allowed opacity-40"

          : "cursor-pointer"
      }
    `}
  />

  <span
    className="
      text-lg
      font-semibold
    "
  >
    #{index + 1}
  </span>

  {/* {item.syncedToShopify && (

    <span
      className="
        text-xs
        bg-green-100
        text-green-700
        px-3
        py-1
        rounded-full
        font-medium
      "
    >
      Drafted
    </span>

  )} */}

</div>



                  {/* IMAGE */}

                  <div
                    className="
                      flex
                      justify-start
                    "
                  >

                    <img
  onClick={() =>
    setPreviewModal(
      item.generatedModelImages?.[0] || ""
    )
  }
  src={
    item.generatedModelImages?.[0] ||
    "/placeholder.png"
  }
                      alt=""
                      className="
                        w-24
                        h-28
                        lg:w-20
                        lg:h-30
                        rounded-[10px]
                        object-contain
                        border
                        border-gray-200
                        cursor-pointer
hover:scale-105
transition
                        shrink-0
                      "
                    />

                  </div>

                  {/* TITLE */}

                  <div>

                    <h2
                      className="
                      title-highlight
                        text-xl
                        lg:text-lg
                        font-semibold
                        leading-8
                        text-left
                      "
                    >
                      {item.title}
                    </h2>

                  </div>

                  {/* DESCRIPTION */}

                  <div>

                    <p
                      className="
                        subtitle-highlight
                        leading-7
                        text-sm
                        lg:text-base
                        text-left
                        line-clamp-3
                      "
                    >
                      {item.description}
                    </p>

                  </div>

                  {/* ACTION */}

                 

                </div>

              )
            )

          ) : (

            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                py-24
                text-center
              "
            >

              <div
                className="
                  w-24
                  h-24
                  rounded-[10px]
                  bg-gray-100
                  flex
                  items-center
                  justify-center
                  text-5xl
                  mb-6
                "
              >
                📦
              </div>

              <h2
                className="
                  text-2xl
                  font-bold
                  mb-3
                "
              >
                No Products Yet
              </h2>

              <p
                className="
                  text-gray-500
                  max-w-md
                  leading-7
                "
              >
                Generated products
                will appear here.
              </p>

            </div>

          )}

        </div>

        {/* PAGINATION */}

     
<div
  className="
    flex
    items-center
    justify-center
    gap-3
    p-6
    border-t
    border-gray-200
    flex-wrap
  "
>

  {/* PREV */}

  <button
    disabled={currentPage === 1}
    onClick={() =>
      setCurrentPage(
        (prev) => prev - 1
      )
    }
    className="
      px-5
      py-2
      border
      border-gray-300
      rounded-[10px]
      hover:bg-gray-100
      transition
      disabled:opacity-40
      disabled:cursor-not-allowed
    "
  >
    Prev
  </button>

  {/* PAGE NUMBERS */}

  {Array.from(
    {
      length: totalPages,
    },
    (_, index) => (

      <button
        key={index}
        onClick={() =>
          setCurrentPage(
            index + 1
          )
        }
        className={`
          px-5
          py-2
          rounded-[10px]
          transition

          ${
            currentPage ===
            index + 1

              ? "bg-[var(--highlight)] text-white"

              : "border border-gray-300 hover:bg-gray-100"
          }
        `}
      >
        {index + 1}
      </button>

    )
  )}

  {/* NEXT */}

  <button
    disabled={
      currentPage ===
      totalPages
    }
    onClick={() =>
      setCurrentPage(
        (prev) => prev + 1
      )
    }
    className="
      px-5
      py-2
      border
      border-gray-300
      rounded-[10px]
      hover:bg-gray-100
      transition
      disabled:opacity-40
      disabled:cursor-not-allowed
    "
  >
    Next
  </button>

</div>



      </div>

    );

  })()}

</div>

{previewModal && (

  <div
    onClick={() =>
      setPreviewModal("")
    }
    className="
      fixed
      inset-0
      z-[999]
      bg-black/80
      flex
      items-center
      justify-center
      p-5
    "
  >

    <img
      src={previewModal}
      alt=""
      className="
        max-w-full
        max-h-full
        rounded-[20px]
      "
    />

  </div>

)}



      </div>

    </div>
  );
}






















//  <div className="grid grid-cols-2 gap-4">

//   {data.generatedModelImages.map(
//     (
//       image,
//       index
//     ) => (

//       <img
//         key={index}
//         src={image}
//         alt=""
//         className="
//           w-full
//           aspect-square
//           object-contain
//           rounded-[10px]
//           border
//           border-gray-200
//         "
//       />

//     )
//   )}

// </div>




































































// "use client";

// import axios from "axios";
// import { useState } from "react";

// import { uploadImage } from "../lib/upload";

// interface ProductData {
//   generatedModelImages: string[];
//   imagePrompt: string;
//   title: string;
//   description: string;
//   metaTitle: string;
//   metaDescription: string;
//   gender: string;
// }
// export default function UploadForm() {

//   const [loading, setLoading] =
//     useState(false);

//   const [data, setData] =
//     useState<ProductData | null>(null);

//   const [error, setError] =
//     useState("");

//   const [preview, setPreview] =
//     useState("");

//     const [selectedGender, setSelectedGender] =
//   useState("male");

//   const handleUpload = async (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {

//     try {

//       setLoading(true);

//       setError("");

//       setData(null);

//       const file =
//         e.target.files?.[0];

//       if (!file) {

//         setError(
//           "Please select an image."
//         );

//         return;
//       }

//       // PREVIEW

//       const previewUrl =
//         URL.createObjectURL(file);

//       setPreview(previewUrl);

//       // UPLOAD TO FIREBASE

//       const imageUrl =
//         await uploadImage(file);

//       // SEND TO BACKEND

//       const response =
//         await axios.post(
//           "/api/generate",
//           {
//   imageUrl,
//   gender: selectedGender,
// }
//         );

//       if (
//         !response.data.success
//       ) {

//         throw new Error(
//           response.data.message
//         );
//       }

//       setData(
//         response.data.data
//       );

//     } catch (err: any) {

//       console.log(err);

//       setError(
//         err?.response?.data?.message ||
//         err?.message ||
//         "Something went wrong."
//       );

//     } finally {

//       setLoading(false);
//     }
//   };

//   return (

//     <div className="min-h-screen bg-white text-black px-4 py-10">

//       <div className="max-w-6xl mx-auto">

//         {/* HEADER */}

//         <div className="text-center mb-12">

//           <h1 className="text-5xl font-bold mb-4">
//             AI Product Generator
//           </h1>

//           <p className="text-lg text-gray-500 max-w-2xl mx-auto">
//             Upload any product image and
//             generate SEO content,
//             descriptions, titles,
//             meta data, and AI model visuals.
//           </p>

//         </div>


//         <div className="mb-8 flex items-center justify-center gap-8">

//   <label className="flex items-center gap-3 cursor-pointer">

//     <input
//       type="radio"
//       value="male"
//       checked={selectedGender === "male"}
//       onChange={(e) =>
//         setSelectedGender(e.target.value)
//       }
//       className="w-5 h-5"
//     />

//     <span className="font-medium">
//       Male Model
//     </span>

//   </label>

//   <label className="flex items-center gap-3 cursor-pointer">

//     <input
//       type="radio"
//       value="female"
//       checked={selectedGender === "female"}
//       onChange={(e) =>
//         setSelectedGender(e.target.value)
//       }
//       className="w-5 h-5"
//     />

//     <span className="font-medium">
//       Female Model
//     </span>

//   </label>

// </div>

//         {/* UPLOAD SECTION */}

//         <div className="bg-gray-50 border border-gray-200 rounded-[30px] p-8 shadow-sm">

//           <label
//             htmlFor="fileUpload"
//             className="
//               border-2
//               border-dashed
//               border-gray-300
//               rounded-[10px]
//               p-14
//               flex
//               flex-col
//               items-center
//               justify-center
//               cursor-pointer
//               transition
//               hover:border-black
//               hover:bg-white
//             "
//           >

//             <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-3xl mb-5">
//               ↑
//             </div>

//             <h2 className="text-2xl font-semibold mb-2">
//               Upload Product Image
//             </h2>

//             <p className="text-gray-500 text-center">
//               Supports PNG, JPG, WEBP
//             </p>

//             <input
//               id="fileUpload"
//               type="file"
//               accept="image/*"
//               onChange={handleUpload}
//               className="hidden"
//             />

//           </label>

//           {/* PREVIEW */}

//           {preview && (

//             <div className="mt-10 flex justify-center">

//               <img
//                 src={preview}
//                 alt="preview"
//                 className="
//                   w-[210px]
//                   h-[280px]
//                   object-contain
//                   rounded-[10px]
//                   border
//                   border-gray-200
//                   shadow-sm
//                 "
//               />

//             </div>

//           )}

//           {/* LOADING */}

//           {loading && (

//             <div className="flex justify-center mt-8">

//               <div className="bg-black text-white px-8 py-4 rounded-full flex items-center gap-4">

//                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

//                 <p className="font-medium">
//                   Generating Product...
//                 </p>

//               </div>
              

//             </div>

//           )}

//           {/* ERROR */}

//           {error && (

//             <div className="mt-8 bg-red-100 border border-red-300 text-red-700 px-5 py-4 rounded-2xl">

//               {error}

//             </div>

//           )}

//         </div>

//         {/* RESULT */}

//         {data && (

//           <div className="mt-14 grid lg:grid-cols-2 gap-8">

//             {/* IMAGE */}

//             <div className="bg-gray-50 border border-gray-200 rounded-[30px] p-5 shadow-sm">

//             <div className="grid grid-cols-2 gap-4">

//   {data.generatedModelImages.map(
//     (
//       image,
//       index
//     ) => (

//       <img
//         key={index}
//         src={image}
//         alt=""
//         className="
//           w-full
//           aspect-square
//           object-contain
//           rounded-[10px]
//           border
//           border-gray-200
//         "
//       />

//     )
//   )}

// </div>

//             </div>

//             {/* CONTENT */}

//             <div className="bg-gray-50 border border-gray-200 rounded-[30px] p-8 shadow-sm">

//               <div className="space-y-7">

//                 <div>

//   <p className="text-sm text-gray-500 mb-2">
//     Gender
//   </p>

//   <p className="text-gray-700">
//     {data.gender}
//   </p>

// </div>

// <div>

//   <p className="text-sm text-gray-500 mb-2">
//     Hexxfield Prompt
//   </p>

//   <div className="bg-white border border-gray-200 rounded-2xl p-5 text-sm leading-7">

//     {data.imagePrompt}

//   </div>

// </div>

//                 <div>

//                   <p className="text-sm text-gray-500 mb-2">
//                     Product Title
//                   </p>

//                   <h1 className="text-4xl font-bold leading-tight">
//                     {data.title}
//                   </h1>

//                 </div>

//                 <div>

//                   <p className="text-sm text-gray-500 mb-2">
//                     Description
//                   </p>

//                   <p className="text-gray-700 leading-8">
//                     {data.description}
//                   </p>

//                 </div>

//                 <div>

//                   <p className="text-sm text-gray-500 mb-2">
//                     Meta Title
//                   </p>

//                   <p className="font-medium text-lg">
//                     {data.metaTitle}
//                   </p>

//                 </div>

//                 <div>

//                   <p className="text-sm text-gray-500 mb-2">
//                     Meta Description
//                   </p>

//                   <p className="text-gray-700 leading-8">
//                     {data.metaDescription}
//                   </p>

//                 </div>

//                 {/* BUTTONS */}

//                 <div className="flex flex-wrap gap-4 pt-5">

//                   <button
//                     className="
//                       bg-black
//                       text-white
//                       px-7
//                       py-3
//                       rounded-2xl
//                       font-medium
//                       hover:opacity-90
//                       transition
//                     "
//                   >
//                     Save Product
//                   </button>

//                   <button
//                     className="
//                       border
//                       border-black
//                       px-7
//                       py-3
//                       rounded-2xl
//                       font-medium
//                       hover:bg-black
//                       hover:text-white
//                       transition
//                     "
//                   >
//                     Regenerate
//                   </button>

//                 </div>

//               </div>

//             </div>

//           </div>

//         )}

//       </div>

//     </div>
//   );
// }