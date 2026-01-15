import { AuthProvider } from "react-admin";

const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

interface LoginCredentials {
  email: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface UserInfo {
  id: string;
  email: string;
  full_name: string;
  role: {
    name: string;
  };
}

export const authProvider: AuthProvider = {
  login: async ({ username, password }: { username: string; password: string }) => {
    const credentials: LoginCredentials = {
      email: username,
      password: password,
    };

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data: TokenResponse = await response.json();
    
    // Store tokens
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);

    return Promise.resolve();
  },

  logout: async () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return Promise.resolve();
  },

  checkAuth: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("Not authenticated");
    }
    return Promise.resolve();
  },

  checkError: async (error: any) => {
    const status = error?.status || error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getIdentity: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("Not authenticated");
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }

    const user: UserInfo = await response.json();
    return Promise.resolve({
      id: user.id,
      fullName: user.full_name,
      avatar: undefined,
    });
  },

  getPermissions: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return Promise.resolve("");
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return Promise.resolve("");
      }

      const user: UserInfo = await response.json();
      return Promise.resolve(user.role?.name || "");
    } catch {
      return Promise.resolve("");
    }
  },
};
