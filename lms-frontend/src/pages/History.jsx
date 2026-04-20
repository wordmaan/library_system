import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../services/api";

function History() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/my-issues", {
        credentials: "include",
      });
      const data = await res.json();
      setIssues(data.issues || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const returnBook = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/return/${id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();
      alert(data.message);
      fetchHistory();
    } catch (err) {
      console.error(err);
      alert("Failed to return book");
    }
  };

  useEffect(() => {
    const init = async () => {
      const authUser = await checkAuth();
      if (!authUser) {
        navigate("/");
      } else {
        fetchHistory();
      }
    };
    init();
  }, [navigate]);

  if (loading) return <h3>Loading books...</h3>;

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
      background: "#6EC1E1",
      color: "#000",
      textAlign: "left",
    },
    th: {
      padding: "12px",
      fontWeight: "600",
    },
    tr: (index) => ({
      background: index % 2 === 0 ? "#f9f9f9" : "#fff",
    }),
    td: {
      padding: "10px",
      borderBottom: "1px solid #eee",
    },
    fine: (fine) => ({
      fontWeight: "600",
      color: fine > 0 ? "red" : "green",
    }),
    button: {
      padding: "6px 10px",
      background: "#6EC1E1",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "600",
    },
    returned: {
      color: "green",
      fontWeight: "600",
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
    maindiv: {
      padding: "20px",
      background: "#00000007",
    },
  };


  return (
    <div style={styles.container}>
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
        >Uers-Issue History</h2>

        {isMobile ? (
          // 📱 MOBILE VIEW — CARDS
          issues.map((issue, index) => (
            <div key={issue.id} style={styles.card}>
              <div style={styles.cardRow(0)}>
                <span style={styles.cardLabel}>Title</span>
                <span>{issue.title}</span>
              </div>

              <div style={styles.cardRow(1)}>
                <span style={styles.cardLabel}>Issue Date</span>
                <span>{issue.issue_date}</span>
              </div>

              <div style={styles.cardRow(2)}>
                <span style={styles.cardLabel}>Return Date</span>
                <span>{issue.return_date || "-"}</span>
              </div>

              <div style={{ ...styles.cardRow(3), ...styles.fine(issue.fine) }}>
                <span style={styles.cardLabel}>Fine</span>
                <span>{issue.fine}</span>
              </div>

              <div style={styles.cardActions}>
                {issue.return_date === null ? (
                  <button
                    onClick={() => returnBook(issue.id)}
                    style={styles.button}
                  >
                    Return Book
                  </button>
                ) : (
                  <span style={styles.returned}>Returned</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Issue Date</th>
                <th style={styles.th}>Return Date</th>
                <th style={styles.th}>Fine</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {issues.map((issue, index) => (
                <tr key={issue.id} style={styles.tr(index)}>
                  <td style={styles.td}>{issue.title}</td>
                  <td style={styles.td}>{issue.issue_date}</td>
                  <td style={styles.td}>{issue.return_date || "-"}</td>
                  <td style={{ ...styles.td, ...styles.fine(issue.fine) }}>
                    {issue.fine}
                  </td>
                  <td style={styles.td}>
                    {issue.return_date === null ? (
                      <button
                        onClick={() => returnBook(issue.id)}
                        style={styles.button}
                      >
                        Return Book
                      </button>
                    ) : (
                      <span style={styles.returned}>Returned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
        }
      </div >
    </div>
  );
}

export default History;
