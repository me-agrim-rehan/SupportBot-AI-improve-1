import API from "./api";

/* 🔐 LOGIN */
export const loginUser = async (data) => {
  return await API.post("/auth/login", data);
};

/* 👤 CURRENT USER */
export const getCurrentUser = async () => {
  return await API.get("/auth/me");
};

/* 🚪 LOGOUT */
export const logoutUser = async () => {
  const res = await API.post("/auth/logout");
  return res.data;
};

/* ➕ CREATE ADMIN */
export const createAdmin = async (data) => {
  const res = await API.post("/superadmin/create-admin", data);
  return res.data;
};

/* ➕ CREATE SUPPORT */
export const createSupport = async (data) => {
  const res = await API.post("/superadmin/create-support", data);
  return res.data;
};
