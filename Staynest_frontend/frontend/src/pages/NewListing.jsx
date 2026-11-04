import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, MapPin, X, AlertCircle } from "lucide-react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const inputClass =
  "w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 bg-white transition focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-400";

const labelClass = "block text-sm font-semibold mb-1.5 text-gray-800";

const MAX_DESC = 500;

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
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Free the preview URL when it changes / on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "description" && value.length > MAX_DESC) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (PNG, JPG or WEBP).");
      return;
    }
    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    setFile(e.dataTransfer.files?.[0]);
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
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (imageFile) data.append("image", imageFile);

      const res = await API.post("/listings", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newId = res.data?._id || res.data?.data?._id;
      navigate(newId ? `/listings/${newId}` : "/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not publish your listing. Check the details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const previewPlace = [formData.location, formData.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Create a new listing
          </h1>
          <p className="text-gray-500 mt-1">
            Add your place's details and photo. Travelers will see it on StayNest right after you publish.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start justify-between gap-3"
          >
            <span className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </span>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-3 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8"
          >
            {/* About the place */}
            <section className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900">About your place</h2>

              <div>
                <label htmlFor="title" className={labelClass}>
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="e.g., Cozy beachfront villa in Goa"
                  value={formData.title}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="description" className="text-sm font-semibold text-gray-800">
                    Description
                  </label>
                  <span className="text-xs text-gray-400">
                    {formData.description.length}/{MAX_DESC}
                  </span>
                </div>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  required
                  placeholder="What makes your space special? Mention amenities and nearby attractions."
                  value={formData.description}
                  onChange={handleChange}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </section>

            {/* Photo */}
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900">Cover photo</h2>

              {!imagePreview ? (
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl cursor-pointer transition group ${
                    dragging
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-300 hover:border-rose-400 hover:bg-rose-50/40"
                  }`}
                >
                  <ImagePlus className="w-8 h-8 mb-2 text-gray-400 group-hover:text-rose-500 transition" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload{" "}
                    <span className="text-gray-400 font-normal">or drag and drop</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-56">
                  <img
                    src={imagePreview}
                    alt="Cover photo preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    aria-label="Remove photo"
                    className="absolute top-3 right-3 bg-gray-900/70 hover:bg-gray-900 text-white p-2 rounded-full backdrop-blur-sm transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </section>

            {/* Price and location */}
            <section className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900">Price and location</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className={labelClass}>
                    Price per night
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 text-sm font-medium">
                      ₹
                    </span>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="1"
                      required
                      placeholder="1200"
                      value={formData.price}
                      onChange={handleChange}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className={labelClass}>
                    Country
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    required
                    placeholder="India"
                    value={formData.country}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className={labelClass}>
                  City or area
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  placeholder="e.g., Jodhpur, Rajasthan"
                  value={formData.location}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </section>

            <div className="pt-5 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-7 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-rose-200 disabled:opacity-60 min-w-[140px] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publishing…
                  </>
                ) : (
                  "Publish listing"
                )}
              </button>
            </div>
          </form>

          {/* Live preview */}
          <aside className="lg:col-span-2 lg:sticky lg:top-28">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              How your listing will look
            </p>
            <article className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="w-10 h-10 text-gray-300" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg leading-snug text-gray-900 line-clamp-2 min-h-[3.25rem]">
                  {formData.title || "Your listing title"}
                </h3>
                <p className="mt-1.5 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{previewPlace || "City, Country"}</span>
                </p>
                <p className="pt-3 text-gray-900 font-bold">
                  ₹{formData.price ? Number(formData.price).toLocaleString("en-IN") : "0"}{" "}
                  <span className="text-sm font-normal text-gray-500">/ night</span>
                </p>
              </div>
            </article>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NewListing;