import "./NavigationBar.css";
import Rest from "../js/rest";

const NavigationBar = ({ onNavigate }) => {
  const navigateTo = (path) => {
    if (typeof onNavigate === "function") {
      onNavigate(path);
    }
  };

  const handleLogout = async () => {
    await Rest.logout();
    navigateTo("/login");
  };

  const links = [
    { label: "Home", action: () => navigateTo("/") },
    { label: "View Books", action: () => navigateTo("/books") },
    { label: "Login", action: () => navigateTo("/login") },
    { label: "Logout", action: handleLogout },
  ];

  return (
    <aside className="navigationBar">
      <h2 className="navigationBar__title">Navigation</h2>
      <ul className="navigationBar__list">
        {links.map(({ label, action }) => (
          <li key={label} className="navigationBar__item">
            <button
              type="button"
              onClick={action}
              className="navigationBar__button"
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default NavigationBar;
