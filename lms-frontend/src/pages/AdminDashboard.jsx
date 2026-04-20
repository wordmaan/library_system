import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../services/api";
import AddBook from "./AddBook";
import { useLocation } from "react-router-dom";


function AdminDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const deleteBook = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    const res = await fetch(`http://localhost:5000/api/books/${id}`, {
      method: "DELETE",
      credentials: "include"
    });

    const data = await res.json();
    alert(data.message);
    fetchBooks(); // refresh list
  };

  const restoreBook = async (id) => {
    if (!window.confirm("Are you sure you want to restore this book?")) return;

    const res = await fetch(`http://localhost:5000/api/books/restore/${id}`, {
      method: "PUT",
      credentials: "include"
    });

    const data = await res.json();
    alert(data.message);
    fetchBooks(); // refresh list
  };



  const fetchBooks = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const categoryId = params.get("category");

      let url = "http://localhost:5000/api/books";

      if (categoryId) {
        url = `http://localhost:5000/api/books/category/${categoryId}`;
      }

      const res = await fetch(url, {
        credentials: "include",
      });

      const data = await res.json();

      setBooks(categoryId ? data || [] : data.books || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    const init = async () => {
      const authUser = await checkAuth();

      if (!authUser || authUser.role !== "admin") {
        navigate("/");
      } else {
        setUser(authUser);
      }

      setLoading(false);
    };

    init();
  }, [navigate]);

  // 👇 NEW EFFECT — Refetch when category changes
  useEffect(() => {
    if (user) {
      fetchBooks();
    }
  }, [location.search, user]);

  if (loading) {
    return <h3>Loading books...</h3>;
  }

  const styles = {
    container: {
      padding: "20px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "20px",
      background: "#fff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      borderRadius: "8px",
      overflow: "hidden",
    },
    thead: {
      background: "rgb(5 74 101)",
      color: "#000",
      textAlign: "left",
    },
    th: {
      padding: "12px",
      fontWeight: "600",
      color: "rgb(255, 255, 255)"
    },
    tr: (index) => ({
      background: index % 2 === 0 ? "#f9f9f9" : "#fff",
    }),
    td: {
      padding: "10px",
      borderBottom: "1px solid #eee",
    },
    is_active: (is_active) => ({
      fontWeight: "600",
      color: is_active === 0 ? "red" : "green",
    }),
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
    addButton: {
      width: isMobile ? "80%" : "30%",
      padding: "14px",
      background: "rgb(5, 74, 101)",
      color: "#fff",
      border: "none",
      borderRadius: "30px",
      fontWeight: "600",
      fontSize: "16px",
      cursor: "pointer",
      margin: "0 auto 20px auto",
      display: "block",
    },

    returned: {
      color: "green",
      fontWeight: "600",
    },
    maindiv: {
      padding: "20px",
      background: "#00000007",
    },
    card: {
      background: "#fff",
      borderRadius: "10px",
      padding: "15px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      marginBottom: "15px",
    },
    cardRow: (Rowindex) => ({
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "8px",
      fontSize: "14px",
      background: Rowindex % 2 === 0 ? "#f9f9f9" : "#fff",
      padding: "4px 6px",
      borderRadius: "4px",
    }),

    cardLabel: {
      fontWeight: "600",
      color: "#555",
    },
    cardActions: {
      display: "flex",
      gap: "10px",
      marginTop: "10px",
    },
    bookImg: {
      width: "50px",
      height: "70px",
      objectFit: "cover",
      borderRadius: "4px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    },
    cardImg: {
      width: "70px",
      height: "100px",
      objectFit: "cover",
      borderRadius: "6px",
      marginBottom: "10px",
    },

  };


  return (
    <div style={styles.container}>
      <div
        style={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          justifyContent: "center",
          marginBottom: "20px",
          backgroundColor: "#fafafa"
        }}
      >
        <h1
          style={{
            fontFamily: "'Iceland', cursive",
            fontSize: "clamp(90px, 25vw, 210px)",
            letterSpacing: "4px",
            color: "#000",
            textAlign: "center",
            marginTop: "20PX",
            marginBottom: "0"
          }}
        >
          RSSM LMS SYSTEM
        </h1>
        <p
          style={{
            marginTop: "10px",
            fontSize: "20px",
            letterSpacing: "2px",
            fontWeight: "600",
            opacity: 0.8,
            color: "#00000081",
            fontFamily: "'Iceland', cursive",
          }}>ADMIN PANEL</p>
      </div>

      <div id="available-books" style={styles.maindiv}>
        <h2 style={{
          fontFamily: "'Iceland', cursive",
          fontSize: "clamp(60px, 15vw, 100px)",
          letterSpacing: "4px",
          color: "rgb(5 66 89)",
          textAlign: "center",
          marginTop: "20PX",
          marginBottom: "30px "
        }}
        >Available Books</h2>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <button
            style={styles.addButton}
            onClick={() => navigate("/admin/addbook")}
          >
            Add Book
          </button>
        </div>



        {isMobile ? (
          // 📱 MOBILE VIEW — CARDS
          books.map((book, index) => (
            <div key={book.id} style={styles.card}>
              {book.image && (
                <img
                  src={`http://localhost:5000/${book.image}`}
                  alt={book.title}
                  style={styles.cardImg}
                />
              )}

              <div style={styles.cardRow(0)}>
                <span style={styles.cardLabel}>Title</span>
                <span>{book.title}</span>
              </div>

              <div style={styles.cardRow(1)}>
                <span style={styles.cardLabel}>Author</span>
                <span>{book.author}</span>
              </div>

              <div style={styles.cardRow(2)}>
                <span style={styles.cardLabel}>Category</span>
                <span>{book.category}</span>
              </div>

              <div style={styles.cardRow(3)}>
                <span style={styles.cardLabel}>Total</span>
                <span>{book.total_copies}</span>
              </div>

              <div style={styles.cardRow(4)}>
                <span style={styles.cardLabel}>Available</span>
                <span>{book.available_copies}</span>
              </div>

              <div style={styles.cardActions}>
                {book.is_active === 0 ? (
                  <button
                    style={styles.button}
                    onClick={() => restoreBook(book.id)}
                  >
                    Restore
                  </button>
                ) : (
                  <>
                    <button
                      style={styles.button}
                      onClick={() => navigate(`/admin/editbook/${book.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      style={styles.button}
                      onClick={() => deleteBook(book.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          // 🖥️ DESKTOP VIEW — TABLE
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Cover</th>
                <th style={styles.th}>Title</th>

                <th style={styles.th}>Author</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Available</th>
                <th style={styles.th} colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book, index) => (
                <tr key={book.id} style={styles.tr(index)}>
                  <td style={styles.td}>
                    {book.image ? (
                      <img
                        src={`http://localhost:5000/${book.image}`}
                        alt={book.title}
                        style={styles.bookImg}
                      />
                    ) : (
                      "-"
                    )}
                  </td>

                  <td style={styles.td}>{book.title}</td>
                  <td style={styles.td}>{book.author}</td>
                  <td style={styles.td}>{book.category}</td>
                  <td style={styles.td}>{book.total_copies}</td>
                  <td style={styles.td}>{book.available_copies}</td>

                  {book.is_active === 0 ? (
                    <>
                      <td style={{ ...styles.td, ...styles.is_active(0) }}>Deleted</td>
                      <td style={styles.td}>
                        <button
                          style={styles.button}
                          onClick={() => restoreBook(book.id)}
                        >
                          Restore
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={styles.td}>
                        <button
                          style={styles.button}
                          onClick={() => navigate(`/admin/editbook/${book.id}`)}
                        >
                          Edit
                        </button>
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.button}
                          onClick={() => deleteBook(book.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>

  );
}

export default AdminDashboard;
