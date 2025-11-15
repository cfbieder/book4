const apiBase = import.meta.env.VITE_APP_API ?? "";

export default class Rest {
  // Authenticate the user and persist the session token
  static async login({ username, password }) {
    const response = await fetch(`${apiBase}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.success !== true) {
      const message =
        payload?.err ||
        payload?.status ||
        `Unable to sign in (status ${response.status})`;
      throw new Error(message);
    }
    sessionStorage.setItem("login", "Y");
    sessionStorage.setItem("token", payload.token);
    sessionStorage.setItem("User", username);
    return payload;
  }

  // Validate user session with the provided token
  static async validateUserSession(token) {
    try {
      const response = await fetch(
        `${apiBase}/api/users/valid`,
        {
          headers: token ? { "x-access-token": token } : {},
        }
      );
      if (!response.ok) {
        console.error("Unable to validate user session");
        return null;
      }
      const payload = await response.json();
      console.log("User session validation result:", payload);
      sessionStorage.setItem("login", "Y");
      return payload;
    } catch (error) {
      console.error("Failed to check user session", error);
      sessionStorage.setItem("login", "N");
      return null;
    }
  }

  // Log out the current user and clear any session artifacts
  static async logout() {
    try {
      const response = await fetch(`${apiBase}/api/users/logout`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Logout failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to logout", error);
    } finally {
      sessionStorage.removeItem("token");
      sessionStorage.setItem("login", "N");
      sessionStorage.removeItem("User");
    }
  }

  // Retrieve the list of books from the API
  static async getBooks() {
    try {
      const response = await fetch(`${apiBase}/api/books`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Unable to load books (status ${response.status})`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch books", error);
      throw (
        error instanceof Error ? error : new Error("Failed to fetch books.")
      );
    }
  }

}
