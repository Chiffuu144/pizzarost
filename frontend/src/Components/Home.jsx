import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Product from './Product/Product'
import MetaData from './Layout/MetaData'
import Loader from './Layout/Loader';
import Pagination from '@mui/material/Pagination';

import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '../actions/productActions'
import { Link } from 'react-router-dom'
import { addItemToCart } from '../actions/cartActions'
import { toast } from 'react-toastify'
import { formatCurrency } from '../utils/formatCurrency'

const Home = () => {
    // console.log(products)
    // const [products, setProducts] = useState([])
    const { keyword } = useParams()
    const navigate = useNavigate()
    const [pageSelection, setPageSelection] = useState({ keyword: undefined, page: 1 })
    const currentPage = pageSelection.keyword === keyword ? pageSelection.page : 1
    const setCurrentPage = useCallback(
        page => setPageSelection({ keyword, page }),
        [keyword]
    )
    const [categoryFilter, setCategoryFilter] = useState({ keyword: undefined, category: '' })
    const [minimumRating, setMinimumRating] = useState(0)
    const [hasReviews, setHasReviews] = useState(false)
    const [reviewKeyword, setReviewKeyword] = useState('')
    const [debouncedReviewKeyword, setDebouncedReviewKeyword] = useState('')
    const [minPriceDraft, setMinPriceDraft] = useState('')
    const [maxPriceDraft, setMaxPriceDraft] = useState('')
    const [appliedMinPrice, setAppliedMinPrice] = useState('')
    const [appliedMaxPrice, setAppliedMaxPrice] = useState('')
    const dispatch = useDispatch();
    const { loading, products, error, productsCount, resPerPage, filteredProductsCount, categories = [] } = useSelector(state => state.products);
    const [isFeatured, setIsFeatured] = useState(false)
    const selectedCategory = categoryFilter.keyword === keyword ? categoryFilter.category : ''
    const categoryOptions = categories
    const featuredPizza = products.find(product => product.name.toLowerCase() === 'great manhattan')
        || products.find(product => product.category?.toLowerCase() === 'pizza')

    const count = filteredProductsCount ?? productsCount



    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            dispatch(getProducts(
                currentPage,
                keyword,
                selectedCategory,
                minimumRating,
                hasReviews,
                debouncedReviewKeyword,
                appliedMinPrice,
                appliedMaxPrice
            ))
        }, 200)
        return () => window.clearTimeout(timeoutId)
    }, [
        currentPage,
        keyword,
        selectedCategory,
        minimumRating,
        hasReviews,
        debouncedReviewKeyword,
        appliedMinPrice,
        appliedMaxPrice,
        dispatch
    ]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedReviewKeyword(reviewKeyword)
            setCurrentPage(1)
        }, 250)
        return () => window.clearTimeout(timeoutId)
    }, [reviewKeyword, setCurrentPage])

    const visibleProducts = selectedCategory
        ? products.filter(product => product.category === selectedCategory)
        : products

    const addFeaturedToCart = async () => {
        if (!featuredPizza) return

        try {
            await dispatch(addItemToCart(featuredPizza._id, 1))
            toast.success(`${featuredPizza.name} added to your cart`)
        } catch (cartError) {
            toast.error(cartError.response?.data?.message || cartError.message || 'Unable to add this pizza to your cart')
        }
    }

    const applyPriceFilter = event => {
        event.preventDefault()
        const form = event.currentTarget
        if (!form.reportValidity()) return
        setAppliedMinPrice(minPriceDraft)
        setAppliedMaxPrice(maxPriceDraft)
        setCurrentPage(1)
    }

    const viewFullMenu = () => {
        setCategoryFilter({ keyword: undefined, category: '' })
        setMinimumRating(0)
        setHasReviews(false)
        setReviewKeyword('')
        setDebouncedReviewKeyword('')
        setMinPriceDraft('')
        setMaxPriceDraft('')
        setAppliedMinPrice('')
        setAppliedMaxPrice('')
        setCurrentPage(1)
        navigate('/#products')
        document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <>
            <MetaData title={'Pizza for sharing'} />
            <main className="pizzaro-home">
                <section className="pizza-hero" aria-labelledby="pizza-hero-title">
                    <div className="pizza-hero-inner">
                        <div className="pizza-hero-copy">
                            <p className="pizza-hero-eyebrow">
                                <svg viewBox="0 0 16 16" aria-hidden="true">
                                    <path d="M8.6 1.5c.7 2.6-.9 3.6-1.1 5.2-.8-.5-1.2-1.4-1.2-2.5C4.4 6 3 7.9 3 10a5 5 0 0 0 10 0c0-2.4-1.3-4.5-4.4-8.5Z" />
                                    <path d="M8.2 8.3c.3 1.2-.6 1.7-.7 2.5-.5-.4-.7-.8-.7-1.4a3.1 3.1 0 0 0-1.3 2.4 2.5 2.5 0 0 0 5 0c0-1.3-.7-2.4-2.3-3.5Z" />
                                </svg>
                                Handcrafted &amp; wood-fired
                            </p>
                            <h1 id="pizza-hero-title">Artisanal slices,<br /><em>uncompromised flavor.</em></h1>
                            <p className="pizza-hero-description">
                                Made with 72-hour cold-fermented dough, vibrant San Marzano tomatoes,
                                and fresh ingredients. Find your new favorite and bring it to the table.
                            </p>
                            <a className="pizza-hero-cta" href="#products">
                                Order a pizza <i className="fa fa-long-arrow-right" aria-hidden="true" />
                            </a>
                            <a className="pizza-hero-secondary" href="#products">Explore the menu</a>
                            <div className="pizza-hero-metrics" aria-label="Our pizza-making standards">
                                <div><strong>480°C</strong><span>Brick oven</span></div>
                                <div><strong>72 hrs</strong><span>Slow-fermented dough</span></div>
                                <div><strong>100%</strong><span>Fresh ingredients</span></div>
                            </div>
                        </div>
                        <div className="pizza-hero-visual">
                            <article className="pizza-order-preview" aria-label="Featured pizza menu preview">
                                {featuredPizza ? (
                                    <>
                                        <div className="pizza-order-preview-top">
                                            <div>
                                                <p>Featured selection</p>
                                                <h2>{featuredPizza.name}</h2>
                                            </div>
                                            <span>Chef&apos;s choice</span>
                                        </div>
                                        <div className="pizza-feature-image">
                                            <img
                                                src={featuredPizza.images?.[0]?.url || '/images/pizzaro-hero.jpg'}
                                                alt={featuredPizza.name}
                                            />
                                        </div>
                                        <div className="pizza-order-preview-body">
                                            <div className="pizza-order-preview-title">
                                                <div>
                                                    <h3>{featuredPizza.name}</h3>
                                                    <p>{featuredPizza.description || 'A Pizzaro favorite, made fresh to order.'}</p>
                                                </div>
                                                <button
                                                    className={`pizza-favorite-button${isFeatured ? ' is-favorite' : ''}`}
                                                    type="button"
                                                    aria-label={isFeatured ? 'Remove from favorites' : 'Add to favorites'}
                                                    aria-pressed={isFeatured}
                                                    onClick={() => setIsFeatured(favorite => !favorite)}
                                                >
                                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                                        <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.75L6 21V4.75Z" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="pizza-order-preview-actions">
                                                <strong>{formatCurrency(featuredPizza.price)}</strong>
                                                <button
                                                    className="pizza-feature-add"
                                                    type="button"
                                                    onClick={addFeaturedToCart}
                                                    disabled={!featuredPizza.stock}
                                                >
                                                    {featuredPizza.stock ? 'Add to cart' : 'Sold out'}
                                                </button>
                                                <Link className="pizza-feature-customize" to={`/product/${featuredPizza._id}`}>
                                                    Customize
                                                </Link>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="pizza-feature-loading">
                                        <p>{loading ? 'Finding today’s featured pizza…' : 'Explore the menu to find your next favorite.'}</p>
                                        {!loading && <a href="#products">Browse the menu</a>}
                                    </div>
                                )}
                            </article>
                        </div>
                    </div>
                </section>

                <section id="products" className="container pizzaro-menu-section">
                    <div className="pizzaro-section-heading">
                        <p className="pizza-hero-eyebrow">SOMETHING DELICIOUS FOR EVERY CRAVING</p>
                        <h2 id="products_heading">Find Your Perfect Slice</h2>
                        <p>Fresh favorites, made for sharing.</p>
                    </div>
                    {loading ? <Loader /> : error ? (
                        <p className="pizzaro-menu-error" role="alert">{error}. Please try again in a moment.</p>
                    ) : (
                        <div className="container">
                            {categoryOptions.length > 0 && (
                                <div className="pizzaro-categories">
                                    <label htmlFor="pizza-category-filter">Category</label>
                                    <select
                                        id="pizza-category-filter"
                                        value={selectedCategory}
                                        onChange={event => {
                                            setCategoryFilter({ keyword, category: event.target.value })
                                            setCurrentPage(1)
                                        }}
                                    >
                                        <option value="">All pizzas</option>
                                        {categoryOptions.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="pizzaro-catalog-filters" aria-label="Catalog filters">
                                <form className="pizzaro-price-filter" onSubmit={applyPriceFilter}>
                                    <label htmlFor="minimum-price">Minimum price (₱)</label>
                                    <input
                                        id="minimum-price"
                                        className="form-control"
                                        type="number"
                                        min="0"
                                        max="1000000"
                                        step="0.01"
                                        value={minPriceDraft}
                                        onChange={event => setMinPriceDraft(event.target.value)}
                                        placeholder="No minimum"
                                    />
                                    <label htmlFor="maximum-price">Maximum price (₱)</label>
                                    <input
                                        id="maximum-price"
                                        className="form-control"
                                        type="number"
                                        min={minPriceDraft || 0}
                                        max="1000000"
                                        step="0.01"
                                        value={maxPriceDraft}
                                        onChange={event => setMaxPriceDraft(event.target.value)}
                                        placeholder="No maximum"
                                    />
                                    <button type="submit" className="btn btn-primary">
                                        Apply price
                                    </button>
                                </form>
                                <label className="pizzaro-filter-field">
                                    Minimum rating
                                    <select
                                        className="form-control"
                                        value={minimumRating}
                                        onChange={event => {
                                            setMinimumRating(Number(event.target.value))
                                            setCurrentPage(1)
                                        }}
                                    >
                                        <option value={0}>Any rating</option>
                                        <option value={3}>3 stars &amp; up</option>
                                        <option value={4}>4 stars &amp; up</option>
                                        <option value={4.5}>4.5 stars &amp; up</option>
                                    </select>
                                </label>
                                <label className="pizzaro-review-filter">
                                    <input
                                        type="checkbox"
                                        checked={hasReviews}
                                        onChange={event => {
                                            setHasReviews(event.target.checked)
                                            setCurrentPage(1)
                                        }}
                                    />
                                    Has reviews
                                </label>
                                <label className="pizzaro-filter-field">
                                    Search reviews
                                    <input
                                        className="form-control"
                                        type="search"
                                        value={reviewKeyword}
                                        onChange={event => setReviewKeyword(event.target.value)}
                                        maxLength={80}
                                        placeholder="Find a review"
                                    />
                                </label>
                            </div>
                            <div className="pizzaro-featured-heading">
                                <div>
                                    <p className="pizza-hero-eyebrow">FRESH FROM OUR KITCHEN</p>
                                    <h3>Our Most-Loved Pizzas</h3>
                                    <p>Made fresh, packed with flavor, and ready to make your day.</p>
                                </div>
                            </div>
                            <div className="row">
                                {visibleProducts.map(product => (
                                    <Product key={product._id} product={product} />
                                ))}
                            </div>
                            {!visibleProducts.length && (
                                <p className="pizzaro-empty-category">No products match these filters.</p>
                            )}
                            <div className="pizzaro-menu-navigation">
                                {resPerPage < count && (
                                    <Pagination
                                        className="pizzaro-pagination"
                                        count={Math.ceil(count / resPerPage)}
                                        page={currentPage}
                                        onChange={(event, value) => setCurrentPage(value)}
                                        color="primary"
                                        variant="outlined"
                                        shape="rounded"
                                        showFirstButton
                                        showLastButton
                                        size="large"
                                    />
                                )}
                                <div className="pizzaro-menu-cta">
                                    <button type="button" className="pizzaro-outline-button" onClick={viewFullMenu}>
                                        View Full Menu
                                        <i className="fa fa-arrow-right" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
                <section id="about" className="pizzaro-about">
                    <div className="pizzaro-about-inner">
                        <div className="pizzaro-about-visual">
                            <img
                                src={featuredPizza?.images?.[0]?.url || '/images/pizzaro-hero.jpg'}
                                alt={featuredPizza ? featuredPizza.name : 'Freshly made Pizzaro pizza'}
                                loading="lazy"
                            />
                        </div>
                        <div className="pizzaro-about-copy">
                            <p className="pizza-hero-eyebrow">A LITTLE ABOUT US</p>
                            <h2>Good Pizza.<br />Great Moments.</h2>
                            <p>At Pizzaro, every slice is made for sharing. From delicious flavors to satisfying favorites, we're here to make every meal a little more special.</p>
                        </div>
                    </div>
                </section>
                <section className="pizzaro-promo" id="locations">
                    <div>
                        <p className="pizza-hero-eyebrow">FIND US</p>
                        <h2>Visit us at TUPT.</h2>
                        <p>Pizzaro is located at TUPT in Taguig City. Check the map for directions.</p>
                    </div>
                    <a
                        href="https://www.google.com/maps/search/?api=1&amp;query=TUPT%2C%20Taguig%20City"
                        className="pizza-hero-cta"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Get directions <i className="fa fa-long-arrow-right" aria-hidden="true" />
                    </a>
                </section>
            </main>
        </>
    )
}

export default Home