import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

function Login() {

  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleLogin = async () => {
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage("❌ " + data.message);
        return;
      }

      // 🔥 UPDATE CONTEXT
      setUser({
        id: data.id,
        role: data.role,
        email: email
      });

      // 🔁 ROLE BASED REDIRECT
      if (data.role === "admin") {
        navigate("/admin/books");
      } else {
        navigate("/user/books");
      }

    } catch (err) {
      console.error(err);
      setMessage("❌ Server error");
    }
  };
  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #6EC1E4, #4A90E2)",
      padding: "20px",
    },
    card: {
      width: "100%",
      maxWidth: "400px",
      background: "#fff",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    },
    title: {
      textAlign: "center",
      marginBottom: "20px",
      fontWeight: "600",
      color: "#333",
    },
    input: {
      width: "100%",
      padding: "12px",
      marginBottom: "15px",
      borderRadius: "8px",
      border: "1px solid #ddd",
      fontSize: "14px",
      outline: "none",
    },
    button: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "none",
      background: "#4A90E2",
      color: "#fff",
      fontWeight: "600",
      fontSize: "15px",
      cursor: "pointer",
      transition: "background 0.3s",
    },
    message: {
      textAlign: "center",
      marginBottom: "15px",
      fontWeight: "500",
    },
    registerText: {
      textAlign: "center",
      marginTop: "15px",
      fontSize: "14px",
    },
    registerLink: {
      color: "#4A90E2",
      cursor: "pointer",
      fontWeight: "600",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>

        {message && (
          <p
            style={{
              ...styles.message,
              color: message.includes("❌") ? "#e74c3c" : "#2ecc71",
            }}
          >
            {message}
          </p>
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.button}>
          Login
        </button>

        <p style={styles.registerText}>
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            style={styles.registerLink}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
