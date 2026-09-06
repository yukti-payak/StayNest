import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    country: "",
  });

  const [currentImage, setCurrentImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current listing data to populate form inputs
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await API.get(`/listings/${id}`);
        const data = res.data?.data || res.data;

        setFormData({
          title: data.title || "",
          description: data.description || "",
          price: data.price || "",
          location: data.location || "",
          country: data.country || "",
        });

        if (data.image?.url) {
          setCurrentImage(data.image.url);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load listing details");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("location", formData.location);
      data.append("country", formData.country);

      if (imageFile) {
        data.append("listing[image]", imageFile);
      }

      await API.put(`/listings/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/listings/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update listing.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-white">
        <Navbar />
        <div className="text-center py-20 text-gray-600 font-medium">Loading listing details...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
          <Link to={`/listings/${id}`} className="text-sm text-gray-600 hover:text-rose-500 transition">
            Cancel
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-sm">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800">Title</label>
            <input
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800">Description</label>
            <textarea
              name="description"
              rows="4"
              required
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            />
          </div>

          {currentImage && (
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800">Current Image</label>
              <img
                src={currentImage}
                alt="Current listing preview"
                className="w-full h-48 object-cover rounded-xl border border-gray-200 mb-2"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-800">
              Upload New Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-500 hover:file:bg-rose-100 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800">Price (per night)</label>
              <input
                name="price"
                type="number"
                required
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800">Location</label>
              <input
                name="location"
                type="text"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800">Country</label>
              <input
                name="country"
                type="text"
                required
                value={formData.country}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Saving Changes..." : "Update Listing"}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default EditListing;