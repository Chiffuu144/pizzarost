import { initializeApp, getApps } from 'firebase/app'
import { FacebookAuthProvider, GoogleAuthProvider, getAuth as getFirebaseAuth } from 'firebase/auth'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const getPizzaroFirebaseAuth = () => {
    const missingConfiguration = Object.entries(firebaseConfig)
        .filter(([, value]) => !value)
        .map(([key]) => key)

    if (missingConfiguration.length) {
        throw new Error('Social sign-in is not configured. Add the Firebase settings to frontend/.env.')
    }

    const app = getApps().find((existingApp) => existingApp.name === 'pizzaro') ||
        initializeApp(firebaseConfig, 'pizzaro')

    return getFirebaseAuth(app)
}

export const createSocialProvider = (providerName) => {
    if (providerName === 'google') {
        const provider = new GoogleAuthProvider()
        provider.setCustomParameters({ prompt: 'select_account' })
        return provider
    }
    const provider = new FacebookAuthProvider()
    return provider
}
