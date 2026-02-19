import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import FeedbackForm from './pages/FeedbackForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/signin" />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route 
                path="/feedback" 
                element={
                    <ProtectedRoute>
                        <FeedbackForm />
                    </ProtectedRoute>
                } 
            />
        </Routes>
    );
}

export default App;
