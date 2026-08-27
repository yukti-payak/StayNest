import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ShowListing from "./pages/ShowListing";
import Footer from "./components/Footer";
import NewListing from "./pages/NewListing.jsx"
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content takes up available vertical space */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings/:id" element={<ShowListing />} />
          <Route path="/listings/new" element={<NewListing />} />

          {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>

      {/* Footer rendered at the bottom of all pages */}
      <Footer />
    </div>
  );
}

export default App;