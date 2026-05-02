import { Form, useRouteLoaderData, useActionData, useNavigation } from "react-router-dom";
import { api } from "../services/api";
import type { UserDTO } from "../services/api";

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
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>Profil Utilisateur</h2>
      <p><strong>Email :</strong> {user?.email}</p>
      
      {actionData?.success && <div style={{ color: "green" }}>{actionData.success}</div>}
      {actionData?.error && <div style={{ color: "red" }}>{actionData.error}</div>}

      <Form method="post" style={{ display: "flex", flexDirection: "column", maxWidth: "300px", gap: "1rem", marginTop: "1rem" }}>
        <input type="hidden" name="id" value={user.id} />
        <div>
          <label>Nom Complet :</label><br/>
          <input type="text" name="nomComplet" defaultValue={user.nomComplet} required />
        </div>
        <div>
          <label>DA Omnivox :</label><br/>
          <input type="number" name="omnivoxDA" defaultValue={user.omnivoxDA || ""} />
        </div>
        <button type="submit" disabled={state === "submitting"}>
          {state === "submitting" ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </Form>
    </div>
  );
}
