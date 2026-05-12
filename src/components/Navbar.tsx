import  styles from "./Navbar.module.css"
import { useNavigate, useRouteLoaderData } from "react-router-dom";
import type { UserDTO } from "../services/api";
import { useEffect, useState } from "react";
import { api, omnivoxApi } from "../services/api";
import { useTheme } from "../services/ThemeContext";

type ImportState = "idle" | "loading" | "success" | "error";


export default function Navbar({ onOmnivoxImported }: { onOmnivoxImported?: (activites: any[]) => void }){
    const { theme, toggleTheme } = useTheme();
    const user = useRouteLoaderData("root") as UserDTO;
    const [friends, setFriends] = useState<UserDTO[]>([])
    const [showFriends, setShowFriends] = useState(false);
    const navigate = useNavigate();
    const [importState, setImportState] = useState<ImportState>("idle");
    const [importMessage, setImportMessage] = useState<string | null>(null);

    useEffect(() => {
        api.getFriends().then(data =>  {console.log(data);  setFriends(data)});
    }, []);


    const handleOmnivoxImport = async () => {
        // no da redirects to profilee
        if (!user?.omnivoxDA) {
            navigate("/profile", { state: { omnivoxNotice: true } });
            return;
        }
 
        setImportState("loading");
        setImportMessage(null);
 
        try {
            const result = await omnivoxApi.importCours();
            const count = result.activites?.length ?? 0;
            const errors = result.erreurs?.length ?? 0;

            console.log("import result:", result);
 
            setImportState("success");
            setImportMessage(
                errors > 0
                    ? `${count} cours importés, ${errors} ignorés`
                    : `${count} cours importés avec succès`
            );
 
            if (onOmnivoxImported && result.activites?.length > 0) {
                onOmnivoxImported(result.activites);
            }
        } catch {
            setImportState("error");
            setImportMessage("Erreur lors de l'importation");
        } finally {
            setTimeout(() => {
                setImportState("idle");
                setImportMessage(null);
            }, 4000);
        }
    };


    return(
        <header className={styles.navbar}>
            <div>
                <h2 className={styles.title}>Bonjour, {user?.nomComplet || user?.email}</h2>
                    <p className={styles.subtitle}>
                        Voici votre Calendrier
                    </p>
            </div>

            <div className={styles.omnivoxWrapper}>
                    <button
                        className={`${styles.omnivoxBtn} ${importState === "loading" ? styles.loading : ""} ${importState === "success" ? styles.success : ""} ${importState === "error" ? styles.error : ""}`}
                        onClick={handleOmnivoxImport}
                        disabled={importState === "loading"}
                        title={user?.omnivoxDA ? "Importer mes cours Omnivox" : "Configurer Omnivox"}
                    >
                        {importState === "loading" ? "⏳" : importState === "success" ? "✓" : importState === "error" ? "✕" : "📚"}
                    </button>
                    {importMessage && (
                        <div className={`${styles.importToast} ${importState === "error" ? styles.toastError : styles.toastSuccess}`}>
                            {importMessage}
                        </div>
                    )}
                </div>
 

            <div className={styles.rightSection}>
                <button 
                  className={styles.themeToggle} 
                  onClick={toggleTheme}
                  title={`Passer en mode ${theme === 'light' ? 'sombre' : 'clair'}`}
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>

                <div className={styles.friendsContainer}>
                    <button className={styles.friendsBtn} onClick={() => setShowFriends(!showFriends)}>F</button>
                    {showFriends &&(
                        <div className={styles.dropdown}>
                            <h3 className={styles.dropdownTitle}>
                                Mes amis
                            </h3>

                            {friends.length === 0 ?(
                                    <p className={styles.emptyText}>Aucun ami</p>
                                ):(
                                    friends.map(friend => (
                                        <div key={friend.id} className={styles.friendItem}>
                                            <div className={styles.friendAvatar}>
                                                {friend.nomComplet?.charAt(0)}
                                            </div>
                                            <span>
                                                {friend.nomComplet}
                                            </span>
                                        </div>
                                    ))
                                )}
                        </div>
                )}
                </div>
                   

                <div className={styles.userBox}  onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
                    <div className={styles.avatar}>
                        {user?.nomComplet?.charAt(0) || user?.email?.charAt(0)}
                    </div>

                    <span className={styles.username}>
                        {user?.nomComplet || user?.email}
                    </span>
                </div>
            </div>
        </header>
    )
}