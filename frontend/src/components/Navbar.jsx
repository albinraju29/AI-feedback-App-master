import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar = ({ title = "Feedback App" }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        toast.success('Logged out');
        navigate('/signin');
    };

    return (
        <nav className="nav">
            <h2 style={{ color: '#667eea' }}>{title}</h2>
            <div>
                {user.name && <span style={{ marginRight: '20px' }}>Hello, {user.name}</span>}
                <button onClick={logout} className="btn btn-danger">
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;