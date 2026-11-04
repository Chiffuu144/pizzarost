const ListReviews = ({ reviews, currentUserId, onEdit }) => {
    return (
        <div className="pizzaro-review-list">
            {reviews && reviews.map(review => (
                <article key={review._id} className="pizzaro-review-item">
                    <div className="rating-outer">
                        <div className="rating-inner" style={{ width: `${(review.rating / 5) * 100}%` }}></div>
                    </div>
                    <p className="pizzaro-review-author">{review.user?.name || review.name}</p>
                    <p className="pizzaro-review-comment">{review.comment}</p>
                    {currentUserId && onEdit &&
                        (review.user?._id || review.user)?.toString() === currentUserId && (
                            <button type="button" className="pizzaro-review-edit" onClick={() => onEdit(review)}>
                                Edit your review
                            </button>
                        )}
                </article>
            ))}
        </div>
    )

}



export default ListReviews