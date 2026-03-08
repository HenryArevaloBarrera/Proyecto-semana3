import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDLnnmKI-xeZeqFmbVjSuLZmwAgHUzvnJM",
  authDomain: "mini-red-social-87548.firebaseapp.com",
  projectId: "mini-red-social-87548",
  storageBucket: "mini-red-social-87548.appspot.com",
  messagingSenderId: "385886630604",
  appId: "1:385886630604:web:776cfb0243a0800d3f4869",
  measurementId: "G-X5YEJMLT4V"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);