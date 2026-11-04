const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

let firebaseAuth;

const getFirebaseAuth = () => {
    if (firebaseAuth) return firebaseAuth;

    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
        const error = new Error('Firebase Admin credentials are not configured');
        error.statusCode = 500;
        throw error;
    }

    const appName = 'pizzaro-firebase-admin';
    const app = getApps().find((existingApp) => existingApp.name === appName) ||
        initializeApp({
            credential: cert({
                projectId: FIREBASE_PROJECT_ID,
                clientEmail: FIREBASE_CLIENT_EMAIL,
                privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        }, appName);

    firebaseAuth = getAuth(app);
    return firebaseAuth;
};

module.exports = { getFirebaseAuth };
