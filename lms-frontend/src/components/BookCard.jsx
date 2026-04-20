import { motion } from "framer-motion";

function BookCard({ book, onIssue }) {
    if (book.is_active !== 1) return null;

    const IMAGE_BASE_URL = "http://localhost:5000/";

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, scale: 1.03 }}
            transition={{ duration: 0.35 }}
            style={{
                width: "100%",
                maxWidth: "350px",
                background: "#fff",
                borderRadius: "10px",
                padding: "10px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
            }}
        >
            {/* BOOK IMAGE */}
            {book.image ? (
                <motion.img
                    src={IMAGE_BASE_URL + book.image}
                    alt={book.title}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.25 }}
                    style={{
                        width: "110px",
                        height: "160px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        marginBottom: "8px",
                    }}
                />
            ) : (
                <div
                    style={{
                        width: "80px",
                        height: "110px",
                        background: "#eee",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "4px",
                        marginBottom: "8px",
                    }}
                >
                    No Image
                </div>
            )}

            {/* TITLE */}
            <div
                style={{
                    fontSize: "26px",
                    fontWeight: "600",
                    textAlign: "center",
                    lineHeight: "1.2",
                    marginBottom: "4px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                }}
                title={book.title}
            >
                {book.title}
            </div>

            {/* AUTHOR */}
            <div
                style={{
                    fontSize: "20px",
                    color: "#666",
                    textAlign: "center",
                    marginBottom: "6px",
                }}
            >
                {book.author}
            </div>

            {/* STATUS */}
            <div
                style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: book.available_copies > 0 ? "green" : "red",
                    marginBottom: "8px",
                }}
            >
                {book.available_copies > 0 ? "Available" : "Out"}
            </div>

            {/* BUTTON */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onIssue(book)}
                disabled={book.available_copies === 0}
                style={{
                    padding: "6px",
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#fff",
                    backgroundColor: book.available_copies > 0 ? "#6EC1E1" : "#aaa",
                    border: "none",
                    borderRadius: "12px",
                    width: "70%",
                    height: "34px",
                    cursor: book.available_copies > 0 ? "pointer" : "not-allowed",
                }}
            >
                Issue
            </motion.button>
        </motion.div>
    );
}

export default BookCard;