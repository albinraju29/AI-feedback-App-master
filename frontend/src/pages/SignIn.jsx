import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signIn } from '../services/api';
import "../styles/global.css"; // New dedicated CSS

const SignIn = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await signIn(form);

            localStorage.setItem('user', JSON.stringify({
                id: res.data.user_id,
                email: form.email
            }));

            toast.success('Login successful!');
            navigate('/feedback');
        } catch (err) {
            toast.error('Invalid credentials');
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-card">

                {/* LEFT SIDE */}
                <div className="signin-left">
                    <div className="signin-branding">
                        <h1>Smart Emotion Feedback</h1>
                        
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="signin-right">
                    <div className="signin-form-wrapper">
                        <h2>Sign in</h2>

                        <form onSubmit={handleSubmit}>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />

                            <input
                                type="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />

                            <div className="remember-forgot">
                                <label>
                                    <input type="checkbox" /> Remember me
                                </label>
                                <span className="forgot">Forgot password?</span>
                            </div>

                            <button type="submit">Sign in →</button>
                        </form>

                        <p className="bottom-text">
                            No account? <Link to="/signup">Sign up</Link>
                        </p>
                        <p className="bottom-text admin-text">
                            Admin Access? <Link to="/admin/login">Login here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
