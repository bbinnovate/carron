import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import { storage }
from "./firebase";

export const uploadImage =
  async (file: File) => {

    const storageRef = ref(
      storage,
      `products/${Date.now()}-${file.name}`
    );

    const snapshot =
      await uploadBytes(
        storageRef,
        file
      );

    const downloadURL =
      await getDownloadURL(
        snapshot.ref
      );

    return downloadURL;
};