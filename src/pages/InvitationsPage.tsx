import { useRouteLoaderData } from "react-router-dom";
import type { UserDTO } from "../services/api";
import styles from "../styles/HomePage.module.css"; // Reuse sleek styling

export default function InvitationsPage() {
  const user = useRouteLoaderData("root") as UserDTO;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Invitations de {user?.nomComplet || user?.email}</h1>
      </header>

      <div className={styles.calendarWrapper}>
        <p style={{ color: 'var(--color-text-muted)' }}>Vous n'avez aucune invitation pour le moment.</p>
      </div>
    </div>
  );
}
