import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import LoginPanel from "../ui/LoginPanel";
import Rest from "../js/rest";


const initialState = { username: "", password: "" };

function Login({ onLogin }) {

  const navigate = useNavigate();
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
      const result = await Rest.login(formValues);
      if (typeof onLogin === "function") {
        onLogin(result);
      }
      setStatusMessage(result.status || "Successfully signed in.");
      setFormValues(initialState);
      setIsLoggedIn(true);
      navigate("/", { replace: true });
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
