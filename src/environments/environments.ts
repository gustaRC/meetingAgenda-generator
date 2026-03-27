// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyDEUI2zgZZwDAg_LBe5FMsvkx-1FTZJ19o",
  authDomain: "meetingagenda-generator.firebaseapp.com",
  projectId: "meetingagenda-generator",
  storageBucket: "meetingagenda-generator.firebasestorage.app",
  messagingSenderId: "118073437555",
  appId: "1:118073437555:web:67e15b833b3b009932a906",
  measurementId: "G-C24RRZL4CW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
