import { auth } from './firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from 'firebase/auth';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result: any = await signInWithPopup(auth, provider);
    const user = result.user;

    const isNewUser = getAdditionalUserInfo(result)?.isNewUser;
    console.log(isNewUser);
    console.log(user);
    return { user, isNewUser };
  } catch (err) {
    console.error('Google sign-in error:', err);
    throw err;
  }
};
