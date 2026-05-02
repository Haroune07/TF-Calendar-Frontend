import { Form, redirect, useActionData, useNavigation, Link } from "react-router-dom";
import { api } from "../services/api";
import styles from "../styles/AuthPage.module.css";

export async function loginAction({ request }: any) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await api.login({ email, password });
    return redirect("/");
  } catch (error: any) {
    return { error: error.message };
  }
}

export default function LoginPage() {
  const actionData = useActionData() as any;
  const navigation = useNavigation();
  const loading = navigation.state === "submitting";

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Connexion</h1>

        <Form method="post" className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">Courriel</label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>

          {actionData?.error && <p className={styles.error}>{actionData.error}</p>}

          <button type="submit" className={`btn-primary ${styles.button}`} disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </Form>
        <p className={styles.footer}>
          Pas encore de compte ? <Link to="/register" className={styles.link}>Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
