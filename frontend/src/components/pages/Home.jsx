import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Rest from "../js/rest";
import NavigationBar from "../common/NavigationBar";
import TitleBar from "../ui/TitleBar";

function Home() {
  const [isSessionValid, setIsSessionValid] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserLogged = async () => {
      const token = sessionStorage.getItem("token");
      const validationResult = await Rest.validateUserSession(token);
      setIsSessionValid(Boolean(validationResult));
    };

    checkUserLogged();
  }, []);

  useEffect(() => {
    if (isSessionValid === false) {
      navigate("/login", { replace: true });
    }
  }, [isSessionValid, navigate]);

  if (!isSessionValid) {
    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <NavigationBar onNavigate={(path) => navigate(path)} />

      <main style={{ padding: "2rem", flex: 1 }}>
        <TitleBar title="BookDB Application Title" />
        <h1>Welcome to BookDB</h1>
        <p>Select an option from the navigation to get started.</p>
      </main>
    </div>
  );
}

export default Home;
