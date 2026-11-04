import { useState } from 'react'
import { Alert, Button, Snackbar } from '@mui/material'
import { signInWithPopup } from 'firebase/auth'
import { useDispatch } from 'react-redux'

import { socialLogin } from '../../actions/userActions'
import { createSocialProvider, getPizzaroFirebaseAuth } from '../../utils/firebase'

const providerDetails = {
    google: { label: 'Continue with Google' },
    facebook: { label: 'Continue with Facebook' },
}

const SocialMark = ({ provider }) => (
    <svg
        className={`pizzaro-social-mark pizzaro-social-mark-${provider}`}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
    >
        {provider === 'google' ? (
            <>
                <path fill="#4285F4" d="M23.49 12.27c0-.78-.07-1.53-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v2.95h3.87c2.27-2.1 3.57-5.2 3.57-8.59Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.92l-3.87-2.95c-1.08.72-2.46 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.04A12 12 0 0 0 12 24Z" />
                <path fill="#FBBC05" d="M5.27 14.32a7.2 7.2 0 0 1 0-4.64V6.64H1.27a12 12 0 0 0 0 10.72l4-3.04Z" />
                <path fill="#EA4335" d="M12 4.72c1.77 0 3.36.61 4.61 1.81l3.45-3.45C17.95 1.14 15.24 0 12 0A12 12 0 0 0 1.27 6.64l4 3.04C6.22 6.83 8.87 4.72 12 4.72Z" />
            </>
        ) : (
            <path fill="#1877F2" d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8h3.4Z" />
        )}
    </svg>
)

const getSignInErrorMessage = (error) => {
    const message = typeof error?.message === 'string' ? error.message : ''

    if (message.includes('next is not a function')) {
        return 'The social sign-in flow is misconfigured. Please refresh the page and try again.'
    }

    switch (error?.code) {
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
            return 'The sign-in window was closed before sign-in finished.'
        case 'auth/popup-blocked':
            return 'Your browser blocked the sign-in window. Allow pop-ups and try again.'
        case 'auth/account-exists-with-different-credential':
            return 'This email is already linked to another sign-in method. Sign in with that method instead.'
        case 'auth/operation-not-allowed':
            return 'This sign-in provider is not enabled yet. Please contact the store administrator.'
        default:
            return message || 'Social sign-in could not be completed. Please try again.'
    }
}

const SocialLoginButtons = () => {
    const dispatch = useDispatch()
    const [busyProvider, setBusyProvider] = useState('')
    const [message, setMessage] = useState('')

    const signIn = async (providerName) => {
        setBusyProvider(providerName)
        setMessage('')

        try {
            const result = await signInWithPopup(
                getPizzaroFirebaseAuth(),
                createSocialProvider(providerName)
            )
            const firebaseUser = result.user
            const idToken = await firebaseUser.getIdToken()

            await dispatch(socialLogin(idToken, {
                name: firebaseUser.displayName,
                email: firebaseUser.email,
                avatar: firebaseUser.photoURL,
            }))
        } catch (error) {
            setMessage(getSignInErrorMessage(error))
        } finally {
            setBusyProvider('')
        }
    }

    return (
        <div className="pizzaro-social-auth">
            <div className="pizzaro-social-divider"><span>Or continue with</span></div>
            <div className="pizzaro-social-buttons">
                {Object.entries(providerDetails).map(([provider, details]) => (
                    <Button
                        key={provider}
                        type="button"
                        variant="outlined"
                        fullWidth
                        disabled={Boolean(busyProvider)}
                        onClick={() => signIn(provider)}
                        startIcon={<SocialMark provider={provider} />}
                        sx={{
                            minHeight: 48,
                            justifyContent: 'center',
                            position: 'relative',
                            borderColor: '#ded6d1',
                            borderRadius: '0.55rem',
                            backgroundColor: '#fff',
                            color: '#302620',
                            fontSize: '0.92rem',
                            fontWeight: 650,
                            textTransform: 'none',
                            '& .MuiButton-startIcon': {
                                position: 'absolute',
                                left: '1rem',
                                margin: 0,
                            },
                            '&:hover': { borderColor: '#b91c1c', backgroundColor: '#fffaf7' },
                            '&.Mui-disabled': { color: '#8b827d' },
                        }}
                    >
                        {busyProvider === provider ? 'Connecting…' : details.label}
                    </Button>
                ))}
            </div>
            <Snackbar
                open={Boolean(message)}
                autoHideDuration={6000}
                onClose={(_, reason) => {
                    if (reason !== 'clickaway') setMessage('')
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setMessage('')} severity="error" variant="filled" sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default SocialLoginButtons
