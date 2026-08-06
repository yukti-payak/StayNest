import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ShowListing from "./pages/ShowListing";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/listings/:id" element={<ShowListing />} />
    </Routes>
  );
}

export default App;