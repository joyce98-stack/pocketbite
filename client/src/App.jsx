import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Register from './components/Register';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App" style={{ textAlign: 'center', marginTop: '50px' }}>
          {/* Your Branding */}
          <h1 className="">POCKETBITE</h1>
          <h1 className="">Your Pocket Your Bite🤪</h1>

          {/* Simple Navigation Links [cite: 3, 4] */}
          <nav style={{ margin: '20px 0' }}>
            <Link to="/login" style={{ margin: '10px' }}>Login</Link>
            <Link to="/register" style={{ margin: '10px' }}>Register</Link>
          </nav>

          <hr />

          {/* Module Routes [cite: 1, 2] */}
          <Routes>
            <Route path="/register" element={<Register />} /> 
            <Route path="/login" element={<Login />} /> [cite: 3]
            
            {/* Protected Route Example  */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <h2>Welcome to your Dashboard!</h2>
                </PrivateRoute>
              } 
            />

            {/* Home view */}
            <Route path="/" element={<p>Select an option above to get started.</p>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

