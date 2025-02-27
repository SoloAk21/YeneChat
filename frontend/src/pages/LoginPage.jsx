import React, { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoggingIn } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Login successful! Redirecting...");
      navigate("/");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="h-screen  flex items-center justify-center">
      <div className="card w-full max-w-md  shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold mb-4">Login</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                placeholder="Email"
                className="input input-bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Password"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label className="label">
                <a
                  href="/forgot-password"
                  className="label-text-alt link link-hover"
                >
                  Forgot password?
                </a>
              </label>
            </div>
            <div className="form-control mt-6">
              <button
                className="btn btn-primary btn-block"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Logging In..." : "Login"}
              </button>
            </div>
          </form>
          <div className="divider">OR</div>
          <div className="form-control">
            <button className="btn btn-outline btn-ghost btn-block gap-2">
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Login with Google
            </button>
          </div>
          <div className="text-center mt-4">
            <span className="text-sm">Don't have an account? </span>
            <a href="/signup" className="link link-primary">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
