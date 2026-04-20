import { useState, useEffect } from "react";

function Profile() {
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [user, setUser] = useState(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });

    const primaryColor = "rgb(5, 74, 101)";

    // 🔹 Fetch current user info
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/me", {
                    credentials: "include"
                });

                const data = await res.json();

                if (!res.ok) return;

                const userData = data.user ?? data;

                setUser(userData);

                // ✅ PREFILL DIRECTLY (like EditBook)
                setForm({
                    name: userData.name || "",
                    email: userData.email || "",
                    password: ""
                });


            } catch (err) {
                console.error(err);
            }
        };

        fetchUser();
    }, []);







    // 🔹 Background based on role
    const backgroundColor =
        user?.role === "admin" ? "#eef6fa" : "#f4f4f4";

    const inputStyle = {
        width: "100%",
        padding: "12px",
        marginBottom: "15px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        fontSize: "14px"
    };

    const buttonStyle = {
        width: "100%",
        padding: "12px",
        backgroundColor: primaryColor,
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600"
    };

    const cardStyle = {
        width: "400px",
        backgroundColor: "#fff",
        padding: "35px",
        borderRadius: "12px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)"
    };

    return (
        <div
            style={{
                minHeight: "calc(100vh - 70px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: backgroundColor,
                padding: "20px"
            }}
        >
            <div style={cardStyle}>
                <h2
                    style={{
                        textAlign: "center",
                        marginBottom: "20px",
                        color: primaryColor
                    }}
                >
                    Profile Settings
                </h2>

                {/* 🔹 Current Info */}
                {user && (
                    <div
                        style={{
                            background: "#f9f9f9",
                            padding: "15px",
                            borderRadius: "8px",
                            marginBottom: "25px",
                            fontSize: "14px"
                        }}
                    >
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role:</strong> {user.role}</p>
                    </div>
                )}

                {/* Step indicator */}
                <div style={{ textAlign: "center", marginBottom: "20px", fontSize: "13px", color: "#777" }}>
                    Step {step} of 3
                </div>

                {/* STEP 1 */}
                {step === 1 && (
                    <button style={buttonStyle} onClick={async () => {
                        const res = await fetch("http://localhost:5000/api/users/request-update", {
                            method: "POST",
                            credentials: "include"
                        });
                        const data = await res.json();
                        if (res.ok) {
                            setMessage("OTP sent to your email");
                            setStep(2);
                        } else {
                            setMessage(data.message);
                        }
                    }}>
                        Request OTP
                    </button>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            style={inputStyle}
                        />
                        <button style={buttonStyle} onClick={async () => {
                            const res = await fetch("http://localhost:5000/api/users/verify-otp", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify({ otp })
                            });
                            const data = await res.json();
                            if (res.ok) {
                                setMessage("OTP verified successfully");
                                setStep(3);
                            } else {
                                setMessage(data.message);
                            }
                        }}>
                            Verify OTP
                        </button>
                    </>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <>
                        <input
                            type="text"
                            placeholder="New Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            style={inputStyle}
                        />

                        <input
                            type="email"
                            placeholder="New Email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            style={inputStyle}
                        />

                        <input
                            type="password"
                            placeholder="New Password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            style={inputStyle}
                        />

                        <button style={buttonStyle} onClick={async () => {
                            const res = await fetch("http://localhost:5000/api/users/update-profile", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify(form)
                            });
                            const data = await res.json();
                            if (res.ok) {
                                setMessage("Profile updated successfully");
                                setStep(1);
                            } else {
                                setMessage(data.message);
                            }
                        }}>
                            Update Profile
                        </button>
                    </>
                )}

                {message && (
                    <p style={{
                        marginTop: "20px",
                        textAlign: "center",
                        fontSize: "14px",
                        color: primaryColor
                    }}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Profile;
