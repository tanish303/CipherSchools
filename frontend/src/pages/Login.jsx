import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setUser }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const endpoint = isLogin ? '/api/login' : '/api/signup';
        
        try {
            const res = await axios.post(`http://localhost:5000${endpoint}`, { username, password });
            
            // Save user to local storage and redirect
            const userData = {
                userId: res.data.userId,
                username: res.data.username,
                isGuest: false
            };
            localStorage.setItem('user', JSON.stringify(userData));
            if (setUser) {
                setUser(userData);
            }
            
            navigate('/assignments');
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = () => {
        const userData = {
            userId: 'guest',
            username: 'Guest',
            isGuest: true
        };
        localStorage.setItem('user', JSON.stringify(userData));
        if (setUser) {
            setUser(userData);
        }

        navigate('/assignments');
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-card__header">
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>Continue your SQL journey with CipherSQLStudio</p>
                </div>

                <form className="login-card__form" onSubmit={handleSubmit}>
                    {error && <div className="error-msg" style={{marginBottom: '15px'}}>{error}</div>}
                    
                    <div className="form-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            required 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="Enter username" 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Enter password" 
                        />
                    </div>
                    
                    <button type="submit" className="btn--primary login-card__btn" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
                    </button>
                    
                    <div className="login-card__toggle">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? 'Sign Up' : 'Login'}
                        </span>
                    </div>
                </form>

                <div className="login-card__divider">
                    <span>OR</span>
                </div>

                <button 
                    className="btn--accent login-card__guest-btn" 
                    onClick={handleGuestLogin}
                >
                    Continue as Guest
                </button>
            </div>
        </div>
    );
};

export default Login;
