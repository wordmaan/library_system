import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { checkAuth } from "../services/api";
import BookCard from "../components/BookCard";
import { motion } from "framer-motion";
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 }
};
function Books() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [categoryName, setCategoryName] = useState("");

  // ✅ Fetch Books (with category support)
  const fetchBooks = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const categoryId = params.get("category");

      let url = "http://localhost:5000/api/books";
      if (categoryId) {
        url = `http://localhost:5000/api/books/category/${categoryId}`;
      }

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      setBooks(categoryId ? data || [] : data.books || []);
    } catch (err) {
      console.error("Book fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Category Name
  const fetchCategoryName = async () => {
    const params = new URLSearchParams(location.search);
    const categoryId = params.get("category");

    if (!categoryId) {
      setCategoryName("");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/categories");
      const data = await res.json();
      const found = data.find((c) => c.id == categoryId);
      setCategoryName(found ? found.name : "");
    } catch (err) {
      console.log("Category fetch error:", err);
    }
  };

  // ✅ Auth Check
  useEffect(() => {
    const init = async () => {
      const authUser = await checkAuth();
      if (!authUser || authUser.role !== "student") {
        navigate("/");
      } else {
        setUser(authUser);
      }
      setLoading(false);
    };
    init();
  }, [navigate]);

  // ✅ Refetch books when category changes
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchBooks();
      fetchCategoryName();
    }
  }, [location.search, user]);

  if (loading) return <h3 style={styles.loading}>Loading books...</h3>;

  async function issueBook(book) {
    try {
      const res = await fetch(
        `http://localhost:5000/api/issue/${book.id}`,
        { method: "POST", credentials: "include" }
      );
      const data = await res.json();
      alert(data.message);
      fetchBooks();
    } catch (error) {
      alert("Failed to issue book");
    }
  }

  const params = new URLSearchParams(location.search);
  const categoryId = params.get("category");

  return (
    <div style={styles.container}>
      {/* ✅ Only show hero if NO category selected */}
      {!categoryId && (
        <div style={styles.heroSection}>
          <h1 style={styles.mainTitle}>RSSM LMS SYSTEM</h1>
          <p style={styles.subTitle}>STUDENT PANEL</p>
        </div>
      )}

      {/* CATALOG */}
      <div id="books-catalog" style={styles.catalogSection}>

        <h2 style={styles.catalogTitle}>
          {categoryName ? (
            <p >{categoryName} Catalog</p>
          ) :
            (
              <p >Catalog</p>
            )
          }</h2>



        {books.length === 0 ? (
          <p style={styles.emptyState}>No books available.</p>
        ) : (
          <motion.div
            style={styles.booksGrid}
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {books.map((book) => (
              <motion.div
                key={book.id}
                variants={cardVariants}
                transition={{ duration: 0.4, ease: "easeOut" }}
                whileHover={{ y: -8, scale: 1.03 }}
              >
                <BookCard book={book} onIssue={issueBook} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { width: "100%" },
  loading: { textAlign: "center", marginTop: "150px", fontSize: "18px" },

  heroSection: {
    height: "85vh",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "center",
    marginTop: "60px",
    marginBottom: "20px",
    backgroundColor: "#fafafa"
  },
  mainTitle: {
    fontFamily: "'Iceland', cursive",
    fontSize: "clamp(90px, 25vw, 210px)",
    letterSpacing: "4px",
    textAlign: "center",
    marginTop: "20PX",
    margin: 0,
  },
  subTitle: { fontFamily: "'Iceland', cursive", color: "#00000081", marginTop: "10px", fontSize: "20px", letterSpacing: "2px", fontWeight: "600", opacity: 0.8 },

  catalogSection: { marginTop: "20px", scrollMarginTop: "100px", textAlign: "center", paddingBottom: "60px" },
  catalogTitle: { fontFamily: "'Iceland', cursive", fontSize: "clamp(60px, 15vw, 100px)", color: "rgb(5 66 89)", marginBottom: "10px" },
  categoryLabel: { fontSize: "25px", fontWeight: "600", color: "#555", marginBottom: "20px" },
  emptyState: { marginTop: "40px", fontSize: "18px", color: "#777" },
  booksGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, 300px)", gap: "40px", justifyContent: "center", marginTop: "40px" },
};

export default Books;