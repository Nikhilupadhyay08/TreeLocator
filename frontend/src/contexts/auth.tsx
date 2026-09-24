import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export type UserRole = "citizen" | "officer" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  state: string;
  createdAt: string;

  // Officer-only fields
  department?: string;
  designation?: string;
  employeeId?: string;
}

export interface CitizenSignUpData {
  name: string;
  email: string;
  password: string;
  state: string;
}

export interface OfficerSignUpData {
  name: string;
  email: string;
  password: string;
  state: string;
  employeeId: string;
  department: string;
  designation: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;

  signUpCitizen: (
    data: CitizenSignUpData
  ) => Promise<{ success: boolean; error?: string }>;

  signUpOfficer: (
    data: OfficerSignUpData
  ) => Promise<{
    success: boolean;
    error?: string;
    officerId?: number;
    otp?: string;
  }>;

  verifyOfficer: (
    officerId: number,
    otp: string
  ) => Promise<{ success: boolean; error?: string }>;

  loginCitizen: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;

  loginOfficer: (
    email: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: string;
    officerId?: number;
  }>;

  logout: () => Promise<void>;
}

const TOKEN_KEY = "treetrack_token";
const USER_TYPE_KEY = "treetrack_user_type";

/**
 * Production API URL comes from Vercel:
 *
 * VITE_API_URL=https://treelocator-backend.onrender.com
 *
 * When VITE_API_URL is not set, the app falls back to relative
 * /api URLs so local development continues to work with the Vite proxy.
 */
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(
  /\/+$/,
  ""
);

function getApiUrl(path: string): string {
  // Local development fallback
  if (!API_BASE_URL) {
    return path;
  }

  // Make sure we don't create:
  // https://backend.com//api/...
  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }

  return `${API_BASE_URL}/${path}`;
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function getUserType(): UserRole | null {
  return localStorage.getItem(USER_TYPE_KEY) as UserRole | null;
}

function storeSession(token: string, userType: UserRole): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_TYPE_KEY, userType);
}

function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_TYPE_KEY);
}

/**
 * Common API request function for authentication.
 *
 * Local:
 *   /api/auth/...
 *
 * Production:
 *   https://treelocator-backend.onrender.com/api/auth/...
 */
async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = getToken();
  const userType = getUserType();

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (userType) {
    headers.set("X-User-Type", userType);
  }

  const url = getApiUrl(path);

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const json = await res.json().catch(() => ({}));

  return {
    ok: res.ok,
    status: res.status,
    data: json,
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Restore existing login session when the application starts.
   */
  useEffect(() => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch("/api/auth/me")
      .then(({ ok, data }) => {
        if (ok && data.user) {
          setUser(data.user);
        } else {
          clearSession();
        }
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /**
   * Citizen signup
   */
  const signUpCitizen = useCallback(
    async (data: CitizenSignUpData) => {
      const { ok, data: json } = await apiFetch(
        "/api/auth/citizen/signup",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      if (!ok) {
        return {
          success: false,
          error: json.error ?? "Sign up failed.",
        };
      }

      storeSession(json.token, "citizen");
      setUser(json.user);

      return {
        success: true,
      };
    },
    []
  );

  /**
   * Officer signup
   */
  const signUpOfficer = useCallback(
    async (data: OfficerSignUpData) => {
      const { ok, data: json } = await apiFetch(
        "/api/auth/officer/signup",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );

      if (!ok) {
        return {
          success: false,
          error: json.error ?? "Sign up failed.",
        };
      }

      return {
        success: true,
        officerId: json.officerId,
        otp: json.otp,
      };
    },
    []
  );

  /**
   * Officer OTP verification
   */
  const verifyOfficer = useCallback(
    async (officerId: number, otp: string) => {
      const { ok, data: json } = await apiFetch(
        "/api/auth/officer/verify",
        {
          method: "POST",
          body: JSON.stringify({
            officerId,
            otp,
          }),
        }
      );

      if (!ok) {
        return {
          success: false,
          error: json.error ?? "Verification failed.",
        };
      }

      storeSession(json.token, "officer");
      setUser(json.user);

      return {
        success: true,
      };
    },
    []
  );

  /**
   * Citizen login
   */
  const loginCitizen = useCallback(
    async (email: string, password: string) => {
      const { ok, data: json } = await apiFetch(
        "/api/auth/citizen/login",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (!ok) {
        return {
          success: false,
          error: json.error ?? "Login failed.",
        };
      }

      storeSession(json.token, "citizen");
      setUser(json.user);

      return {
        success: true,
      };
    },
    []
  );

  /**
   * Officer login
   */
  const loginOfficer = useCallback(
    async (email: string, password: string) => {
      const { ok, data: json, status } = await apiFetch(
        "/api/auth/officer/login",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (!ok) {
        if (status === 403) {
          return {
            success: false,
            error: json.error,
            officerId: json.officerId,
          };
        }

        return {
          success: false,
          error: json.error ?? "Login failed.",
        };
      }

      storeSession(json.token, "officer");
      setUser(json.user);

      return {
        success: true,
      };
    },
    []
  );

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // Even if the backend request fails,
      // clear the local session.
    }

    clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUpCitizen,
        signUpOfficer,
        verifyOfficer,
        loginCitizen,
        loginOfficer,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}
