import { Form, useRouteLoaderData, useActionData, useNavigation, useLoaderData } from "react-router-dom";
import { api } from "../services/api";
import type { UserDTO, InvitationDTO } from "../services/api";
import styles from "../styles/HomePage.module.css";


export async function invitationsLoader() {
  return await api.getReceivedInvitations();
}

export async function invitationAction({ request }: any) {
  const formData = await request.formData();
  const id = Number(formData.get("id"));
  const actionType = formData.get("actionType");
  
  if (isNaN(id)){
    return {error: "Invitation invalide"};
  }

  try {
    if (actionType === "accept") {
      await api.acceptInvitation(id);
      return {success: "Invitation acceptée"};
    }

    if (actionType === "refuse") {
      await api.refuseInvitation(id);
      return {success: "Invitation refusée"};
    }

    return null;
  } catch (error: any) {
    return { error: error.message };
  }
}

export default function InvitationsPage() {
  const user = useRouteLoaderData("root") as UserDTO;
  const actionData = useActionData() as any;
  const { state } = useNavigation();

  
  const data = useLoaderData() as InvitationDTO[];
  const invitations = data.filter(inv => inv.statut === "PENDING");
     
  return (
    
    <div className={styles.page}>
        <h2 className={styles.title}>
          Invitations de {user?.nomComplet || user?.email}
        </h2>
        
        {actionData?.success && (<div  className={styles.success }>{actionData.success}</div>)}
        {actionData?.error && (<div className={styles.error }>{actionData.error}</div>)}

        {invitations.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>
            Vous n'avez aucune invitation pour le moment.
          </p>
        ) : (
          <div className={styles.calendarWrapper}>
            {invitations.map((inv => {
              const label = 
              inv.type === "AMI"
              ? "Invitation d'ami"
              : "Invitation à une activité";
              return(
                <Form key={inv.id} method="post" style={{ marginBottom: "15px" }}>
              <input type="hidden" name="id" value={inv.id} />

              <div>
                <strong>{label}</strong>
              </div>

              <div>
                De : {inv.sender?.nomComplet}
              </div>

              <div style={{fontSize: "12px", color: "gray"}}>
                Envoyée le : {new Date(inv.sentAt).toLocaleString("fr-CA")}
              </div>

              <button
                type="submit"
                name="actionType"
                value="accept"
                className="btn-success"
                disabled={state === "submitting"}
              >
                {state === "submitting" ? "En cours..." : "Accepter"}
              </button>

              <button
                type="submit"
                name="actionType"
                value="refuse"
                style={{ marginLeft: "10px" }}
                disabled={state === "submitting"}
              >
                Refuser
              </button>
            </Form>
          );
        }))}
      </div>
    )}
  </div>
  );
}
