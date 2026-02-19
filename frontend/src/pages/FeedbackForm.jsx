import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { submitFeedback } from '../services/api';
import Navbar from '../components/Navbar';
import RatingStars from '../components/RatingStars';
import "../styles/global.css";

const FeedbackForm = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    if (!user.id) {
        navigate('/signin');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select rating');
            return;
        }

        if (comment.length < 5) {
            toast.error('Comment too short');
            return;
        }

        setLoading(true);
        try {
            const res = await submitFeedback({
                user_id: user.id,
                rating,
                comment
            });

            toast.success(`Feedback Sent!`);
            setRating(0);
            setComment('');
        } catch (err) {
            toast.error('Failed to submit');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <div className="feedback-container">
                <div className="feedback-card">

                    <h2>Share Your Feedback</h2>

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label>Rating</label>
                            <RatingStars 
                                rating={rating} 
                                onRatingChange={setRating} 
                            />
                        </div>

                        <div className="form-group">
                            <label>Your Comment</label>
                            <textarea
                                rows="4"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tell us about your experience..."
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Feedback'}
                        </button>

                    </form>

                </div>

            </div>
        </>
    );
};

export default FeedbackForm;
