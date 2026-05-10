import { useState, useEffect } from "react";
import Calendar from "../components/Calendar";
import ConflitsPanel from "../components/ConflitsPanel";
import { programmableApi, type ConflitInfoDTO } from "../services/api";
import styles from "../styles/HomePage.module.css";

export default function HomePage() {
  const [view, setView] = useState<"week" | "month">("month");
  const [estPanneauOuvert, setEstPanneauOuvert] = useState(false);
  const [conflits, setConflits] = useState<ConflitInfoDTO[]>([]);
  const [itemIdAReplanifier, setItemIdAReplanifier] = useState<number | null>(null);

  // Charger les conflits au chargement pour le bouton
  useEffect(() => {
    programmableApi.getConflits().then(setConflits);
    
    // Rafraîchir toutes les 30 secondes pour les conflits (style étudiant attentif)
    const intervalle = setInterval(() => {
      programmableApi.getConflits().then(setConflits);
    }, 30000);
    
    return () => clearInterval(intervalle);
  }, []);

  const gererReplanifier = (id: number) => {
    setItemIdAReplanifier(id);
    setEstPanneauOuvert(false);
    // On remet à null après un court délai pour permettre de recliquer sur le même ID plus tard
    setTimeout(() => setItemIdAReplanifier(null), 500);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
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

        {conflits.length > 0 && (
          <button 
            className={styles.conflitBtn}
            onClick={() => setEstPanneauOuvert(true)}
          >
            ⚠️ Conflits 
            <span className={styles.conflitCount}>{conflits.length}</span>
          </button>
        )}
      </header>

      <div className={styles.calendarWrapper}>
        <Calendar view={view} replanifierId={itemIdAReplanifier} /> 
      </div>

      {estPanneauOuvert && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 85, background: 'rgba(0,0,0,0.1)' }} 
            onClick={() => setEstPanneauOuvert(false)} 
          />
          <ConflitsPanel 
            conflits={conflits} 
            onFermer={() => setEstPanneauOuvert(false)} 
            onReplanifier={gererReplanifier}
          />
        </>
      )}
    </div>
  );
}

