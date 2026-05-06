import { useState } from "react";
import Calendar from "../components/Calendar";
import styles from "../styles/HomePage.module.css";

export default function HomePage() {
  
  const [view, setView] = useState<"week" | "month">("month");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        {/* <h1 className={styles.title}>Bonjour, {user?.nomComplet || user?.email}</h1> */}
        <div className={styles.toggleGroup}>
          <button 
            className={`${styles.toggleBtn} ${view === "month" ? styles.active : ""}`}
            onClick={() => setView("month")} 
          >
            Mois
          </button>
          <button 
            className={`${styles.toggleBtn} ${view === "week" ? styles.active : ""}`}
            onClick={() => setView("week")}
          >
            Semaine
          </button>
        </div>
      </header>

      <div className={styles.calendarWrapper}>
        <Calendar view={view} /> 
      </div>
    </div>
  );
}
