import { useState } from "react";
import { useNavigate } from "react-router-dom";
function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleRegister = async () => {
    // e.preventDefault();
    if (!name || !email || !password) {
      setMessage("All feilds are required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Registered successfull!");
        setTimeout(() => navigate("/"), 1000)
        //navigate("/books")
      } else {
        setMessage("❌" + data.message);
      }
    }
    catch (err) {
      console.error(err);
      setMessage("❌ server error");
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
      transition: "border 0.3s",
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
    loginText: {
      textAlign: "center",
      marginTop: "15px",
      fontSize: "14px",
    },
    loginLink: {
      color: "#4A90E2",
      cursor: "pointer",
      fontWeight: "600",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>

        {message && (
          <p style={{
            ...styles.message,
            color: message.includes("❌") ? "#e74c3c" : "#2ecc71"
          }}>
            {message}
          </p>
        )}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

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

        <button
          onClick={handleRegister}
          style={styles.button}
        >
          Register
        </button>

        <p style={styles.loginText}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={styles.loginLink}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
export default Register;
