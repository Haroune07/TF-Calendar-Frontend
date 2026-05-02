import { Form, redirect, useActionData, useNavigation, Link } from "react-router-dom";
import { api } from "../services/api";
import styles from "../styles/AuthPage.module.css";

export async function registerAction({ request }: any) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const nomComplet = formData.get("nomComplet");

  try {
    await api.register({ email, password, nomComplet });
    return redirect("/login?registered=true");
  } catch (error: any) {
    return { error: error.message };
  }
}

export default function RegisterPage() {
  const actionData = useActionData() as any;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Créer un compte</h1>
        
        <Form method="post" className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="nomComplet">Nom Complet</label>
            <input id="nomComplet" type="text" name="nomComplet" placeholder="John Doe" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="email">Courriel</label>
            <input id="email" type="email" name="email" placeholder="votre@email.com" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" name="password" placeholder="••••••••" required />
          </div>
          
          {actionData?.error && (
            <p className={styles.error}>{actionData.error}</p>
          )}

          <button type="submit" className={`btn-primary ${styles.button}`} disabled={isSubmitting}>
            {isSubmitting ? "Création en cours..." : "S'inscrire"}
          </button>
        </Form>
        
        <p className={styles.footer}>
          Déjà un compte ? <Link to="/login" className={styles.link}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
