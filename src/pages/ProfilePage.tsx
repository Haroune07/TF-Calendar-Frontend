import { Form, useRouteLoaderData, useActionData, useNavigation } from "react-router-dom";
import { api } from "../services/api";
import type { UserDTO } from "../services/api";
import styles from "../styles/ProfilePage.module.css";

export async function profileAction({ request }: any) {
  const formData = await request.formData();
  const id = formData.get("id");
  const nomComplet = formData.get("nomComplet");
  const omnivoxDA = formData.get("omnivoxDA");

  if (!nomComplet) return { error: "Le nom complet est requis." };

  try {
    const data = {
      nomComplet,
      omnivoxDA: omnivoxDA ? parseInt(omnivoxDA, 10) : null,
    };
    await api.updateProfile(Number(id), data);
    return { success: "Profil mis à jour avec succès !" };
  } catch (error: any) {
    return { error: error.message };
  }
}

export default function ProfilePage() {
  const user = useRouteLoaderData("root") as UserDTO;
  const actionData = useActionData() as any;
  const { state } = useNavigation();

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Profil Utilisateur</h2>
      <p className={styles.subtitle}><strong>Email :</strong> {user?.email}</p>
      
      {actionData?.success && <div className={styles.success}>{actionData.success}</div>}
      {actionData?.error && <div className={styles.error}>{actionData.error}</div>}

      <Form method="post" className={styles.form}>
        <input type="hidden" name="id" value={user.id} />
        <div className={styles.field}>
          <label htmlFor="nomComplet">Nom Complet</label>
          <input id="nomComplet" type="text" name="nomComplet" defaultValue={user.nomComplet} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="omnivoxDA">DA Omnivox</label>
          <input id="omnivoxDA" type="number" name="omnivoxDA" defaultValue={user.omnivoxDA || ""} />
        </div>
        <div className={styles.buttonContainer}>
          <button type="submit" className="btn-success" disabled={state === "submitting"}>
            {state === "submitting" ? "Sauvegarde en cours..." : "Sauvegarder"}
          </button>
        </div>
      </Form>
    </div>
  );
}
