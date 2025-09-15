
import React from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = React.useState("");

  const handleLogin = (provider) => {
    window.location.href = `http://localhost:4001/auth/${provider}`;
  };

  const handleEmailLogin = async () => {
    if (!email) return;
    try {
      const res = await fetch("http://localhost:4001/auth/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.token) {
        window.location.href = `http://localhost:5173/dashboard?token=${data.token}`;
      }
    } catch (e) {

    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 flex flex-col justify-center items-center bg-white p-8">
        {/* Card container */}
        <div className="w-full max-w-sm border rounded-xl p-6 shadow-sm">
          {/* Logo area */}
          <div className="w-full flex flex-col items-center">
            <div className="w-20 h-20 mb-3 rounded-full border flex items-center justify-center overflow-hidden shadow-sm">
              <img src="/vite.svg" alt="Logo" className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to continue</p>
          </div>

          {/* Google */}
          <button
            onClick={() => handleLogin("google")}
            className="mt-6 flex items-center justify-center gap-3 w-full px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <FcGoogle size={22} /> Continue with Google
          </button>
          {/* GitHub */}
          <button
            onClick={() => handleLogin("github")}
            className="mt-3 flex items-center justify-center gap-3 w-full px-4 py-2 border rounded-lg hover:bg-gray-100 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <FaGithub size={20} /> Continue with GitHub
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-gray-400 text-xs">or</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          {/* Email input */}
          <input
            type="email"
            placeholder="yours@example.com"
            className="w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleEmailLogin} className="w-full bg-blue-600 text-white py-2 rounded-lg shadow-sm hover:opacity-95 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            Continue
          </button>

          <p className="text-gray-400 text-xs mt-3 text-center">By continuing you agree to our Terms</p>
        </div>
      </div>
      <div className="w-1/2 flex justify-center items-center bg-gradient-to-b from-gray-900 to-gray-700 text-white">
        <h2 className="text-2xl font-semibold text-center px-10">
          Long-term memory for AI <br />
          <span className="text-cyan-400">Start building for free</span>
        </h2>
      </div>
    </div>
  );
};

export default Login;
