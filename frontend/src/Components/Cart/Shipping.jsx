import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { countries } from 'countries-list'
import MetaData from '../Layout/MetaData'
import CheckoutSteps from './CheckoutSteps'
import { useDispatch, useSelector } from 'react-redux'
import { saveShippingInfo } from '../../actions/cartActions'

const Shipping = () => {
    const dispatch = useDispatch();
    const { shippingInfo } = useSelector(state => state.cart)

    const countriesList = Object.values(countries)
    const [address, setAddress] = useState(shippingInfo.address || '')
    const [city, setCity] = useState(shippingInfo.city || '')
    const [postalCode, setPostalCode] = useState(shippingInfo.postalCode || '')
    const [phoneNo, setPhoneNo] = useState(shippingInfo.phoneNo || '')
    const [country, setCountry] = useState(shippingInfo.country || '')
    let navigate = useNavigate();
    const submitHandler = (e) => {
        e.preventDefault()

        dispatch(saveShippingInfo({ address, city, phoneNo, postalCode, country }))
        navigate('/confirm')
    }

    return (
        <>
            <MetaData title={'Shipping Info'} />
            <main className="pizzaro-checkout-page">
                <CheckoutSteps shipping />
                <section className="pizzaro-shipping-card" aria-labelledby="shipping-heading">
                    <header className="pizzaro-shipping-heading">
                        <h1 id="shipping-heading">Shipping Info</h1>
                        <p>Where should we bring your freshly made order?</p>
                    </header>
                    <form className="pizzaro-shipping-form" onSubmit={submitHandler}>
                        <div className="pizzaro-shipping-field is-address">
                            <label htmlFor="address_field">Street address</label>
                            <input
                                type="text"
                                id="address_field"
                                className="pizzaro-shipping-control"
                                autoComplete="street-address"
                                placeholder="House number and street"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>

                        <div className="pizzaro-shipping-field">
                            <label htmlFor="city_field">City</label>
                            <input
                                type="text"
                                id="city_field"
                                className="pizzaro-shipping-control"
                                autoComplete="address-level2"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                            />
                        </div>

                        <div className="pizzaro-shipping-field">
                            <label htmlFor="phone_field">Phone number</label>
                            <input
                                type="tel"
                                id="phone_field"
                                className="pizzaro-shipping-control"
                                autoComplete="tel"
                                placeholder="For delivery updates"
                                value={phoneNo}
                                onChange={(e) => setPhoneNo(e.target.value)}
                                required
                            />
                        </div>

                        <div className="pizzaro-shipping-field">
                            <label htmlFor="postal_code_field">Postal code</label>
                            <input
                                type="text"
                                id="postal_code_field"
                                className="pizzaro-shipping-control"
                                autoComplete="postal-code"
                                inputMode="numeric"
                                placeholder="Postal code"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                required
                            />
                        </div>

                        <div className="pizzaro-shipping-field">
                            <label htmlFor="country_field">Country</label>
                            <select
                                id="country_field"
                                className="pizzaro-shipping-control"
                                autoComplete="country-name"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select a country</option>
                                {countriesList.map(country => (
                                    <option key={country.name} value={country.name}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            id="shipping_btn"
                            type="submit"
                            className="pizzaro-sign-in pizzaro-shipping-submit"
                        >
                            Continue to confirmation
                        </button>
                    </form>
                </section>
            </main>
        </>
    )
}

export default Shipping
