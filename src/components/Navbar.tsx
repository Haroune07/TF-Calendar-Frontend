import  styles from "./Navbar.module.css"
import { useRouteLoaderData } from "react-router-dom";
import type { UserDTO } from "../services/api";
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Navbar(){
    const user = useRouteLoaderData("root") as UserDTO;
    const [friends, setFriends] = useState<UserDTO[]>([])
    const [showFriends, setShowFriends] = useState(false);
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<UserDTO[]>([]);
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

                <div className={styles.friendsContainer}>
                    <button className={styles.friendsBtn} onClick={() => setShowFriends(!showFriends)}>F</button>
                    {showFriends &&(
                        <div className={styles.dropdown}>
                            <h3 className={styles.dropdownTitle}>
                                Mes amis
                            </h3>
                            <div className={styles.addFriendSection}>
                                <input type="text"
                                    placeholder="Rechercher un ami"
                                    value={search}
                                    onChange={ async (e) => {
                                         const value = e.target.value;
                                         setSearch(value);
                                         if (value.length < 2){
                                            setResults([]);
                                            return;
                                         }

                                         const users = await api.searchUsers(value);
                                         console.log(users);
                                         setResults(users);

                                    }
                                }className={styles.friendInput} 
                                />
                            </div>

                            {results.map(result => (

                                <div key={result.id} className={styles.searchResult}>

                                    <div className={styles.friendLeft}>

                                        <div className={styles.friendAvatar}>
                                            {result.nomComplet?.charAt(0)}
                                        </div>

                                        <span>
                                            {result.nomComplet}
                                        </span>

                                    </div>
                                    <button className={styles.addFriendBtn} onClick={
                                        async () =>{
                                            await api.createFriendInvitation(user.id , result.id);
                                            alert("invitation envoyée");

                                            setSearch("");
                                            setResults([]);

                                        }
                                    }
                                    >
                                         Ajouter
                                    </button>

                                </div>
                            ))}

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