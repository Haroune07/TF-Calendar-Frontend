import  styles from "./Navbar.module.css"
import { useRouteLoaderData } from "react-router-dom";
import type { UserDTO } from "../services/api";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useTheme } from "../services/ThemeContext";

export default function Navbar(){
    const { theme, toggleTheme } = useTheme();
    const user = useRouteLoaderData("root") as UserDTO;
    const [friends, setFriends] = useState<UserDTO[]>([])
    const [showFriends, setShowFriends] = useState(false);
    useEffect(() => {
        api.getFriends().then(data =>  {console.log(data);  setFriends(data)});
    }, []);
    return(
        <header className={styles.navbar}>
            <div>
                <h2 className={styles.title}>Bonjour, {user?.nomComplet || user?.email}</h2>
                    <p className={styles.subtitle}>
                        Voici votre Calendrier
                    </p>
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
                   

                <div className={styles.userBox}>
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