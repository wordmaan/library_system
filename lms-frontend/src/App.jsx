import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/Login";
import Books from "./pages/books"
import History from "./pages/History";
import AdminDashboard from "./pages/AdminDashboard";
import AdminIssueHistory from "./pages/AdminIssueHistory";
import Navbar from "./components/Navbar";
import Register from "./pages/Register"
import Start from "./pages/start";
import AddUser from "./pages/adduser";
import Manageuser from "./pages/Manageuser";
import AdminAddBook from "./pages/AddBook";
import EditBook from "./pages/EditBook";

import Profile from "./pages/Profile";

<Route path="/profile" element={<Profile />} />

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />

        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />

          {/* STUDENT ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
            <Route path="/user/books" element={<Books />} />
            <Route path="/user/history" element={<History />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/books" element={<AdminDashboard />} />
            <Route path="/admin/issues" element={<AdminIssueHistory />} />
            <Route path="/admin/add-user" element={<AddUser />} />
            <Route path="/admin/manageuser" element={<Manageuser />} />
            <Route path="/admin/addbook" element={<AdminAddBook />} />
            <Route path="/admin/editbook/:id" element={<EditBook />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
