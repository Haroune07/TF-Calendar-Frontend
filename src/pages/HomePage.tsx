import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/HomePage.module.css";
import Calendar from "../components/Calendar";

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/users/signout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.appName}>MonApp</span>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Se déconnecter
        </button>
      </header>

      <main className={styles.main}>
        <h1>Bonjour, {user!.email} </h1>
        <Calendar />
        
      </main>
    </div>
  );
}
