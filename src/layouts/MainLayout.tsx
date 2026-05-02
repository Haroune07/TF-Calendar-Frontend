import { Outlet, Link } from "react-router-dom";
import styles from "./MainLayout.module.css";

export default function MainLayout() {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2>MonApp</h2>
        <nav className={styles.navLinks}>
          <Link to="/" className={styles.link}>Calendrier</Link>
          <Link to="/profile" className={styles.link}>Mon Profil</Link>
          <Link to="#" className={styles.link}>Mes Tâches</Link>
          <Link to="#" className={styles.link}>Paramètres</Link>
          {/* We will add a real logout button or link in Phase 2/3 */}
          <Link to="/logout" className={styles.link} style={{ marginTop: 'auto' }}>
            Se déconnecter
          </Link>
        </nav>
      </aside>
      
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
