import { useState } from "react";
import styles from "./Login.module.css";
import LoginPanel from "../ui/loginpanel";

const apiBase = import.meta.env.VITE_APP_API ?? "";


async function loginRequest({ username, password }) {
  const response = await fetch(`${apiBase}/api/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success !== true) {
    const message =
      payload?.err ||
      payload?.status ||
      `Unable to sign in (status ${response.status})`;
    throw new Error(message);
  }

  return payload;
}


const initialState = { username: "", password: "" };

function Login({ onLogin }) {

  const [formValues, setFormValues] = useState(initialState);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
    setStatusMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formValues.username || !formValues.password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const result = await loginRequest(formValues);
      if (typeof onLogin === "function") {
        onLogin(result);
      }
      setStatusMessage(result.status || "Successfully signed in.");
      setFormValues(initialState);
      setIsLoggedIn(true);
    } catch (error) {
      setErrorMessage(
        error?.message || "Unable to sign in. Please try again."
      );
      setIsLoggedIn(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.panelWrapper}>
        <LoginPanel
          formValues={formValues}
          onChange={handleChange}
          onSubmit={handleSubmit}
          errorMessage={errorMessage}
          statusMessage={statusMessage}
          isSubmitting={isSubmitting}
        />
        <aside className={styles.statusPanel} aria-live="polite">
          <h2 className={styles.statusTitle}>Session Status</h2>
          <p className={styles.statusText}>
            {isLoggedIn ? "Logged in" : "Not logged in"}
          </p>
        </aside>
      </div>
    </div>
  );
}

export default Login;
