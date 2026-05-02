import { Outlet, Link, Form } from "react-router-dom";
import styles from "./MainLayout.module.css";

export default function MainLayout() {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2 className={styles.appName}>MonApp</h2>
        <nav className={styles.navLinks}>
          <Link to="/" className={styles.link}>Calendrier</Link>
          <Link to="/profile" className={styles.link}>Mon Profil</Link>
          <Link to="/invitations" className={styles.link}>Invitations</Link>

          <Form action="/logout" method="post" style={{ marginTop: 'auto' }}>
            <button type="submit" className={styles.logoutBtn}>
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