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
    // Get Firebase ID token
    const idToken = await user.getIdToken();

    // Call backend with token in Authorization header
    const response = await fetch('/api/resumes', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    return { user, isNewUser };
  } catch (err) {
    console.error('Google sign-in error:', err);
    throw err;
  }
};
