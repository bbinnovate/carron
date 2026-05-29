import {
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";

import { storage }
from "./firebase";

export const uploadBase64Image =
  async (
    base64: string
  ) => {

    try {

      const imageRef =
        ref(
          storage,
          `generated/${Date.now()}.png`
        );

      await uploadString(
        imageRef,
        base64,
        "data_url"
      );

      const downloadURL =
        await getDownloadURL(
          imageRef
        );

      return downloadURL;

    } catch (error) {

      console.log(
        "UPLOAD BASE64 ERROR:",
        error
      );

      throw error;
    }
};