import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import config from '../config/env';


export default function SignIn() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${config.API_BASE_URL}/auth-token/`, {
        email,
        password,
      });

      const token = res.data.token;
      if (token) {
        login(token);
        window.location.href = "/";
      }
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <h2>Sign In</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
