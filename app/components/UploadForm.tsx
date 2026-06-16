
"use client";

import axios from "axios";
import { User, UserRound } from "lucide-react";
import { useState, useEffect } from "react";
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
import { characters }
from "../lib/characters";
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
  generationStatus?: string;
  startedAt?: number;
}
export default function UploadForm() {

  const [generationQueue, setGenerationQueue] =
  useState<any[]>([]);

const [isGenerating, setIsGenerating] =
  useState(false);

  const [loading, setLoading] =
    useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
const [selectedDeleteProducts, setSelectedDeleteProducts] =
  useState<string[]>([]);
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



const [selectedBgImage, setSelectedBgImage] =
  useState(
    "https://firebasestorage.googleapis.com/v0/b/bombay-blokes-4c284.firebasestorage.app/o/jk-diamonds%2Fdownload%20(3).jpeg?alt=media&token=8dc81055-a27c-42a3-a94e-6ff13744b464"
  );

const [selectedBgColor, setSelectedBgColor] =
  useState("#A9B682");

const [backgroundType, setBackgroundType] =
  useState("solid");

  const [currentPage, setCurrentPage] =
  useState(1);
  const [syncedCurrentPage, setSyncedCurrentPage] =
  useState(1);

  const [backImage, setBackImage] =
  useState<File | null>(null);

const [backImagePreview, setBackImagePreview] =
  useState("");


const [selectedProducts, setSelectedProducts] =
  useState<string[]>([]);

const [bulkSyncLoading, setBulkSyncLoading] =
  useState(false);


  const [previewModal, setPreviewModal] =
  useState("");

  const [timerTick, setTimerTick] =
  useState(0);

  const [showGeneratePopup, setShowGeneratePopup] =
  useState(false);

const [showSyncPopup, setShowSyncPopup] =
  useState(false);



const nonDraftProducts =
  products.filter(
    (product) =>
      !product.syncedToShopify
  );

const allSelected =
  nonDraftProducts.length > 0 &&
  selectedProducts.length ===
    nonDraftProducts.length;


    const processNextGeneration =
  async () => {

    if (
      generationQueue.length === 0
    ) {
      return;
    }

    setIsGenerating(true);

    const job =
      generationQueue[0];

    try {

setProducts((prev) =>
  prev.map((p) =>
    p.id === job.tempProductId
      ? {
          ...p,
          generationStatus: "generating",
          startedAt: Date.now(),
        }
      : p
  )
);



await axios.post(
  "/api/generate",
  {
    imageUrls: job.uploadedImages,
    backImage: job.uploadedBackImage,
    gender: job.gender,
    backgroundType: job.backgroundType,
    backgroundColor: job.backgroundColor,
    backgroundImage: job.backgroundImage,
  }
);

     setProducts((prev) =>
  prev.filter(
    (p) => p.id !== job.tempProductId
  )
);

await fetchProducts();

    } catch (err) {

      console.log(err);

    } finally {

      setGenerationQueue(
        (prev) => prev.slice(1)
      );

      setIsGenerating(false);
    }
  };


useEffect(() => {

  if (
    isGenerating ||
    generationQueue.length === 0
  ) {
    return;
  }

  processNextGeneration();

}, [
  generationQueue,
  isGenerating,
]);

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

     setProducts((prev) => {

  const tempRows =
    prev.filter(
      (p) =>
        p.id?.startsWith("temp-")
    );

  return [
    ...tempRows,
    ...(fetchedProducts as ProductData[])
  ];
});

    } catch (error) {

      console.log(error);
    }
};

useEffect(() => {

  fetchProducts();

}, []);


useEffect(() => {

  const interval =
    setInterval(() => {

      setTimerTick(
        (prev) => prev + 1
      );

    }, 1000);

  return () =>
    clearInterval(interval);

}, []);


const handleUpload = (
  e: React.ChangeEvent<HTMLInputElement>
) => {

  const files =
    Array.from(
      e.target.files || []
    ).slice(0, 4);

  // FILE SIZE VALIDATION

  const oversizedFiles =
    files.filter(
      (file) =>
        file.size >
        5 * 1024 * 1024
    );

  if (
    oversizedFiles.length > 0
  ) {

    setError(
      "Please upload images under 5MB."
    );

    return;
  }

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

const getRemainingTime = (
  createdAt: number
) => {

  const now =
    Date.now();

  const diff =
    180 -
    Math.floor(
      (now - createdAt) / 1000
    );

  return diff > 0
    ? diff
    : 0;
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



      setError("");


      setShowGeneratePopup(true);

setTimeout(() => {
  setShowGeneratePopup(false);
}, 180000); // 3 minutes

      // RESET FORM INSTANTLY

const tempPreview =
  previews[0] || "";

setSelectedFiles([]);
setPreviews([]);

setBackImage(null);
setBackImagePreview("");

// TEMP GENERATING ROW

const tempProduct = {

  id:
    `temp-${Date.now()}`,


  title:
    "Generating Product...",

  description:
    "AI is generating your product. Please wait...",

  generatedModelImages:
    tempPreview
      ? [tempPreview]
      : [],

  generationStatus:
    isGenerating
      ? "queued"
      : "generating",

  startedAt:
    isGenerating
      ? undefined
      : Date.now(),


  gender:
    selectedGender,
};

// SHOW ON TOP


setProducts((prev: any) => [
  tempProduct,
  ...prev,
]);

      // UPLOAD TO FIREBASE

      const uploadedImages =
        await Promise.all(
          selectedFiles.map(async (file) => {
            return await uploadImage(file);
          })
        );

        let uploadedBackImage = "";

if (backImage) {

  uploadedBackImage =
    await uploadImage(
      backImage
    );

}

      // CALL API

     setGenerationQueue((prev) => [
  ...prev,
  {
    uploadedImages,
    uploadedBackImage,
    gender: selectedGender,
    backgroundType,
    backgroundColor: selectedBgColor,
    backgroundImage: selectedBgImage,
    tempProductId: tempProduct.id,
  },
]);

  


    } catch (err: any) {

      console.log(err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong."
      );

    } finally {

  
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

      // REFRESH PRODUCTS

      await fetchProducts();

      // SHOW SUCCESS POPUP



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


      setShowSyncPopup(true);

setTimeout(() => {

  setShowSyncPopup(false);

}, 10000);

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


const handleDeleteSelectedProducts =
  async () => {

    if (
      selectedProducts.length === 0
    ) {
      alert(
        "Please select products first"
      );

      return;
    }

    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete ${selectedProducts.length} selected products?`
      );

    if (!confirmDelete) return;

    try {

      const deletePromises =
        selectedProducts.map(
          async (productId) => {

            await deleteDoc(
              doc(
                db,
                "products",
                productId
              )
            );
          }
        );

      await Promise.all(
        deletePromises
      );

      await fetchProducts();

      setSelectedProducts([]);

      alert(
        "Selected products deleted successfully"
      );

    } catch (error: any) {

      console.log(error);

      alert(
        error?.message ||
        "Delete failed"
      );
    }
};

  function setSelectedCharacter(image: string): void {
    throw new Error("Function not implemented.");
  }

  return (

    <div className="container mx-auto px-4 py-4 bg-white">

      <div>

        {/* HEADER */}
        <div className="text-center mb-12">

          <h1 className="text-4xl lg:text-5xl font-bold lg:mb-4 mb-2 title-highlight">
  AI Product Generator
</h1>

          <p className="subtitle subtitle-highlight max-w-2xl mx-auto">
            Fully automated product upload workflow
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
      mt-10
    flex
    flex-col
    lg:flex-row
    gap-4
    items-stretch
  "
>


 {/* front View UPLOAD BOX */}
<div className="w-full lg:w-[30%] hidden lg:flex flex-col gap-4">
  <label
    htmlFor="fileUpload"
    className="
    min-h-[320px] h-full
      border-2
      border-dashed
      border-gray-300
      rounded-[10px]
      lg:px-4
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
       title 
        title-highlight
        mb-3
       
      "
    >
    Upload 4 Front Images
    </h3>

<p
  className="
    subtitle-highlight
    subtitle 
    flex
    flex-col
    gap-1
  "
>
  <span>
    Supports PNG, JPG, and WEBP. Max 5MB per image.
  </span>

  {/* <span>
    Upload up to 4 images at a time for a single product.
  </span> */}

  {/* <span>
    Each product generation can take up to 2–3 minutes.
  </span> */}
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

    {/*  Front View IMAGE PREVIEW */}
{previews.length > 0 && (

  <div
    className="
      mt-8
      grid
      grid-cols-4
sm:grid-cols-4
md:grid-cols-4
lg:grid-cols-4
xl:grid-cols-4
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


</div>


  {/* back View UPLOAD BOX */}

<div className="hidden lg:flex w-full lg:w-[30%]  flex-col gap-4">
  <label
    id="backFileUpload"
    className="
    min-h-[320px] h-full
      border-2
      border-dashed
      border-gray-300
      rounded-[10px]
      lg:px-4
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
       title 
        title-highlight
        mb-3
   
   
      "
    >
       Upload 1 Back Image
    </h3>

<p
  className="
    subtitle-highlight
    subtitle 
    flex
    flex-col
    gap-1
  "
>
  <span>
    Supports PNG, JPG, and WEBP. Max 5MB per image.
  </span>


  {/* <span>
    Each product generation can take up to 2–3 minutes.
  </span> */}
</p>

   

<input
  id="backImageInput"
  type="file"
  accept="image/*"
  className="hidden"
  onChange={(e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setBackImage(file);
    setBackImagePreview(URL.createObjectURL(file));
  }}
/>

  </label>

   {/*  back View IMAGE PREVIEW */}

{backImagePreview && (

  <div
    className="
      mt-8
      grid
      grid-cols-4
      sm:grid-cols-4
      md:grid-cols-4
      lg:grid-cols-4
      xl:grid-cols-4
      gap-3
    "
  >

    <div
      className="
        relative
        aspect-square
        max-w-[150px]
      "
    >

      {/* REMOVE BUTTON */}
      <button
        type="button"
        onClick={() => {
          setBackImage(null);
          setBackImagePreview("");
        }}
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

      <img
        src={backImagePreview}
        alt=""
        className="
          w-full
          h-full
          object-cover
          rounded-2xl
          border
          border-gray-200
          bg-white
        "
      />

    </div>

  </div>

)}
</div>



  {/* mobile  UPLOAD BOX */}
<div className="flex flex-row gap-3 lg:hidden">

   {/* front View UPLOAD BOX */}
 <div className="w-1/2">
  <label
    htmlFor="fileUpload"
    className="
    min-h-[320px] h-full
      border-2
      border-dashed
      border-gray-300
      rounded-[10px]
      px-3
      py-6
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
       title 
        title-highlight
        mb-3
       
      "
    >
    Upload 4 Front Images
    </h3>

<p
  className="
    subtitle-highlight
    subtitle 
    flex
    flex-col
    gap-1
  "
>
  <span>
    Supports PNG, JPG, and WEBP. Max 5MB per image.
  </span>

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


   

</div>


 {/* back View UPLOAD BOX */}
 <div className="w-1/2 relative">

 <label
    id="backFileUpload"
    className="
    min-h-[320px] h-full
      border-2
      border-dashed
      border-gray-300
      rounded-[10px]
     px-3
      py-6
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
       title 
        title-highlight
        mb-3

      "
    >
       Upload 1 Back Image
    </h3>

<p
  className="
    subtitle-highlight
    subtitle 
    flex
    flex-col
    gap-1
  "
>
  <span>
    Supports PNG, JPG, and WEBP. Max 5MB per image.
  </span>


  {/* <span>
    Each product generation can take up to 2–3 minutes.
  </span> */}
</p>

   

<input
  id="backImageInput"
  type="file"
  accept="image/*"
  className="hidden"
  onChange={(e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setBackImage(file);
    setBackImagePreview(URL.createObjectURL(file));
  }}
/>

  </label>



</div>

</div>


<div className="flex gap-3 lg:hidden mt-4">

  {/* FRONT PREVIEWS */}

  <div className="w-1/2">

    {previews.length > 0 && (

      <div
        className="
          grid
          grid-cols-2
          gap-3
        "
      >

        {previews.map((image, index) => (

          <div
            key={index}
            className="
              relative
              aspect-square
            "
          >

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
                bg-black
                text-white
                text-xs
              "
            >
              ✕
            </button>

            <img
              src={image}
              alt=""
              className="
                w-full
                h-full
                object-cover
                rounded-2xl
                border
              "
            />

          </div>

        ))}

      </div>

    )}

  </div>

  {/* BACK PREVIEW */}

  <div className="w-1/2">

    {backImagePreview && (

      <div
        className="
          relative
          w-full
          aspect-square
        "
      >

        <button
          type="button"
          onClick={() => {
            setBackImage(null);
            setBackImagePreview("");
          }}
          className="
            absolute
            -top-2
            -left-2
            z-20
            w-6
            h-6
            rounded-full
            bg-black
            text-white
            text-xs
          "
        >
          ✕
        </button>

        <img
          src={backImagePreview}
          alt=""
          className="
            w-full
            h-full
            object-cover
            rounded-2xl
            border
          "
        />

      </div>

    )}

  </div>

</div>

   

 



<div className="lg:w-[40%]
      flex
      flex-col
      gap-4 
      lg:px-5
      p-0">

  {/* GENDER SELECTION */}

<div className="flex items-center gap-4 lg:mt-0 mt-5">
  {/* Male */}
  <button
    type="button"
    onClick={() => setSelectedGender("male")}
    className="bg-transparent"
  >
    <div
      className={`
        w-12 h-12
        sm:w-18 sm:h-18
        rounded-full
        overflow-hidden
          cursor-pointer
        transition-all
        ${
          selectedGender === "male"
            ? "border-3 border-black"
            : "border border-gray-300"
        }
      `}
    >
      <img
        src="/icons/man.png"
        alt="Male"
        className="w-full h-full object-cover"
      />
    </div>
  </button>

  {/* Female */}
  <button
    type="button"
    onClick={() => setSelectedGender("female")}
    className="bg-transparent"
  >
    <div
      className={`
        w-12 h-12
        sm:w-18 sm:h-18
        cursor-pointer
        rounded-full
        overflow-hidden
        transition-all
        ${
          selectedGender === "female"
            ? "border-3 border-black"
            : "border border-gray-300"
        }
      `}
    >
      <img
        src="/icons/woman.png"
        alt="Female"
        className="w-full h-full object-cover"
      />
    </div>
  </button>
</div>




  {/* GENERATE BUTTON */}


<div className="mt-5">

  <div className="mb-5">

    <h3
      className="
        text-2xl
        md:text-3xl
        font-semibold
        title-highlight
        
       
      "
    >
      Background Style
    </h3>

  </div>

  <div
    className="
      flex
      flex-wrap
     
      gap-4
    "
  >

    {/* DEFAULT */}

    <button
      type="button"
      onClick={() =>
        setBackgroundType("default")
      }
      className={`
        px-6
        py-4
        rounded-[10px]
        border
        transition
        cursor-pointer

        ${
          backgroundType === "default"

            ? "bg-[var(--highlight)] text-white border-black"

            : "bg-white border-gray-200"
        }
      `}
    >
      Default AI BG
    </button>

    {/* SOLID */}

{/* SOLID COLORS */}


<div
  className="
    flex
    items-center
    justify-center
    gap-4
    flex-wrap
  "
>
  {[
    "#A9B682",
    "#ACD4E4",
    "#F1B492",
    "#FFFFFF",
  ].map((color) => (
    <button
      key={color}
      type="button"
      onClick={() => {
        setBackgroundType("solid");
        setSelectedBgColor(color);
      }}
      className={`
        w-10
          h-10
        rounded-full
        border-2
        transition-all
        cursor-pointer

        ${
          selectedBgColor === color
            ? "border-black scale-110 shadow-lg"
            : "border-gray-200"
        }
      `}
      style={{
        backgroundColor: color,
      }}
    />
  ))}
</div>




    {/* BG IMAGE */}
{/* 
    <button
      type="button"
      onClick={() => {

  setBackgroundType("image");

  if (!selectedBgImage) {

    setSelectedBgImage(
      "https://firebasestorage.googleapis.com/v0/b/bombay-blokes-4c284.firebasestorage.app/o/jk-diamonds%2Fdownload%20(3).jpeg?alt=media&token=8dc81055-a27c-42a3-a94e-6ff13744b464"
    );
  }
}}
      className={`
        px-6
        py-4
        rounded-[10px]
        border
        transition
        cursor-pointer

        ${
          backgroundType === "image"

            ? "bg-[var(--highlight)] text-white border-black"

            : "bg-white border-gray-200"
        }
      `}
    >
      Background Image
    </button> */}

  </div>

</div>

{/* BG IMAGE PICKER */}
{backgroundType === "image" && (

  <div
    className="
      mt-8
      flex
      items-center
      justify-center
      gap-5
      flex-wrap
    "
  >

    {[
      "https://firebasestorage.googleapis.com/v0/b/bombay-blokes-4c284.firebasestorage.app/o/jk-diamonds%2Fdownload%20(3).jpeg?alt=media&token=8dc81055-a27c-42a3-a94e-6ff13744b464",
      "https://firebasestorage.googleapis.com/v0/b/bombay-blokes-4c284.firebasestorage.app/o/jk-diamonds%2Fdownload%20(2).jpeg?alt=media&token=981c862e-48c9-4279-8f7b-74438b9c9cfd",
    ].map((bg) => (

      <button
        key={bg}
        type="button"
        onClick={() =>
          setSelectedBgImage(bg)
        }
        className={`
          relative
          w-40
          aspect-[5/6]
          rounded-[10px]
          overflow-hidden
          cursor-pointer
          border-4
          transition

          ${
            selectedBgImage === bg

              ? "border-black scale-105"

              : "border-transparent"
          }
        `}
      >

        <img
          src={bg}
          alt=""
          className="
            w-full
            h-full
            object-cover
          "
        />

      </button>

    ))}

  </div>

)}

<div
  className="
    flex
    flex-col
    gap-4
    lg:mt-10 mt-5
    w-full
  "
>

  <button
    onClick={handleGenerate}

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

  disabled:opacity-70
  disabled:cursor-not-allowed
"
  >
    Start Generation
  </button>

  <p
    className="
      subtitle-highlight
      subtitle
      text-center
    "
  >
  Each product generation can take up to 2–3 minutes and sometimes more.
  </p>

</div>


</div>


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
      

const visibleProducts =
  products
    .filter(
      (product) =>
        !product.syncedToShopify
    )
    .sort((a, b) => {

      if (
        a.generationStatus === "generating"
      ) return -1;

      if (
        b.generationStatus === "generating"
      ) return 1;

      if (
        a.generationStatus === "queued" &&
        b.generationStatus !== "queued"
      ) return -1;

      if (
        b.generationStatus === "queued" &&
        a.generationStatus !== "queued"
      ) return 1;

      return 0;
    });

  const syncedProducts =
  products.filter(
    (product) =>
      product.syncedToShopify
  );
  const syncedItemsPerPage =
  isMobile ? 5 : 20;

const syncedTotalPages =
  Math.ceil(
    syncedProducts.length /
    syncedItemsPerPage
  );

const paginatedSyncedProducts =
  syncedProducts.slice(
    (syncedCurrentPage - 1) *
      syncedItemsPerPage,
    syncedCurrentPage *
      syncedItemsPerPage
  );

  const totalGeneratedImages =
  products.reduce(
    (total, product) => {

      return (
        total +
        (
          product
            .generatedModelImages
            ?.length || 0
        )
      );

    },
    0
  );


  const totalSpend = 845;


  const costPerImage =
  totalGeneratedImages > 0

    ? (
        totalSpend /
        totalGeneratedImages
      ).toFixed(2)

    : 0;


    const costPerProduct =
  products.length > 0

    ? (
        totalSpend /
        products.length
      ).toFixed(2)

    : 0;

const totalPages =
  Math.ceil(
    visibleProducts.length /
    itemsPerPage
  );

const paginatedData =
  visibleProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

    return (

      <div className="">

<div
  className="
    bg-white
    border
    border-gray-200
     rounded-[10px]
    shadow-sm
 
  


    relative
  "
>

        {/* DESKTOP HEADER */}


        {/* <div
  className="
    grid
    grid-cols-2
    md:grid-cols-4
    gap-4
    mb-8
  "
>

  <div
    className="
      bg-white
      border
      rounded-[10px]
      p-5
    "
  >
    <p className="text-sm text-gray-500">
      Total Spend
    </p>

    <h2 className="text-3xl font-bold">
      ₹{totalSpend}
    </h2>
  </div>

  <div
    className="
      bg-white
      border
      rounded-[10px]
      p-5
    "
  >
    <p className="text-sm text-gray-500">
      Total Images
    </p>

    <h2 className="text-3xl font-bold">
      {totalGeneratedImages}
    </h2>
  </div>

  <div
    className="
      bg-white
      border
      rounded-[10px]
      p-5
    "
  >
    <p className="text-sm text-gray-500">
      Cost / Image
    </p>

    <h2 className="text-3xl font-bold">
      ₹{costPerImage}
    </h2>
  </div>

  <div
    className="
      bg-white
      border
      rounded-[10px]
      p-5
    "
  >
    <p className="text-sm text-gray-500">
      Cost / Product
    </p>

    <h2 className="text-3xl font-bold">
      ₹{costPerProduct}
    </h2>
  </div>

</div> */}

<div
  className="
    hidden
    lg:grid
    lg:grid-cols-[120px_200px_1.2fr_2fr_auto]
    lg:gap-6
    sticky
    top-0
    z-[999]
    bg-[var(--highlight)]
    text-white
    px-6
    py-4
    rounded-t-[10px]
    shadow-md
    items-center
  "
>
  <div className="flex items-center gap-3">
    <input
      type="checkbox"
      checked={allSelected}
      onChange={handleSelectAll}
      className="w-5 h-5 cursor-pointer"
    />

    <span className="font-semibold whitespace-nowrap">
      All | Sr No
    </span>
  </div>

  <div className="font-semibold">
    Images
  </div>

  <div className="font-semibold">
    Title
  </div>

  <div className="font-semibold">
    Description
  </div>

<div className="font-semibold flex justify-end">
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
      {bulkSyncLoading
        ? "Syncing..."
        : `Sync (${selectedProducts.length})`}
    </button>
  )}
</div>
</div>




<div
  className="
    sticky
    top-0
    z-[9999]

    lg:hidden

    bg-[var(--highlight)]
    text-white
     rounded-t-[10px]
overflow-hidden

    px-4
    py-3

    flex
    items-center
    justify-between

    border-b
    border-white/20
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
      // className="
      //   text-left
      //   font-semibold
      //   text-xl
      //   md:text-2xl
      //   leading-none
      // "

      className="
        font-semibold
        text-base
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

        <div
  onWheel={(e) => {
    e.currentTarget.scrollTop += e.deltaY;
  }}
  className="
    w-full
    max-h-screen
 overflow-y-auto
    overscroll-contain
    overflow-hidden
  

    scrollbar-thin
    scrollbar-thumb-[var(--highlight)]
    scrollbar-track-gray-100
 
    
  "
>

 

          {paginatedData.length > 0 ? (

            paginatedData.map(
              (
                item,
                index
              ) => (

                <div
                  key={item.id}
                  className={`
                        relative
  border-b
  border-gray-200

 ${
  item.generationStatus ===
  "generating"

    ? "bg-gray-50"

    : ""
}

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
`}
                >

                  {/* MOBILE SR */}

       
<div
  className="
    flex 
    flex-row
    items-center
    gap-4
  "
>

  <input
    type="checkbox"

  

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


{/* delect checker */}
{/* <input
  type="checkbox"

  checked={
    selectedDeleteProducts.includes(
      item.id || ""
    )
  }

  onChange={(e) => {

    if (!item.id) return;

    if (e.target.checked) {

      setSelectedDeleteProducts([
        ...selectedDeleteProducts,
        item.id,
      ]);

    } else {

      setSelectedDeleteProducts(
        selectedDeleteProducts.filter(
          (id) =>
            id !== item.id
        )
      );
    }
  }}

  className="
    w-5
    h-5
    cursor-pointer
    accent-red-600
  "
/> */}

                  {/* IMAGE */}

                  {/* IMAGE */}

<div
  className="
    flex
    gap-4
    items-start

    lg:block
  "
>

  <div
    className="
      flex
      justify-start
      shrink-0
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

      {/* {(item.generatedModelImages || []).map(
    (
      image: string,
      index: number
    ) => (

      <img
        key={index}

        onClick={() =>
          setPreviewModal(
            image
          )
        }

        src={
          image ||
          "/placeholder.png"
        }

        alt=""

        className="
          w-24
          h-28
          lg:w-20
          lg:h-30
          rounded-[10px]
          object-cover
          border
          border-gray-200
          cursor-pointer
          hover:scale-105
          transition
          shrink-0
        "
      />

    )
  )}  */}

  </div>

  {/* MOBILE TITLE + DESCRIPTION */}

  <div
    className="
      flex
      flex-col
      gap-2
      flex-1

      lg:hidden
    "
  >

    <h2
      style={{
        fontWeight: 600,
      }}

      className="
        title-highlight
        subtitle
        text-left
      "
    >
      {item.title}
    </h2>


      {item.generationStatus ===
  "queued" && (

  <div
    className="
      absolute
      inset-0
      z-20

      flex
      flex-col
      items-center
      justify-center

      backdrop-blur-[2px]
      bg-white/40

      rounded-[10px]
      text-center

      px-4
    "
  >

    <h2
      className="
        text-xl
        font-semibold
        title-highlight
      "
    >
     
  Waiting in Queue

  Previous product is
  generating first.

    </h2>
</div>

)}


{item.generationStatus ===
  "generating" && (

  <div
    className="
      absolute
      inset-0
      z-20

      flex
      flex-col
      items-center
      justify-center

      backdrop-blur-[2px]
      bg-white/50

      rounded-[10px]
      text-center

      px-4

      lg:hidden
    "
  >

    <h2
      className="
        text-lg
        font-semibold
        title-highlight
      "
    >
      Generating Product...
    </h2>

    <div
      className="
        mt-3
        inline-flex
        items-center
        gap-2

        bg-yellow-100
        text-yellow-800

        px-4
        py-2

        rounded-full
        text-xs
        font-medium
      "
    >

      <div
        className="
          w-2
          h-2
          rounded-full
          bg-yellow-500
          animate-pulse
        "
      />

      Generating • {" "}

      {Math.floor(
  getRemainingTime(
    item.startedAt || 0
  ) / 60
)}
:
{String(
  getRemainingTime(
    item.startedAt || 0
  ) % 60
).padStart(2, "0")}

    </div>

    <p
      className="
        mt-3
        subtitle-highlight
        subtitle
        text-center
      "
    >
      AI is generating your product.
      Please wait...
    </p>

  </div>

)}

    <p
      className={`
        subtitle-highlight
        subtitle
        text-left
        transition-all
        duration-300

        ${
          expandedCard === index
            ? ""
            : "line-clamp-3"
        }
      `}
    >
      {item.description}
    </p>

   

  </div>

</div>



{/* DESKTOP TITLE */}

<div className="hidden lg:block">

  <h2
    className="
      title-highlight
      subtitle
      text-left
    "
  >
    {item.title}
  </h2>




 {item.generationStatus ===
  "generating" && (

  <div
    className="
      absolute
      inset-0
      z-20

      flex
      flex-col
      items-center
      justify-center

      backdrop-blur-[2px]
      bg-white/40

      rounded-[10px]
      text-center

      px-4
    "
  >

    <h2
      className="
        text-xl
        font-semibold
        title-highlight
      "
    >
      Generating Product...
    </h2>

    <div
      className="
        mt-3
        inline-flex
        items-center
        gap-2

        bg-yellow-100
        text-yellow-800

        px-4
        py-2

        rounded-full
        text-sm
        font-medium
      "
    >

      <div
        className="
          w-2
          h-2
          rounded-full
          bg-yellow-500
          animate-pulse
        "
      />

      Generating • {" "}

     {Math.floor(
  getRemainingTime(
    item.startedAt || 0
  ) / 60
)}
:
{String(
  getRemainingTime(
    item.startedAt || 0
  ) % 60
).padStart(2, "0")}

    </div>

    <p
      className="
        mt-4
        subtitle-highlight
        subtitle
        max-w-md
      "
    >
      AI is generating your product.
      Please wait...
    </p>

  </div>

)}



  {item.generationStatus ===
  "queued" && (

  <div
    className="
      absolute
      inset-0
      z-20

      flex
      flex-col
      items-center
      justify-center

      backdrop-blur-[2px]
      bg-white/40

      rounded-[10px]
      text-center

      px-4
    "
  >

    <h2
      className="
        text-xl
        font-semibold
        title-highlight
      "
    >
     
  Waiting in Queue

  Previous product is
  generating first.

    </h2>
</div>

)}

</div>

{/* DESKTOP DESCRIPTION */}

<div className="hidden lg:block">

  <p
    className="
      subtitle-highlight
      subtitle 
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

                    overflow-y-auto

    scrollbar-thin
    scrollbar-thumb-[var(--highlight)]
    scrollbar-track-gray-100

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


            {/* PAGINATION */}
<div className="
  flex
  items-center
  justify-center
  gap-3
  p-6
  
  border-t
  border-gray-200
  bg-white
">

  {/* PREV */}

  <button
    disabled={currentPage === 1}
    onClick={() =>
      setCurrentPage(
        (prev) => prev - 1
      )
    }
    className="
    cursor-pointer
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
          cursor-pointer

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
    cursor-pointer
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

       



      </div>
{/* SYNCED PRODUCTS TABLE */}

{syncedProducts.length > 0 && (

  <div className="mt-12 ">

    {/* HEADER */}

    <div
      className="
       sticky
top-0
left-0
right-0
        bg-[var(--highlight)]
        text-white
       lg:px-8
px-4
    py-3
  
        rounded-t-[10px]
        flex
        items-center
        justify-between
      "
    >

      <div>
    Products Already Synced To Shopify
  </div>

     

      <span
        className="
         hidden
    lg:inline-flex
          bg-white/20
          px-4
          py-1
          rounded-full
          text-sm
        "
      >
        {syncedProducts.length} Products
      </span>

       <span
        className="
         lg:hidden
          bg-white/20
          px-4
          py-1
          rounded-full
          text-sm
        "
      >
        {syncedProducts.length} 
      </span>

    </div>

    {/* TABLE */}

    <div
      className="

        border
        border-gray-200
        border-t-0
        rounded-b-[10px]
        p-4
      "
    >

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-5
        "
      >

        {paginatedSyncedProducts.map(
          (item, index) => (

            <div
              key={item.id}
              className="
                border
                border-gray-200
                rounded-[10px]
                p-4
                bg-white
              "
            >

              {/* SR NO */}

              <div
                className="
                  text-sm
                  text-gray-500
                  mb-3
                "
              >
                #{index + 1}
              </div>

              {/* IMAGES */}

             <div
  className="
    flex
    flex-col
    lg:flex-row
    gap-4
    items-start
  "
>

  {/* Images */}
  <div
    className="
      flex
      flex-row
      gap-3
      shrink-0
    "
  >
    {(item.generatedModelImages || [])
      .slice(0, 2)
      .map((image, imageIndex) => (

        <img
          key={imageIndex}
          src={image}
          alt=""
          onClick={() =>
            setPreviewModal(image)
          }
          className="
            w-20
            h-28
            rounded-[10px]
            border
            border-gray-200
            object-contain
            cursor-pointer
            hover:scale-105
            transition
          "
        />

      ))}
  </div>

  {/* Title */}
  <div className="flex-1">
    <h3
        className="
      title-highlight
      subtitle
      text-left
    "
    >
      {item.title}
    </h3>
  </div>

</div>

             

            </div>

          )
        )}

      </div>

{syncedTotalPages > 1 && (

  <div
  className="
    flex
    flex-wrap
    items-center
    justify-center
    gap-3
    mt-6
    pt-6
    px-3
    border-t
    border-gray-200
  "
>

    <button
      disabled={syncedCurrentPage === 1}
      onClick={() =>
        setSyncedCurrentPage(
          (prev) => prev - 1
        )
      }
     className="
     cursor-pointer
  px-3
  md:px-5
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

    {Array.from(
      {
        length: syncedTotalPages,
      },
      (_, index) => (

        <button
          key={index}
          onClick={() =>
            setSyncedCurrentPage(
              index + 1
            )
          }
         className={`
  px-3
  md:px-5
  py-2
  rounded-[10px]
  cursor-pointer

  ${
    syncedCurrentPage === index + 1
      ? "bg-[var(--highlight)] text-white"
      : "border border-gray-300 hover:bg-gray-100"
  }
`}
        >
          {index + 1}
        </button>

      )
    )}

    <button
      disabled={
        syncedCurrentPage ===
        syncedTotalPages
      }
      onClick={() =>
        setSyncedCurrentPage(
          (prev) => prev + 1
        )
      }
      className="
      cursor-pointer
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

)}
    </div>

  </div>

)}
      </div>

    );

  })()}

</div>




{/* GENERATE POPUP */}

{showGeneratePopup && (

  <div
    onClick={() =>
      setShowGeneratePopup(false)
    }
    className="
    
      fixed
      inset-0
      z-[9999]
      bg-black/40
      backdrop-blur-sm
      flex
      items-center
      justify-center
      p-5
    "
  >

    <div
      onClick={(e) =>
        e.stopPropagation()
      }
      className="
      
        bg-white
        rounded-[20px]
        p-8
        max-w-md
        w-full
        text-center
        shadow-2xl
      "
    >

      <div className="text-5xl mb-5">
        ⏳
      </div>

      <h2
        className="
          title 
        title-highlight
          mb-4
        "
      >
        Product Generation Started
      </h2>

      <p
        className="
          subtitle-highlight
    subtitle 
        "
      >
        AI Product Generation
        will take around
        2–3 minutes.

        Please wait or
        come back later.
      </p>

    </div>

  </div>

)}

{/* SHOPIFY SYNC POPUP */}

{showSyncPopup && (

  <div
    onClick={() =>
      setShowSyncPopup(false)
    }
    className="
      fixed
      inset-0
      z-[9999]
      bg-black/40
      backdrop-blur-sm
      flex
      items-center
      justify-center
      p-5
    "
  >

    <div
      onClick={(e) =>
        e.stopPropagation()
      }
      className="
        bg-white
        rounded-[20px]
        p-8
        max-w-md
        w-full
        text-center
        shadow-2xl
      "
    >

      <div className="text-5xl mb-5">
        ✅
      </div>

      <h2
        className="
          title 
        title-highlight
          mb-4
        "
      >
        Shopify Sync Completed
      </h2>

      <p
        className="
          subtitle-highlight
    subtitle 
        "
      >
        Your product has been
        added to your Shopify
        store successfully.

        Please check your store.
      </p>

    </div>

  </div>

)}

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


