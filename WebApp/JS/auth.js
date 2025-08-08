import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const auth = getAuth();
signInAnonymously(auth);

onAuthStateChanged(auth, user => {
  if (user) {
    //put the functions in async to enable authentication in your app. Currently not in use.
    }
});
