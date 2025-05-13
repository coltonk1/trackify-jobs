// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_AUTH_API_KEY,
  authDomain: 'auth.trackifyjobs.com',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
