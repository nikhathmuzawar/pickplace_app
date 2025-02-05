import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Devices from './components/Devices';
import PromptPage from './components/PromptPage';
import Login from './components/Login';
import Teleop from './components/Teleop';
import Settings from './components/Settings';
import Signup from './components/Signup';
import PrivateRoute from './components/PrivateRoute';
import ImageVideoPage from './components/ImageVideoPage';
import { AuthProvider } from './components/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/devices" element={<PrivateRoute><Devices /></PrivateRoute>} />
          <Route path="/prompt" element={<PrivateRoute><PromptPage /></PrivateRoute>} />
          <Route path="/teleop" element={<PrivateRoute><ImageVideoPage /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
