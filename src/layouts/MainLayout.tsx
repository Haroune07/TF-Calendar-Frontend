import { Outlet, Link, Form } from "react-router-dom";
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
          
          <Form action="/logout" method="post" style={{ marginTop: 'auto' }}>
            <button type="submit" className={styles.link} style={{ background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
              Se déconnecter
            </button>
          </Form>
        </nav>
      </aside>
      
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
