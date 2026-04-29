import { useAuth } from "../context/AuthContext";
import styles from "../styles/HomePage.module.css";
import Calendar from "../components/Calendar";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Bonjour, {user?.email}</h1>
        <Calendar />
      </main>
    </div>
  );
}
