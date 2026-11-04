import { useState } from 'react'
import { useNavigate } from "react-router-dom";

const Search = ({ id = 'search_field' }) => {
    const [keyword, setKeyword] = useState('');
    let navigate = useNavigate();

    const searchHandler = (e) => {
        e.preventDefault()

        if (keyword.trim()) {
            navigate(`/search/${keyword}`)
        } else {
            navigate('/')
        }
    }
    return (
        <form onSubmit={searchHandler} role="search">

            <div className="input-group">
                <input
                    type="text"
                    id={id}
                    className="form-control"
                    placeholder="Search pizzas"
                    aria-label="Search pizzas"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
                <div className="input-group-append">
                    <button id="search_btn" className="btn" aria-label="Submit search">
                        <i className="fa fa-search" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </form>
    )
}

export default Search