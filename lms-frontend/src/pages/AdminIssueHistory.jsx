import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuth } from "../services/api";

function AdminIssueHistory() {
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


  const fetchAdminIssues = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin-issues", {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      setIssues(data.issues || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to load issue history");
      setLoading(false);
    }
  };

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

      fetchAdminIssues();
    };

    init();
  }, [navigate]);

  if (loading) return <h3>Loading issue history...</h3>;

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
    fine: (fine) => ({
      fontWeight: "600",
      color: fine > 0 ? "red" : "green",
    }),
    return_date: (return_date) => ({
      fontWeight: "600",
      color: !return_date ? "red" : "green",
    }),
    button: {
      padding: "6px 10px",
      background: "rgb(5 74 101)",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: "600",
      color: "rgb(174 171 171)"
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
          issues.map((issue) => (
            <div key={issue.id} style={styles.card}>
              <div style={styles.cardRow(0)}>
                <span style={styles.cardLabel}>Book</span>
                <span>{issue.title}</span>
              </div>

              <div style={styles.cardRow(1)}>
                <span style={styles.cardLabel}>User</span>
                <span>{issue.name}</span>
              </div>

              <div style={styles.cardRow(2)}>
                <span style={styles.cardLabel}>Email</span>
                <span>{issue.email}</span>
              </div>

              <div style={styles.cardRow(3)}>
                <span style={styles.cardLabel}>Issue Date</span>
                <span>{issue.issue_date}</span>
              </div>

              <div style={styles.cardRow(4)}>
                <span style={styles.cardLabel}>Return Date</span>
                <span
                  style={styles.return_date(issue.return_date)}
                >
                  {issue.return_date || "Not returned"}
                </span>
              </div>

              <div style={styles.cardRow(5)}>
                <span style={styles.cardLabel}>Fine</span>
                <span style={styles.fine(issue.fine)}>
                  ₹ {issue.fine}
                </span>
              </div>

              <div style={styles.cardRow(6)}>
                <span style={styles.cardLabel}>Status</span>
                <span
                  style={styles.return_date(issue.return_date)}
                >
                  {issue.return_date ? "Returned" : "Issued"}
                </span>
              </div>
            </div>
          ))
        ) : (
          // 💻 DESKTOP VIEW — TABLE
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Book</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Issue Date</th>
                <th style={styles.th}>Return Date</th>
                <th style={styles.th}>Fine</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {issues.map((issue, index) => (
                <tr key={issue.id} style={styles.tr(index)}>
                  <td style={styles.td}>{issue.title}</td>
                  <td style={styles.td}>{issue.name}</td>
                  <td style={styles.td}>{issue.email}</td>
                  <td style={styles.td}>{issue.issue_date}</td>
                  <td style={styles.td}>{issue.return_date || "-"}</td>
                  <td style={{ ...styles.td, ...styles.fine(issue.fine) }}>
                    ₹ {issue.fine}
                  </td>
                  <td style={{ ...styles.td, ...styles.return_date(issue.return_date) }}>
                    {issue.return_date ? "Returned" : "Issued"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

}
export default AdminIssueHistory;
