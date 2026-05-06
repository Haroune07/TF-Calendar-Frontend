import { Form, useRouteLoaderData, useActionData, useNavigation } from "react-router-dom";
import { api } from "../services/api";
import type { UserDTO } from "../services/api";
import styles from "../styles/ProfilePage.module.css";

export async function profileAction({ request }: any) {
  const formData = await request.formData();
  const id = formData.get("id");
  const section = formData.get("section"); // pour savoir quel formulaire a été soumis

  try {
    if (section === "infos") {
      // Mise à jour des infos de base
      const nomComplet = formData.get("nomComplet") as string;
      if (!nomComplet) return { error: "Le nom complet est requis." };

      await api.updateProfile(Number(id), { nomComplet, email: formData.get("email") as string });
      return { success: "Informations mises à jour !" };

    } else if (section === "password") {
      // Changement de mot de passe
      const password = formData.get("password") as string;
      const confirm = formData.get("confirmPassword") as string;
      if (!password) return { error: "Le mot de passe est requis." };
      if (password !== confirm) return { error: "Les mots de passe ne correspondent pas." };

      await api.updateProfile(Number(id), { password } as any);
      return { success: "Mot de passe mis à jour !" };

    } else if (section === "omnivox") {
      // Mise à jour des infos Omnivox
      const omnivoxDA = formData.get("omnivoxDA") as string;
      const omnivoxPassword = formData.get("omnivoxPassword") as string;

      const data: any = {
        omnivoxDA: omnivoxDA ? parseInt(omnivoxDA, 10) : null,
      };
      if (omnivoxPassword) data.omnivoxPassword = omnivoxPassword;

      await api.updateProfile(Number(id), data);
      return { success: "Informations Omnivox mises à jour !" };
    }

    return { error: "Section inconnue." };
  } catch (error: any) {
    return { error: error.message };
  }
}

export default function ProfilePage() {
  const user = useRouteLoaderData("root") as UserDTO;
  const actionData = useActionData() as any;
  const { state } = useNavigation();
  const estEnCours = state === "submitting";

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Mon Profil</h2>

      {/* Message de retour global */}
      {actionData?.success && <div className={styles.success}>{actionData.success}</div>}
      {actionData?.error && <div className={styles.error}>{actionData.error}</div>}

      {/* Section : Informations générales */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Informations générales</h3>
        <Form method="post" className={styles.form}>
          <input type="hidden" name="id" value={user.id} />
          <input type="hidden" name="section" value="infos" />
          <div className={styles.field}>
            <label htmlFor="nomComplet">Nom complet</label>
            <input id="nomComplet" type="text" name="nomComplet" defaultValue={user.nomComplet} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="email">Courriel</label>
            <input id="email" type="email" name="email" defaultValue={user.email} required />
          </div>
          <div className={styles.buttonContainer}>
            <button type="submit" className="btn-success" disabled={estEnCours}>
              {estEnCours ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </Form>
      </section>

      {/* Section : Mot de passe */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Changer le mot de passe</h3>
        <Form method="post" className={styles.form}>
          <input type="hidden" name="id" value={user.id} />
          <input type="hidden" name="section" value="password" />
          <div className={styles.field}>
            <label htmlFor="password">Nouveau mot de passe</label>
            <input id="password" type="password" name="password" required />
          </div>
          <div className={styles.field}>
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input id="confirmPassword" type="password" name="confirmPassword" required />
          </div>
          <div className={styles.buttonContainer}>
            <button type="submit" className="btn-success" disabled={estEnCours}>
              {estEnCours ? "Sauvegarde..." : "Changer"}
            </button>
          </div>
        </Form>
      </section>

      {/* Section : Omnivox */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Compte Omnivox</h3>
        <Form method="post" className={styles.form}>
          <input type="hidden" name="id" value={user.id} />
          <input type="hidden" name="section" value="omnivox" />
          <div className={styles.field}>
            <label htmlFor="omnivoxDA">DA Omnivox</label>
            <input id="omnivoxDA" type="number" name="omnivoxDA" defaultValue={user.omnivoxDA || ""} />
          </div>
          <div className={styles.field}>
            <label htmlFor="omnivoxPassword">Mot de passe Omnivox</label>
            <input id="omnivoxPassword" type="password" name="omnivoxPassword" placeholder="Laisser vide pour ne pas changer" />
          </div>
          <div className={styles.buttonContainer}>
            <button type="submit" className="btn-success" disabled={estEnCours}>
              {estEnCours ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </Form>
      </section>
    </div>
  );
}
