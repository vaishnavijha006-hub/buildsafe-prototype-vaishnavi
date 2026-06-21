import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { syncUser } from "../lib/syncStore";

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
  {
    id: "usr-worker-2",
    email: "sunita@buildsafe.in",
    password: "demo123",
    name: "Sunita Devi",
    role: "worker",
    workerId: "BSW-4822",
  },
  {
    id: "usr-builder-1",
    email: "builder@buildsafe.in",
    password: "demo123",
    name: "Amit Verma",
    role: "builder",
  },
  {
    id: "usr-regulator-1",
    email: "audit@buildsafe.in",
    password: "demo123",
    name: "Priya Nair",
    role: "regulator",
  },
];

function loadUsers() {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all demo users exist in the local storage list
      let modified = false;
      const updated = [...parsed];
      for (const demo of DEMO_USERS) {
        if (!updated.some((u) => u.email.toLowerCase() === demo.email.toLowerCase())) {
          updated.push(demo);
          modified = true;
        }
      }
      if (modified) {
        localStorage.setItem(USERS_KEY, JSON.stringify(updated));
      }
      return updated;
    }
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

    syncUser(newUser).catch(() => {});

    const session = { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, workerId: newUser.workerId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(session);
    return session;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email, newPassword) => {
    const users = loadUsers();
    const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) throw new Error("No account registered with this email");
    users[idx].password = newPassword;
    saveUsers(users);
    return users[idx];
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
