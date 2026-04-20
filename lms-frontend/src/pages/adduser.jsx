import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AddUser() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "student",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("http://localhost:5000/api/admin/add-user", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });

        const data = await res.json();
        alert(data.message);

        if (res.ok) {
            navigate("/admin/manageuser");
        }
    };

    const styles = {
        page: {
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            background: "linear-gradient(135deg, rgb(5, 74, 101), rgb(8, 110, 145))",
        },
        card: {
            width: "100%",
            maxWidth: "420px",
            background: "#fff",
            padding: "40px 30px",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        },
        title: {
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "28px",
            color: "rgb(5, 74, 101)",
            fontWeight: "700",
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
        select: {
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "14px",
            outline: "none",
            background: "#fff",
        },
        button: {
            width: "100%",
            padding: "12px",
            background: "rgb(5, 74, 101)",
            color: "#fff",
            border: "none",
            borderRadius: "30px",
            fontWeight: "600",
            fontSize: "15px",
            cursor: "pointer",
            transition: "0.3s",
        },
        backBtn: {
            marginTop: "15px",
            textAlign: "center",
            color: "rgb(5, 74, 101)",
            cursor: "pointer",
            fontSize: "14px",
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Add New User</h2>

                <form onSubmit={handleSubmit}>
                    <input
                        style={styles.input}
                        placeholder="Full Name"
                        required
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />

                    <input
                        style={styles.input}
                        type="email"
                        placeholder="Email Address"
                        required
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />

                    <input
                        style={styles.input}
                        type="password"
                        placeholder="Password"
                        required
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />

                    <select
                        style={styles.select}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button type="submit" style={styles.button}>
                        Create User
                    </button>
                </form>

                <div
                    style={styles.backBtn}
                    onClick={() => navigate("/admin/manageuser")}
                >
                    ← Back to Manage Users
                </div>
            </div>
        </div>
    );
}

export default AddUser;
