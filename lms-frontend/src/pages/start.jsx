import { useNavigate } from "react-router-dom";

function Start() {
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;

    const styles = {
        container: {
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            background: "linear-gradient(to right, rgb(5,74,101), rgb(3,50,70))",
            textAlign: "center",
        },
        title: {
            fontSize: isMobile ? "32px" : "48px",
            color: "#fff",
            marginBottom: "10px",
            fontWeight: "700",
            letterSpacing: "2px",
        },
        subtitle: {
            fontSize: isMobile ? "16px" : "20px",
            color: "#ffffffcc",
            marginBottom: "40px",
        },
        buttonContainer: {
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "20px",
            width: isMobile ? "100%" : "50%",
            justifyContent: "center",
        },
        button: {
            flex: 1,
            padding: "14px",
            fontSize: "16px",
            fontWeight: "600",
            borderRadius: "30px",
            border: "none",
            cursor: "pointer",
            transition: "0.3s",
            background: "#fff",
            color: "rgb(5, 74, 101)",
        },
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>RSSM LMS SYSTEM</h1>
            <p style={styles.subtitle}>
                Welcome to Library Management System
            </p>

            <div style={styles.buttonContainer}>
                <button
                    style={styles.button}
                    onClick={() => navigate("/register")}
                >
                    Register
                </button>

                <button
                    style={styles.button}
                    onClick={() => navigate("/login")}
                >
                    Login
                </button>
            </div>
        </div>
    );
}

export default Start;
