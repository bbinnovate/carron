
"use client";

import axios from "axios";
import { useState } from "react";
import {
  db,
} from "../lib/firebase";

import {
  collection,
  getDocs,
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
    );

  if (!files.length) return;

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



  return (

    <div className="container mx-auto px-4 py-4 bg-white">

      <div>

        {/* HEADER */}
        <div className="text-center mb-12">

          <h1 className="text-5xl font-bold mb-4">
            AI Product Generator
          </h1>

          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
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
    rounded-[30px]
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
      rounded-3xl
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
      hover:border-black
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
        bg-black
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
        mb-3
      "
    >
      Upload Product Images
    </h3>

    <p
      className="
        text-gray-500
        text-sm
        md:text-base
      "
    >
      Supports PNG, JPG, WEBP
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
      flex-col
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
        rounded-2xl
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
        rounded-2xl
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
        className="
          bg-black
          text-white
          px-8
          md:px-12
          py-4
          rounded-2xl
          font-semibold
          text-base
          md:text-lg
          hover:opacity-90
          transition
          w-full
          sm:w-auto
        "
      >
        Generate AI Product
      </button>

    </div>

  {/* )} */}

  {/* LOADING */}

  {loading && (

    <div className="flex justify-center mt-10">

      <div
        className="
          bg-black
          text-white
          px-8
          py-4
          rounded-full
          flex
          items-center
          gap-4
        "
      >

        <div
          className="
            w-5
            h-5
            border-2
            border-white
            border-t-transparent
            rounded-full
            animate-spin
          "
        />

        <p className="font-medium">
          Generating Product...
        </p>

      </div>

    </div>

  )}

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
        rounded-2xl
      "
    >

      {error}

    </div>

  )}

</div>




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
          rounded-[30px]
          shadow-sm
          overflow-hidden
        "
      >

        {/* DESKTOP HEADER */}

        <div
  className="
    grid
    lg:grid-cols-[80px_180px_600px_1fr_150px]
    bg-black
    text-white
    px-6
    py-5
    font-semibold
    rounded-t-[30px]
  "
>

  {/* MOBILE */}

  <div className="flex items-center justify-center lg:hidden">
    Products
  </div>

  {/* DESKTOP */}

  <>

    <div className="hidden lg:block">
      Sr No
    </div>

    <div className="hidden lg:block">
      Images
    </div>

    <div className="hidden lg:block">
      Title
    </div>

    <div className="hidden lg:block">
      Description
    </div>

    <div className="hidden lg:block">
      Action
    </div>

  </>

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
                    lg:grid-cols-[70px_120px_380px_minmax(250px,1fr)_220px]
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
                      lg:text-lg
                      font-semibold
                      text-sm
                      text-gray-500
                    "
                  >
                    #{index + 1}
                  </div>

                  {/* IMAGE */}

                  <div
                    className="
                      flex
                      justify-start
                    "
                  >

                    <img
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
                        rounded-2xl
                        object-contain
                        border
                        border-gray-200
                        shrink-0
                      "
                    />

                  </div>

                  {/* TITLE */}

                  <div>

                    <h2
                      className="
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
                        text-gray-600
                        leading-7
                        text-sm
                        lg:text-base
                        text-left
                        line-clamp-5
                      "
                    >
                      {item.description}
                    </p>

                  </div>

                  {/* ACTION */}

                  <div
                    className="
                      flex
                      flex-col
                      gap-3
                      w-full
                    "
                  >

                    <button
                      onClick={() =>
                        handleShopifySync(
                          item.id
                        )
                      }
                      className="
                        w-full
                        bg-black
                        text-white
                        py-3
                        rounded-2xl
                        font-medium
                        hover:opacity-90
                        transition
                      "
                    >
                      Sync To Shopify
                    </button>

                    {item.shopifyDraftLink && (

                      <a
                        href={
                          item.shopifyDraftLink
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          flex
                          items-center
                          justify-center
                          w-full
                          border
                          border-black
                          text-center
                          py-3
                          rounded-2xl
                          font-medium
                          hover:bg-black
                          hover:text-white
                          transition
                        "
                      >
                        Open Draft
                      </a>

                    )}

                  </div>

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
                  rounded-full
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
                Generated products from Firebase
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
      rounded-xl
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
          rounded-xl
          transition

          ${
            currentPage ===
            index + 1

              ? "bg-black text-white"

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
      rounded-xl
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
//           rounded-3xl
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
//               rounded-3xl
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
//                   rounded-3xl
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
//           rounded-3xl
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