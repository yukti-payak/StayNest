import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("country", formData.country);
      data.append("location", formData.location);

      if (imageFile) {
        data.append("image", imageFile);
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
    <div className="min-h-screen  text-gray-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 w-full">
        <div className="mb-4 text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Create a New Listing
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Fill in the details below to publish your place to the marketplace.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
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

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-md space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">
              Listing Title
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g., Cozy Beachfront Villa in Goa"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              rows="2"
              required
              placeholder="Describe what makes your space unique, amenities, nearby attractions..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">
              Upload Cover Photo
            </label>

            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-rose-400 hover:bg-rose-50/30 transition group">
                <div className="flex flex-col items-center justify-center py-2">
                  <svg
                    className="w-6 h-6 mb-1 text-gray-400 group-hover:text-rose-500 transition"
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
                  <p className="text-xs font-medium text-gray-600 group-hover:text-rose-600">
                    Click to upload <span className="text-gray-400 font-normal">or drag & drop</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG or WEBP</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 group h-32">
                <img
                  src={imagePreview}
                  alt="Upload Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-gray-900/70 hover:bg-gray-900 text-white p-1.5 rounded-full backdrop-blur-sm transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700">
                Price (per night)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs font-medium">
                  ₹
                </span>
                <input
                  name="price"
                  type="number"
                  required
                  placeholder="1200"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700">
                Country
              </label>
              <input
                name="country"
                type="text"
                required
                placeholder="India"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">
              Location / City
            </label>
            <input
              name="location"
              type="text"
              required
              placeholder="e.g., Jodhpur, Rajasthan"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white transition"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-xs transition shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[120px]"
            >
              {loading ? "Publishing..." : "Publish Listing"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NewListing;