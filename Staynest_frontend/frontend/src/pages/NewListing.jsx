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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle Text Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle File Upload Input
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create FormData object to support multipart file upload
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

      // Navigate to the newly created listing or home page
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
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        <h2 className="text-2xl font-bold text-center mb-6">
          Create a New Listing
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm bg-gray-50/50 space-y-4"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800">
              Title
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="Add a catchy title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800">
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              required
              placeholder="Enter description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            ></textarea>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={handleFileChange}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-600 hover:file:bg-rose-100 cursor-pointer"
            />
          </div>

          {/* Price & Country Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800">
                Price
              </label>
              <input
                name="price"
                type="number"
                required
                placeholder="1200"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold mb-1 text-gray-800">
                Country
              </label>
              <input
                name="country"
                type="text"
                required
                placeholder="India"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800">
              Location
            </label>
            <input
              name="location"
              type="text"
              required
              placeholder="Jodhpur, Rajasthan"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            />
          </div>

          {/* Submit Button */}
          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-2.5 bg-gray-900 hover:bg-black text-white font-medium rounded-xl text-sm transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Listing"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NewListing;