import { useState } from 'react'
import { Alert, Button, Snackbar } from '@mui/material'
import { signInWithPopup } from 'firebase/auth'
import { useDispatch } from 'react-redux'

import { socialLogin } from '../../actions/userActions'
import { createSocialProvider, getPizzaroFirebaseAuth } from '../../utils/firebase'

const providerDetails = {
    google: { label: 'Continue with Google', mark: 'G' },
    facebook: { label: 'Continue with Facebook', mark: 'f' },
}

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
                        startIcon={<span className={`pizzaro-social-mark pizzaro-social-mark-${provider}`} aria-hidden="true">{details.mark}</span>}
                        sx={{
                            minHeight: 48,
                            justifyContent: 'center',
                            borderColor: '#ded6d1',
                            borderRadius: '0.55rem',
                            backgroundColor: '#fff',
                            color: '#302620',
                            fontSize: '0.92rem',
                            fontWeight: 650,
                            textTransform: 'none',
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
