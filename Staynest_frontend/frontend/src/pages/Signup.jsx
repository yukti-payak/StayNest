import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await API.post("/auth/register", formData);

      if (res.data) {
        localStorage.setItem("user", JSON.stringify(res.data));
      }

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm bg-white space-y-6">
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Create an Account
          </h2>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Yukti"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="yukti@gmail.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-800">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-xl text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-rose-500 font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Signup;