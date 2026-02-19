import React, { useState } from 'react';

const RatingStars = ({ rating, onRatingChange }) => {
    const [hover, setHover] = useState(0);

    return (
        <div style={{ display: 'flex', gap: '5px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRatingChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '30px',
                        cursor: 'pointer',
                        color: star <= (hover || rating) ? '#ffc107' : '#ddd'
                    }}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

export default RatingStars;