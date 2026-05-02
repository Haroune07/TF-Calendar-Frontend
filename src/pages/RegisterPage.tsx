import { Form, redirect, useActionData, useNavigation, Link } from "react-router-dom";
import { api } from "../services/api";

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
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Créer un compte</h2>
      
      {actionData?.error && (
        <div style={{ color: 'red', marginBottom: '15px' }}>
          {actionData.error}
        </div>
      )}

      <Form method="post" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label>Nom Complet :</label><br/>
          <input type="text" name="nomComplet" required style={{ width: '100%' }} />
        </div>
        <div>
          <label>Email :</label><br/>
          <input type="email" name="email" required style={{ width: '100%' }} />
        </div>
        <div>
          <label>Mot de passe :</label><br/>
          <input type="password" name="password" required style={{ width: '100%' }} />
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Création en cours..." : "S'inscrire"}
        </button>
      </Form>
      
      <p style={{ marginTop: '20px' }}>
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}
