import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCY5KqWba5qEsZOZHczSbegT4gMEN7Ldqo",
  authDomain: "expense-tracker-ea08f.firebaseapp.com",
  projectId: "expense-tracker-ea08f",
  storageBucket: "expense-tracker-ea08f.appspot.com",
  messagingSenderId: "53713527164",
  appId: "1:53713527164:web:f3f3a1fe4bc34d27d684f9"
};


initializeApp(firebaseConfig);

const db = getFirestore();
export default db

