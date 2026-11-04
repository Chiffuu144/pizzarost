import { useEffect, useState } from 'react'
import MetaData from '../Layout/MetaData'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { clearErrors, forgotPassword } from '../../actions/userActions'
import { FORGOT_PASSWORD_RESET } from '../../constants/userConstants'

const ForgotPassword = () => {
    const dispatch = useDispatch()
    const { error, loading, message } = useSelector(state => state.forgotPassword)
    const [email, setEmail] = useState('')

    useEffect(() => {
        if (error) {
            toast.error(error)
            dispatch(clearErrors())
        } else if (message) {
            toast.success(message)
            dispatch({ type: FORGOT_PASSWORD_RESET })
        }
    }, [dispatch, error, message])

    const submitHandler = (e) => {
        e.preventDefault()
        dispatch(forgotPassword({ email: email.trim() }))
    }

    return (
        <>
            <MetaData title={'Forgot Password'} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler}>
                        <h1 className="mb-3">Forgot Password</h1>
                        <div className="form-group">
                            <label htmlFor="email_field">Enter Email</label>
                            <input
                                type="email"
                                id="email_field"
                                className="form-control"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            id="forgot_password_button"
                            type="submit"
                            className="btn btn-block py-3"
                            disabled={loading}>
                            Send Email
                        </button>

                    </form>
                </div>
            </div>

        </>
    )
}

export default ForgotPassword