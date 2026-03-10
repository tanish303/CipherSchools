import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AssignmentAttempt from './pages/AssignmentAttempt';
import Login from './pages/Login';
import { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState(null);

  // Quick listener for routing/reloads
  useEffect(() => {
     const savedStr = localStorage.getItem('user');
     if (savedStr) {
       setUser(JSON.parse(savedStr));
     }
  }, []);

  const handleLogout = () => {
      localStorage.removeItem('user');
      setUser(null);
      window.location.href = "/";
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="header__title">CipherSQLStudio</h1>
          {user && (
              <div className="header__user">
                  <span>Hello, {user.isGuest ? 'Guest' : user.username}</span>
                  <button className="btn--header-logout" onClick={handleLogout}>Logout</button>
              </div>
          )}
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Login setUser={setUser} />} />
            <Route path="/assignments" element={<Home />} />
            <Route path="/assignment/:id" element={<AssignmentAttempt />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
