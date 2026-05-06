import { useState } from "react";
import { programmableApi, type CreateActivitePayload, type CreateEvenementPayload, type ProgrammableDTO } from "../services/api";
import styles from "../styles/CreateProgrammableModal.module.css";


type Props = {
  defaultDate?: string; // pre-fill date when clicking a day
  onClose: () => void;
  onCreated: (item: ProgrammableDTO) => void;
};

type FormType = "activite" | "evenement";

export default function CreateProgrammable({ defaultDate, onClose, onCreated }: Props){

    const today = new Date().toISOString().slice(0,16);

    const [type, setType] = useState<FormType>("activite");
    const [nom, setNom] = useState("")
    const [description, setDescription] = useState("");
    const [dateDepart, setDateDepart] = useState(defaultDate ?? today);
    const [dureeHeures, setDureeHeures] = useState(1);
    const [dureeJours, setDureeJours] = useState(1);
    const [priorite, setPriorite] = useState<CreateActivitePayload["priorite"]>("IMPORTANCE_MOYENNE");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Conflict state: when the API returns a 409, we store the conflict message
    // and wait for the user to confirm they want to force-create
    const [conflitMessage, setConflitMessage] = useState<string | null>(null);

    const soumettre = async (forceCreate: boolean) => {
        setError(null);
        setLoading(true);

        try {
            let created: ProgrammableDTO;

            if (type === "activite") {
                created = await programmableApi.createActivite({
                    nom,
                    description: description || undefined,
                    dateDepart,
                    dureeHeures,
                    priorite,
                    forceCreate,
                });
            } else {
                created = await programmableApi.createEvenement({
                    nom,
                    description: description || undefined,
                    dateDepart,
                    dureeJours,
                });
            }

            onCreated(created);
            onClose();
        } catch (err: any) {
            if (err.isConflict) {
                // Parse the conflicting activity name from the backend message
                // Message format: "Chevauchement avec l'activité "X" (début : ...)"
                setConflitMessage(err.conflictMessage ?? err.message);
            } else {
                setError(err.message ?? "Une erreur est survenue");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setConflitMessage(null);
        await soumettre(false);
    };

    const handleForceCreate = async () => {
        setConflitMessage(null);
        await soumettre(true);
    };

    return (

        <>
            <div className={styles.backdrop} onClick={onClose}></div>

            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Nouvel élément</h2>
                    <button className={styles.closeBtn} onClick={onClose} >✕</button>
                </div>

                <div className={styles.typeToggle}>
                    <button
                        type="button"
                        className={`${styles.toggleBtn} ${type === "activite" ? styles.active : ""}`}
                        onClick={() => setType("activite")}
                    >
                        Activité
                    </button>
                    <button
                        type="button"
                        className={`${styles.toggleBtn} ${type === "evenement" ? styles.active : ""}`}
                        onClick={() => setType("evenement")}
                    >
                        Événement
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.field}>
                    <label htmlFor="nom">Nom *</label>
                    <input
                        id="nom"
                        type="text"
                        value={nom}
                        onChange={e => setNom(e.target.value)}
                        placeholder={type === "activite" ? "Ex: Examen final" : "Ex: Anniversaire"}
                        required
                    />
                </div>                

                <div className={styles.field}>
                    <label htmlFor="description">Description *</label>
                    <input
                        id="description"
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </div>     

                <div className={styles.field}>
                    <label htmlFor="dateDepart">
                        {type === "activite" ? "Date et heure de début *" : "Date de début *"}
                    </label>
                    <input
                        id="dateDepart"
                        type={type === "activite" ? "datetime-local" : "date"}
                        value={type === "activite" ? dateDepart : dateDepart.slice(0, 10)}
                        onChange={e => setDateDepart(e.target.value)}
                        required
                    />
                </div>

                {type === "activite" ? (
                    <>
                    <div className={styles.field}>
                        <label htmlFor="dureeHeures">Durée (heures) *</label>
                        <input
                            id="dureeHeures"
                            type="number"
                            min={0.5}
                            step={0.5}
                            value={dureeHeures}
                            onChange={e => setDureeHeures(parseFloat(e.target.value))}
                            required
                        />
                    </div>
        
                    <div className={styles.field}>
                        <label htmlFor="priorite">Priorité</label>
                        <select
                            id="priorite"
                            value={priorite}
                            onChange={e => setPriorite(e.target.value as CreateActivitePayload["priorite"])}
                        >
                        <option value="IMPORTANCE_BASSE">Basse</option>
                        <option value="IMPORTANCE_MOYENNE">Moyenne</option>
                        <option value="URGENT">Urgent</option>
                        </select>
                    </div>
                    </>
                ) : (
                    <div className={styles.field}>
                    <label htmlFor="dureeJours">Durée (jours) *</label>
                    <input
                        id="dureeJours"
                        type="number"
                        min={1}
                        step={1}
                        value={dureeJours}
                        onChange={e => setDureeJours(parseInt(e.target.value))}
                        required
                    />
                    </div>
                )}

                {/* Conflict warning — shown instead of a generic error */}
                {conflitMessage && (
                    <div className={styles.conflitWarning}>
                        <span className={styles.conflitIcon}>⚠️</span>
                        <div className={styles.conflitBody}>
                            <p className={styles.conflitText}>{conflitMessage}</p>
                            <p className={styles.conflitSubtext}>Voulez-vous quand même créer cette activité en chevauchement?</p>
                        </div>
                        <div className={styles.conflitActions}>
                            <button
                                type="button"
                                className={styles.conflitCancelBtn}
                                onClick={() => setConflitMessage(null)}
                                disabled={loading}
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                className={styles.conflitConfirmBtn}
                                onClick={handleForceCreate}
                                disabled={loading}
                            >
                                {loading ? "Création..." : "Quand même créer"}
                            </button>
                        </div>
                    </div>
                )}

                    {error && <p className={styles.error}>{error}</p>}
            
                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading || !!conflitMessage}>
                            {loading ? "Création..." : "Créer"}
                        </button>
                    </div>
                </form>

            </div>

        </>

    );

}