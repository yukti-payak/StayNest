import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const NewListing = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    country: "",
    location: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle Text Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle File Upload & Preview Generation
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Remove Selected Image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("listing[title]", formData.title);
      data.append("listing[description]", formData.description);
      data.append("listing[price]", formData.price);
      data.append("listing[country]", formData.country);
      data.append("listing[location]", formData.location);

      if (imageFile) {
        data.append("listing[image]", imageFile);
      }

      const res = await API.post("/listings", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?._id || res.data?.data?._id) {
        const newId = res.data._id || res.data.data._id;
        navigate(`/listings/${newId}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create listing. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 py-10 w-full">
        {/* Header Section */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create a New Listing
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill in the details below to publish your place to the marketplace.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <button 
              type="button"
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-10 shadow-xl shadow-gray-100/50 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Listing Title
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g., Cozy Beachfront Villa in Goa"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              rows="4"
              required
              placeholder="Describe what makes your space unique, amenities, nearby attractions..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition resize-none"
            ></textarea>
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Upload Cover Photo
            </label>
            
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-rose-400 hover:bg-rose-50/30 transition group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-2 text-gray-400 group-hover:text-rose-500 transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.75"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-600 group-hover:text-rose-600">
                    Click to upload <span className="text-gray-400 font-normal">or drag & drop</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 group h-52">
                <img
                  src={imagePreview}
                  alt="Upload Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 bg-gray-900/70 hover:bg-gray-900 text-white p-2 rounded-full backdrop-blur-sm transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Grid Layout: Price & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                Price (per night)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm font-medium">
                  ₹
                </span>
                <input
                  name="price"
                  type="number"
                  required
                  placeholder="1200"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                Country
              </label>
              <input
                name="country"
                type="text"
                required
                placeholder="India"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">
              Location / City
            </label>
            <input
              name="location"
              type="text"
              required
              placeholder="e.g., Jodhpur, Rajasthan"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl text-sm transition shadow-md shadow-rose-200 disabled:opacity-50 flex items-center justify-center min-w-[140px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Publishing...
                </span>
              ) : (
                "Publish Listing"
              )}
            </button>
          </div>
        </form>
      </main>

    </div>
  );
};

export default NewListing;