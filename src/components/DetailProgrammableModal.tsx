import { useState } from "react";
import { programmableApi, type ProgrammableDTO, type CreneauDisponibleDTO } from "../services/api";
import styles from "../styles/DetailProgrammableModal.module.css";

type Props = {
  programmable: ProgrammableDTO;
  onFermer: () => void;
  onSupprime: (id: number) => void;
  onMisAJour: (item: ProgrammableDTO) => void;
};

export default function DetailProgrammableModal({ programmable, onFermer, onSupprime, onMisAJour }: Props) {
  const [estEnTrainDeCharger, setEstEnTrainDeCharger] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [afficherReplanification, setAfficherReplanification] = useState(false);
  const [nouvelleDate, setNouvelleDate] = useState(programmable.dateDepart.slice(0, 16));
  const [suggestions, setSuggestions] = useState<CreneauDisponibleDTO[]>([]);

  const supprimer = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet élément ?")) return;
    
    setEstEnTrainDeCharger(true);
    try {
      await programmableApi.deleteProgrammable(programmable.id);
      onSupprime(programmable.id);
      onFermer();
    } catch (err: any) {
      setErreur(err.message || "Erreur lors de la suppression");
    } finally {
      setEstEnTrainDeCharger(false);
    }
  };

  const replanifier = async (dateChoisie?: string) => {
    const dateATiliser = dateChoisie || nouvelleDate;
    setEstEnTrainDeCharger(true);
    setErreur(null);
    setSuggestions([]);

    try {
      if (programmable.type === "activite") {
        // Pour les activités, on utilise l'endpoint spécial avec suggestions de conflit
        const reponse = await programmableApi.replanifierActivite(programmable.id, dateATiliser);
        
        if (reponse.conflitDetecte) {
          setErreur("Conflit détecté ! Voici des suggestions de créneaux libres :");
          setSuggestions(reponse.suggestions);
        } else {
          onMisAJour(reponse.activite);
          onFermer();
        }
      } else {
        // Pour les événements, on fait une simple mise à jour (le backend n'a pas de replanifier spécifique)
        const misAJour = await programmableApi.updateEvenement(programmable.id, {
          dateDepart: dateATiliser
        });
        onMisAJour({ ...misAJour, type: "evenement" });
        onFermer();
      }
    } catch (err: any) {
      setErreur(err.message || "Erreur lors de la replanification");
    } finally {
      setEstEnTrainDeCharger(false);
    }
  };

  // Formate la date pour l'affichage (étudiant 2e année style)
  const formaterDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("fr-CA", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <>
      <div className={styles.fond} onClick={onFermer}></div>
      <div className={styles.modal}>
        <div className={styles.entete}>
          <h2 className={styles.titre}>{programmable.nom}</h2>
          <button className={styles.boutonFermer} onClick={onFermer}>✕</button>
        </div>

        <div className={styles.contenu}>
          <div className={styles.section}>
            <span className={styles.label}>Type</span>
            <span className={styles.valeur}>
              {programmable.type === "activite" ? "Activité" : "Événement"}
            </span>
          </div>

          <div className={styles.section}>
            <span className={styles.label}>Date et Heure</span>
            <span className={styles.valeur}>{formaterDate(programmable.dateDepart)}</span>
          </div>

          {programmable.type === "activite" && (
            <div className={styles.section}>
              <span className={styles.label}>Durée</span>
              <span className={styles.valeur}>{programmable.dureeHeures} heure(s)</span>
            </div>
          )}

          {programmable.description && (
            <div className={styles.section}>
              <span className={styles.label}>Description</span>
              <p className={styles.description}>{programmable.description}</p>
            </div>
          )}

          {afficherReplanification && (
            <div className={styles.zoneReplanifier}>
              <span className={styles.label}>Choisir une nouvelle date</span>
              <input
                type={programmable.type === "activite" ? "datetime-local" : "date"}
                className={styles.champDate}
                value={programmable.type === "activite" ? nouvelleDate : nouvelleDate.slice(0, 10)}
                onChange={(e) => setNouvelleDate(e.target.value)}
              />
              <button 
                className={styles.boutonReplanifier}
                onClick={() => replanifier()}
                disabled={estEnTrainDeCharger}
              >
                {estEnTrainDeCharger ? "Chargement..." : "Confirmer"}
              </button>

              {suggestions.length > 0 && (
                <div className={styles.suggestions}>
                  <span className={styles.titreSuggestions}>Créneaux suggérés :</span>
                  <div className={styles.grilleSuggestions}>
                    {suggestions.map((s, index) => (
                      <button 
                        key={index} 
                        className={styles.suggestion}
                        onClick={() => {
                           const isoDate = new Date(s.debut).toISOString().slice(0, 16);
                           setNouvelleDate(isoDate);
                           replanifier(isoDate);
                        }}
                      >
                        <span className={styles.suggestionDate}>{formaterDate(s.debut)}</span>
                        <span>Dureé: {s.dureeHeures}h</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {erreur && <p className={styles.erreur}>{erreur}</p>}

          {!afficherReplanification && (
            <div className={styles.actions}>
              <button 
                className={styles.boutonSupprimer} 
                onClick={supprimer}
                disabled={estEnTrainDeCharger}
              >
                Supprimer
              </button>
              <button 
                className={styles.boutonReplanifier}
                onClick={() => setAfficherReplanification(true)}
                disabled={estEnTrainDeCharger}
              >
                Replanifier
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
