import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sentiment from "sentiment";
import { getAdminDashboard } from "../services/api";

const sentimentAnalyzer = new Sentiment();

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
  });

  useEffect(() => {
    if (!localStorage.getItem("admin")) {
      navigate("/admin/login");
      return;
    }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getAdminDashboard();
      const feedbacks = res.data.reviews || [];

      // Analyze sentiment for each feedback
      const analyzedFeedbacks = feedbacks.map((review) => {
        const result = sentimentAnalyzer.analyze(review.comment);
        let sentiment = "Neutral";
        if (result.score > 0) sentiment = "Positive";
        else if (result.score < 0) sentiment = "Negative";

        return {
          ...review,
          sentiment,
        };
      });

      setReviews(analyzedFeedbacks);
      calculateSentimentStats(analyzedFeedbacks);
    } catch (err) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const calculateSentimentStats = (feedbacks) => {
    let positive = 0,
      neutral = 0,
      negative = 0;

    feedbacks.forEach((review) => {
      if (review.sentiment === "Positive") positive++;
      else if (review.sentiment === "Negative") negative++;
      else neutral++;
    });

    setStats({
      total: feedbacks.length,
      positive,
      neutral,
      negative,
    });
  };

  const logout = () => {
    localStorage.removeItem("admin");
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  if (loading) {
    return <div className="loading-screen">Loading Dashboard...</div>;
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">AdminPanel</h2>
        <ul>
          <li className="active">Dashboard</li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <h2>Admin Dashboard</h2>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <p>Total Feedback</p>
            <h2>{stats.total}</h2>
          </div>
          <div className="stat-card positive">
            <p>Positive</p>
            <h2>{stats.positive}</h2>
          </div>
          <div className="stat-card neutral">
            <p>Neutral</p>
            <h2>{stats.neutral}</h2>
          </div>
          <div className="stat-card negative">
            <p>Negative</p>
            <h2>{stats.negative}</h2>
          </div>
        </div>

        {/* Feedback Table */}
        <div className="table-card">
          <h3>All Feedback</h3>
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <tr key={index}>
                    <td>{review.user_id}</td>
                    <td>{"★".repeat(review.rating)}</td>
                    <td>{review.comment}</td>
                    <td>{review.sentiment}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No feedback available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
