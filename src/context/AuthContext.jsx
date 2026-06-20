import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { pushUserToNotion } from "../lib/notionClient";

const AuthContext = createContext(null);
const STORAGE_KEY = "buildsafe_auth";
const USERS_KEY = "buildsafe_users";

const DEMO_USERS = [
  {
    id: "usr-contractor-1",
    email: "contractor@buildsafe.in",
    password: "demo123",
    name: "Rajesh Sharma",
    role: "contractor",
  },
  {
    id: "usr-worker-1",
    email: "ramesh@buildsafe.in",
    password: "demo123",
    name: "Ramesh Kumar",
    role: "worker",
    workerId: "BSW-4821",
  },
];

function loadUsers() {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
  return DEMO_USERS;
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const users = loadUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) throw new Error("Invalid email or password");

    const session = { id: found.id, email: found.email, name: found.name, role: found.role, workerId: found.workerId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  }, []);

  const signup = useCallback(async ({ name, email, password, role, workerId }) => {
    const users = loadUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An account with this email already exists");
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      email: email.toLowerCase(),
      password,
      name,
      role,
      workerId: role === "worker" ? workerId : undefined,
    };
    users.push(newUser);
    saveUsers(users);

    pushUserToNotion(newUser).catch(() => {});

    const session = { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, workerId: newUser.workerId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
