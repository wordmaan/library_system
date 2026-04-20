import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { checkAuth } from "../services/api";

function EditBook() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  const [form, setForm] = useState({
    title: "",
    total_copies: "",
    available_copies: "",
  });

  useEffect(() => {
    const init = async () => {
      const authUser = await checkAuth();

      if (!authUser) {
        navigate("/");
        return;
      }

      if (authUser.role !== "admin") {
        navigate("/books");
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/books/${id}`, {
          credentials: "include",
        });

        const data = await res.json();

        setForm({
          title: data.title,
          total_copies: data.total_copies,
          available_copies: data.available_copies,
        });

        setCurrentImage(data.image); // ✅ image preview
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Failed to load book");
      }
    };

    init();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("total_copies", Number(form.total_copies));
      formData.append("available_copies", Number(form.available_copies));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`http://localhost:5000/api/books/${id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Book updated successfully");
      navigate("/admin/books");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  if (loading) return <h3 style={{ textAlign: "center" }}>Loading...</h3>;

  const primaryColor = "rgb(5, 74, 101)";

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "18px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none"
  };

  const labelStyle = {
    fontWeight: "600",
    fontSize: "14px",
    marginBottom: "6px",
    display: "block",
    color: "#444"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: primaryColor,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "10px"
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 70px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f4f6f8",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          backgroundColor: "#fff",
          padding: "35px",
          borderRadius: "12px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.08)"
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
            color: primaryColor
          }}
        >
          Edit Book
        </h2>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>Total Copies</label>
          <input
            type="number"
            name="total_copies"
            value={form.total_copies}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>Available Copies</label>
          <input
            type="number"
            name="available_copies"
            value={form.available_copies}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={labelStyle}>Book Image</label>

          {currentImage && (
            <img
              src={`http://localhost:5000/${currentImage}`}
              alt="Current"
              style={{
                width: "100px",
                height: "140px",
                objectFit: "cover",
                borderRadius: "8px",
                display: "block",
                marginBottom: "15px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
              }}
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            style={{ marginBottom: "15px" }}
          />

          <button type="submit" style={buttonStyle}>
            Update Book
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditBook;
