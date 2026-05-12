import { useState } from "react";
import { programmableApi, type CreateActivitePayload, type CreateEvenementPayload, type ProgrammableDTO } from "../services/api";
import styles from "../styles/CreateProgrammableModal.module.css";
import { useRouteLoaderData } from "react-router-dom";
import {api, type UserDTO} from "../services/api";
import { useEffect } from "react";

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
    const user = useRouteLoaderData("root") as UserDTO;
    const [friends, setFriends] = useState<UserDTO[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<number[]>([]);

    useEffect(() => {
        api.getFriends().then(setFriends);
    }, []);

    const handleSubmit = async (event : React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {

            let created : ProgrammableDTO;

            if (type === "activite"){

                const activite = await programmableApi.createActivite({
                    nom,
                    description: description || undefined,
                    dateDepart,
                    dureeHeures,
                    priorite,                    
                });
                for(const friendId of selectedFriends){
                    await api.createActivityInvitation(user.id, friendId, activite.id)
                }
                created = activite;
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
            setError(err.message ?? "Une erreur est survenue");
            } finally {
            setLoading(false);

        }


    }

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
                <div className={styles.inviteSection}>
                    <h3 className={styles.inviteTitle}>Inviter des amis</h3>

                    {friends.map(friend => (

                        <div  key={friend.id} className={styles.friendInviteItem}>

                            <div className={styles.friendInviteLeft}>

                                <div className={styles.friendInviteAvatar}>
                                        {friend.nomComplet?.charAt(0)}
                                </div>

                                <span>
                                    {friend.nomComplet}
                                </span>

                            </div>
                                <input type="checkbox"
                                    checked={selectedFriends.includes(friend.id)}
                                    onChange={(e) => {
                                        if (e.target.checked){
                                            setSelectedFriends([...selectedFriends, friend.id]);
                                        }else{
                                            setSelectedFriends( selectedFriends.filter(id => id !== friend.id));
                                        }
                                    }} 
                                />
                        </div>
                    ))}
                </div>

                 
                    {error && <p className={styles.error}>{error}</p>}
            
                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            Annuler
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? "Création..." : "Créer"}
                        </button>
                    </div>
                </form>

            </div>

        </>

    );

}