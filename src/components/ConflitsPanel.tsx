import { type ConflitInfoDTO } from "../services/api";
import styles from "../styles/ConflitsPanel.module.css";

type Props = {
  conflits: ConflitInfoDTO[];
  onFermer: () => void;
  onReplanifier: (id: number) => void;
};

export default function ConflitsPanel({ conflits, onFermer, onReplanifier }: Props) {
  
  // Formate l'heure style étudiant 2e année
  const formaterHeure = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
  };

  const formaterDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-CA", { day: "numeric", month: "short" });
  };

  return (
    <div className={styles.panneau}>
      <div className={styles.entete}>
        <h3 className={styles.titre}>⚠️ Conflits détectés ({conflits.length})</h3>
        <button className={styles.boutonFermer} onClick={onFermer} style={{ border: "none", background: "none", cursor: "pointer", fontSize: "20px" }}>✕</button>
      </div>

      <div className={styles.liste}>
        {conflits.length === 0 ? (
          <div className={styles.vide}>
            <span className={styles.iconeSucces}>🎉</span>
            <p>Aucun conflit d'horaire. Votre calendrier est impeccable !</p>
          </div>
        ) : (
          conflits.map((c, index) => (
            <div key={index} className={styles.conflitCard}>
              <div className={styles.infoConflit}>
                Chevauchement de {c.chevauchementMinutes} minutes
              </div>

              <div className={styles.activite}>
                <span className={styles.nomActivite}>{c.nomA}</span>
                <span className={styles.tempsActivite}>
                  {formaterDate(c.debutA)} | {formaterHeure(c.debutA)} - {formaterHeure(c.finA)}
                </span>
                <button 
                  className={styles.boutonReplanifier}
                  onClick={() => onReplanifier(c.activiteIdA)}
                >
                  Replanifier {c.nomA}
                </button>
              </div>

              <div className={styles.separation}></div>

              <div className={styles.activite}>
                <span className={styles.nomActivite}>{c.nomB}</span>
                <span className={styles.tempsActivite}>
                  {formaterDate(c.debutB)} | {formaterHeure(c.debutB)} - {formaterHeure(c.finB)}
                </span>
                <button 
                  className={styles.boutonReplanifier}
                  onClick={() => onReplanifier(c.activiteIdB)}
                >
                  Replanifier {c.nomB}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
