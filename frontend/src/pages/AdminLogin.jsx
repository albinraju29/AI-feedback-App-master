import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminLogin } from '../services/api';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await adminLogin({ username, password });

            if (res.data.message === "Admin login successful") {
                localStorage.setItem('admin', 'true');
                toast.success('Admin login successful');
                navigate('/admin/dashboard');
            }
        } catch (err) {
            toast.error('Invalid admin credentials');
        }
    };

    return (
        <div className="admin-container">

            <div className="admin-card">
                <h2>Admin Panel</h2>
                <p className="admin-subtitle">Secure access only</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit">
                        Login →
                    </button>
                </form>

                <p className="admin-hint">
                    Use: <strong>admin / admin123</strong>
                </p>

                <p className="admin-link">
                    <Link to="/signin">← Back to User Login</Link>
                </p>
            </div>

        </div>
    );
};

export default AdminLogin;

