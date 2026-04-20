import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../services/api";

function AdminAddBook() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    total_copies: 1,
    available_copies: 1,
  });

  const [imageFile, setImageFile] = useState(null); // state for file

  useEffect(() => {
    const init = async () => {
      const user = await checkAuth();
      if (!user || user.role !== "admin") {
        navigate("/");
      }
    };
    init();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // create FormData correctly
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("author", form.author);
    formData.append("category", form.category);
    formData.append("total_copies", form.total_copies);
    formData.append("available_copies", form.available_copies);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await fetch("http://localhost:5000/api/books", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      alert(data.message);

      if (data.status === "success") {
        navigate("/admin/books");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add book");
    }
  };
  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, rgb(5, 74, 101), rgb(8, 110, 145))",
      padding: "20px",
    },
    card: {
      width: "100%",
      maxWidth: "500px",
      background: "#fff",
      padding: "35px",
      borderRadius: "14px",
      boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
    },
    title: {
      textAlign: "center",
      marginBottom: "25px",
      fontWeight: "600",
      color: "rgb(5, 74, 101)",
      fontSize: "22px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
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
    fileWrapper: {
      marginBottom: "20px",
    },
    fileLabel: {
      display: "block",
      marginBottom: "6px",
      fontWeight: "500",
      color: "#444",
    },
    fileInput: {
      fontSize: "14px",
    },
    button: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "none",
      background: "rgb(5, 74, 101)",
      color: "#fff",
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
        <h2 style={styles.title}>Add New Book</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="title"
            placeholder="Book Title"
            value={form.title}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            name="author"
            placeholder="Author Name"
            value={form.author}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="number"
            name="total_copies"
            placeholder="Total Copies"
            value={form.total_copies}
            onChange={handleChange}
            min="1"
            required
            style={styles.input}
          />

          <input
            type="number"
            name="available_copies"
            placeholder="Available Copies"
            value={form.available_copies}
            onChange={handleChange}
            min="0"
            required
            style={styles.input}
          />

          <div style={styles.fileWrapper}>
            <label style={styles.fileLabel}>Book Cover</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              style={styles.fileInput}
            />
          </div>

          <button type="submit" style={styles.button}>
            Save Book
          </button>
        </form>
        <div
          style={styles.backBtn}
          onClick={() => navigate("/admin/books")}
        >
          ← Back to Manage books
        </div>
      </div>
    </div>
  );

}

export default AdminAddBook;
