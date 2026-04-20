import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../services/AuthContext";

function Navbar() {
    const navigate = useNavigate();
    const { user, setUser, loading } = useAuth();

    const [openProfile, setOpenProfile] = useState(false);
    const [categories, setCategories] = useState([]);
    const [showSidebar, setShowSidebar] = useState(false);
    const [isTablet, setIsTablet] = useState(window.innerWidth <= 992);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const profileRef = useRef(null);
    const sidebarRef = useRef(null);

    // ✅ Resize Listener
    useEffect(() => {
        const handleResize = () => setIsTablet(window.innerWidth <= 992);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const logout = async () => {
        await fetch("http://localhost:5000/api/logout", {
            method: "GET",
            credentials: "include",
        });
        setUser(null);
        navigate("/");
    };

    useEffect(() => {
        fetch("http://localhost:5000/api/categories")
            .then((res) => res.json())
            .then((data) => setCategories(data));
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setOpenProfile(false);
            if (sidebarRef.current && !sidebarRef.current.contains(e.target)) setShowSidebar(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadBooks = (categoryId) => {
        if (user.role === "admin") {
            navigate(`/admin/books?category=${categoryId}`);
        } else {
            navigate(`/user/books?category=${categoryId}`);
        }
        setShowSidebar(false);
        setMobileMenuOpen(false);
    };

    if (loading) return null;

    const navColor = user?.role === "admin" ? "#054a65" : "#268cb4";

    const styles = {
        navbar: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 30px",
            height: "70px",
            backgroundColor: navColor,
            color: "#fff",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        },
        navLeft: { display: "flex", alignItems: "center", gap: "25px" },
        logo: {
            background: "#fff",
            color: "#000",
            padding: "8px 20px",
            borderRadius: "25px",
            margin: 0,
        },
        link: { color: "#fff", cursor: "pointer", textDecoration: "none" },
        rightSide: { display: "flex", alignItems: "center", gap: "15px" },
        toggleBtn: { fontSize: "24px", background: "none", border: "none", color: "#fff", cursor: "pointer" },
        profileBtn: { borderRadius: "50%", height: "38px", width: "38px", border: "none", background: "#fff", cursor: "pointer" },
        profileDropdown: {
            position: "absolute",
            right: 0,
            top: "45px",
            background: "#fff",
            color: "#000",
            padding: "15px",
            borderRadius: "8px",
            width: "220px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        },
        logoutBtn: {
            marginTop: "10px",
            width: "100%",
            padding: "6px",
            background: "red",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
        },
        mobileMenu: {
            position: "fixed",
            top: "70px",
            left: 0,
            right: 0,
            background: navColor,
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            color: "#fff",
            zIndex: 999,
        },
        sidebar: {
            width: "220px",
            background: "#f4f6f9",
            padding: "20px 15px",
            height: "100vh",
            position: "fixed",
            top: "70px",
            left: showSidebar ? "0" : "-240px",
            transition: "0.3s ease",
            borderRight: "1px solid #ddd",
            zIndex: 998,
        },
        sidebarTitle: { fontWeight: "600", marginBottom: "15px" },
        categoryButton: {
            width: "100%",
            padding: "8px",
            marginBottom: "8px",
            border: "none",
            background: "#fff",
            borderRadius: "6px",
            cursor: "pointer",
            textAlign: "left",
        },
    };

    return (
        <>
            {user && (
                <nav style={styles.navbar}>
                    <div style={styles.navLeft}>
                        <Link to={user.role === "admin" ? "/admin/books" : "/user/books"} style={{ textDecoration: "none" }}>
                            <h3 style={styles.logo}>📚 LMS</h3>
                        </Link>

                        {/* Desktop Links */}
                        {!isTablet && (
                            <>
                                <span style={styles.link} onClick={() => setShowSidebar(!showSidebar)}>Categories</span>
                                {user.role === "student" && <Link style={styles.link} to="/user/history">My History</Link>}
                                {user.role === "admin" && (
                                    <>
                                        <Link style={styles.link} to="/admin/issues">Issue History</Link>
                                        <Link style={styles.link} to="/admin/manageuser">Manage Users</Link>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    <div style={styles.rightSide}>
                        {/* Toggle (Tablet) */}
                        {isTablet && <button style={styles.toggleBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>}

                        {/* Profile */}
                        <div ref={profileRef} style={{ position: "relative" }}>
                            <button style={styles.profileBtn} onClick={() => setOpenProfile(!openProfile)}>👤</button>
                            {openProfile && (
                                <div style={styles.profileDropdown}>
                                    <strong>{user.email}</strong>
                                    <p>Role: {user.role}</p>
                                    <Link to="/profile">Update Profile</Link>
                                    <button style={styles.logoutBtn} onClick={logout}>Logout</button>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            )}

            {/* Mobile Dropdown */}
            {isTablet && mobileMenuOpen && (
                <div style={styles.mobileMenu}>
                    <span onClick={() => setShowSidebar(!showSidebar)}>Categories</span>
                    {user.role === "student" && <Link to="/user/history" style={styles.link} onClick={() => setMobileMenuOpen(false)}>My History</Link>}
                    {user.role === "admin" && (
                        <>
                            <Link to="/admin/issues" style={styles.link} onClick={() => setMobileMenuOpen(false)}>Issue History</Link>
                            <Link to="/admin/manageuser" style={styles.link} onClick={() => setMobileMenuOpen(false)}>Manage Users</Link>
                        </>
                    )}
                </div>
            )}

            {/* Sidebar */}
            {user && (
                <div ref={sidebarRef} style={styles.sidebar}>
                    <div style={styles.sidebarTitle}>Categories</div>
                    {categories.map((cat) => (
                        <button key={cat.id} style={styles.categoryButton} onClick={() => loadBooks(cat.id)}>{cat.name}</button>
                    ))}
                </div>
            )}
        </>
    );
}

export default Navbar;