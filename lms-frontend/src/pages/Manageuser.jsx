import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";
import { checkAuth } from "../services/api";

function ManageUser() {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);


    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/admin/users", {
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                return;
            }

            setUsers(data.users);
            setLoading(false);
        } catch (err) {
            console.error(err);
            alert("Failed to load users");
            setLoading(false);
        }
    };

    const promoteUser = async (userId) => {
        if (!window.confirm("Promote this user to admin?")) return;

        const res = await fetch("http://localhost:5000/api/admin/promote", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ user_id: userId }),
        });

        const data = await res.json();
        alert(data.message);
        fetchUsers(); // refresh
    };

    const demoteUser = async (user_id) => {
        if (!window.confirm("Demote this admin to student?")) return;

        try {
            const res = await fetch(
                "http://localhost:5000/api/admin/demote",
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ user_id }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Action failed");
                return;
            }

            alert(data.message);
            fetchUsers(); // refresh list
        } catch (err) {
            console.error(err);
            alert("Failed to fetch (server not reachable)");
        }
    };


    useEffect(() => {
        const init = async () => {
            const authUser = await checkAuth();

            if (!authUser || authUser.role !== "admin") {
                navigate("/");
                return;
            }

            fetchUsers();
        };

        init();
    }, [navigate]);

    if (loading) return <h3>Loading users...</h3>;

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
        button: {
            padding: "8px 14px",
            background: "rgb(5, 74, 101)",
            border: "none",
            borderRadius: "20px",
            cursor: "pointer",
            fontWeight: "600",
            color: "#fff",
            fontSize: "13px",
            transition: "0.3s",
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
                >Manage user</h2>
                <button style={styles.button} onClick={() => navigate(`/admin/add-user`)}>Add User</button>

                {isMobile ? (
                    // 📱 MOBILE VIEW — CARDS
                    users.map((user) => (
                        <div key={user.id} style={styles.card}>
                            <div style={styles.cardRow(0)}>
                                <span style={styles.cardLabel}>Name</span>
                                <span>{user.name}</span>
                            </div>

                            <div style={styles.cardRow(1)}>
                                <span style={styles.cardLabel}>Email</span>
                                <span>{user.email}</span>
                            </div>

                            <div style={styles.cardRow(2)}>
                                <span style={styles.cardLabel}>Role</span>
                                <span>{user.role}</span>
                            </div>

                            <div style={styles.cardRow(3)}>
                                <span style={styles.cardLabel}>Super Admin</span>
                                <span>{user.is_super_admin ? (
                                    "Super Admin"
                                ) : user.role === "admin" ? (
                                    <button
                                        style={styles.button}
                                        disabled={user.id === currentUser.id}
                                        onClick={() => demoteUser(user.id)}
                                    >
                                        Demote
                                    </button>

                                ) : (
                                    <button style={styles.button} onClick={() => promoteUser(user.id)}>
                                        Promote to Admin
                                    </button>
                                )}</span>
                            </div>
                        </div>
                    ))

                ) : (
                    // 🖥️ DESKTOP VIEW — TABLE
                    <table style={styles.table}>
                        <thead style={styles.thead}>
                            <tr>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Email</th>
                                <th style={styles.th}>Role</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td style={styles.td}>{user.name}</td>
                                    <td style={styles.td}>{user.email}</td>
                                    <td style={styles.td}>{user.role}</td>
                                    <td style={styles.td}>
                                        {user.is_super_admin ? (
                                            "Super Admin"
                                        ) : user.role === "admin" ? (
                                            <button
                                                style={styles.button}
                                                disabled={user.id === currentUser.id}
                                                onClick={() => demoteUser(user.id)}
                                            >
                                                Demote
                                            </button>

                                        ) : (
                                            <button style={styles.button} onClick={() => promoteUser(user.id)}>
                                                Promote to Admin
                                            </button>
                                        )}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
                }
            </div >
        </div >
    );
}

export default ManageUser;
