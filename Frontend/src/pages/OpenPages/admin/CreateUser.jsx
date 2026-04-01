// Frontend/src/pages/OpenPages/admin/CreateUser.jsx
import { useState, useEffect } from "react";
import {
  createAdmin,
  createSupport,
  getCurrentUser,
} from "../../../API/LoginAPI";
import API from "../../../API/api"; // ✅ use axios instance
import styles from "./styles/CreateUser.module.css";

export default function CreateUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department_id: "",
    country_id: "",
  });

  const [departments, setDepartments] = useState([]);
  const [countries, setCountries] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [roleToCreate, setRoleToCreate] = useState("support");
  const [loading, setLoading] = useState(false);

  // 🔥 current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();

        setCurrentUser(data || null); // ✅ always set something

        if (data?.role === "admin") {
          setRoleToCreate("support");
          setForm((prev) => ({
            ...prev,
            department_id: data.department_id || "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
        setCurrentUser(null);
      }
    };

    fetchUser();
  }, []);
  // 🔥 fetch dropdowns
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [depRes, countryRes] = await Promise.all([
          API.get("/meta/departments"),
          API.get("/meta/countries"),
        ]);

        // ✅ ENSURE ARRAY (VERY IMPORTANT)
        setDepartments(Array.isArray(depRes) ? depRes : []);
        setCountries(Array.isArray(countryRes) ? countryRes : []);
      } catch (err) {
        console.error("Failed to fetch meta", err);
        setDepartments([]);
        setCountries([]);
      }
    };

    fetchMeta();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ✅ STRONGER VALIDATION
  const isValid =
    form.name.trim() &&
    form.email.trim() &&
    form.password.trim() &&
    form.country_id &&
    (roleToCreate === "admin" || form.department_id);

  // 🔥 submit
  const handleSubmit = async () => {
    if (!isValid) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const res =
        roleToCreate === "admin"
          ? await createAdmin(form)
          : await createSupport(form);

      // ✅ HANDLE DIFFERENT RESPONSE SHAPES
      if (res?.id || res?.success) {
        alert("User created ✅");

        setForm({
          name: "",
          email: "",
          password: "",
          department_id:
            currentUser?.role === "admin"
              ? currentUser.department_id || ""
              : "",
          country_id: "",
        });
      } else {
        alert(res?.error || "Failed");
      }
    } catch (err) {
      console.error(err);

      // ❌ axios-style error won't exist in fetch
      alert(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className={styles.page}
      style={{
        backgroundImage: "url('/images/oil-bg.jpg')",
      }}
    >
      {/* HEADER */}
      <div className={styles.header}>
        <img src="/images/logo.png" alt="logo" className={styles.logo} />
        <h1>Create User</h1>
      </div>

      {/* CARD */}
      <div className={styles.card}>
        <div className={styles.form}>
          <input
            value={form.name}
            placeholder="Full Name"
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <input
            value={form.email}
            placeholder="Email Address"
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <input
            value={form.password}
            placeholder="Password"
            type="password"
            onChange={(e) => handleChange("password", e.target.value)}
          />

          {/* SUPERADMIN */}
          {currentUser?.role?.toLowerCase() === "superadmin" && (
            <>
              <select
                value={roleToCreate}
                onChange={(e) => setRoleToCreate(e.target.value)}
              >
                <option value="support">Support</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={form.department_id}
                onChange={(e) =>
                  handleChange("department_id", Number(e.target.value))
                }
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* COUNTRY */}
          <select
            value={form.country_id}
            onChange={(e) => handleChange("country_id", Number(e.target.value))}
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            className={styles.button}
            disabled={!isValid || loading}
            onClick={handleSubmit}
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}
