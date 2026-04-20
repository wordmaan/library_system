//api.jsx
export const checkAuth = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/me", {
      method: "GET",
      credentials: "include",  // important to send cookies
    });

    const data = await res.json();

    if (res.ok && data.logged_in) {
      return data; // user info
    }

    return null; // not logged in
  } catch (err) {
    console.error("Auth check failed", err);
    return null;
  }
};
