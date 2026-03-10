import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Auth gate
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/');
            return;
        }

        const fetchAssignments = async () => {
            try {
                // If backend isn't ready, we fallback to an empty array
                const res = await axios.get('http://localhost:5000/api/assignments');
                setAssignments(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch assignments.", err);
                setError("Failed to connect to backend. Please ensure the server is running.");
                setLoading(false);
            }
        };
        fetchAssignments();
    }, []);

    if (loading) return <div className="loader">Loading assignments...</div>;
    
    // Also handling empty states gracefully
    if (error && assignments.length === 0) {
      return (
        <div style={{textAlign: 'center', marginTop: '2rem'}}>
          <p className="error-msg">{error}</p>
          <div style={{marginTop: '1rem'}}>
            <p><strong>Note:</strong> Make sure you have started your MongoDB server and seeded the data using <code>node src/seed.js</code> in the backend folder.</p>
          </div>
        </div>
      );
    }

    return (
        <div>
            <h2 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Available Assignments</h2>
            
            {assignments.length === 0 ? (
                <p>No assignments found. Please seed the database.</p>
            ) : (
                <div className="assignment-list">
                    {assignments.map(assign => (
                        <div key={assign._id} className="assignment-card">
                            <div className="assignment-card__header">
                                <span className={`assignment-card__diff assignment-card__diff--${assign.difficulty.toLowerCase()}`}>
                                    {assign.difficulty}
                                </span>
                            </div>
                            <h3 className="assignment-card__title">{assign.title}</h3>
                            <p>{assign.description}</p>
                            <button 
                                className="btn--primary"
                                onClick={() => navigate(`/assignment/${assign._id}`)}
                                style={{marginTop: 'auto'}}
                            >
                                Attempt Assignment
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
