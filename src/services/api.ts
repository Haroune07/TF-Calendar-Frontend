const API_URL = import.meta.env.VITE_API_URL || "";

export type UserDTO = {
  id: number;
  email: string;
  nomComplet: string;
  omnivoxDA?: number | null;
  calendrierId?: number | null;
};

// export type ProgrammableDTO = {
//   id: number;
//   nom: string;
//   description?: string;
//   dateDepart: string;
//   userId: number;
//   calendrierId?: number | null;
//   type: "activite" | "evenement";
//   dureeHeures?: number;
//   priorite?: "URGENT" | "IMPORTANCE_MOYENNE" | "IMPORTANCE_BASSE";
//   dureeJours?: number;
// };

export type InvitationDTO = {
  id: number;
  senderId: number;
  invitedUserId: number;
  statut: string;
  type: string;
  sentAt: string;
  sender?: {
    id: number;
    nomComplet: string;
  }
  invitedUser?: {
    id: number;
    nomComplet: string;
  }
};

export type ActiviteDTO = {
  id: number;
  nom: string;
  description?: string;
  dateDepart: string;
  userId: number;
  calendrierId?: number | null;
  type: "activite";
  dureeHeures: number;       
  priorite: "URGENT" | "IMPORTANCE_MOYENNE" | "IMPORTANCE_BASSE";
};

export type EvenementDTO = {
  id: number;
  nom: string;
  description?: string;
  dateDepart: string;
  userId: number;
  calendrierId?: number | null;
  type: "evenement";
  dureeJours: number;     
};

export type ProgrammableDTO = ActiviteDTO | EvenementDTO;



export type AuthCredentials = { email: string; password?: string; nomComplet?: string };

async function parseError(response: Response): Promise<Error & { isConflict?: boolean; conflictMessage?: string }> {
  let msg = "Erreur de connexion à l'API";
  let isConflict = false;
  let conflictMessage: string | undefined;
  try {
    const errorData = await response.json();
    msg = errorData.message || msg;
    if (response.status === 409) {
      isConflict = true;
      conflictMessage = errorData.message;
    }
  } catch {
    // Ignorer si la réponse n'est pas du JSON valide
  }
  const err = new Error(msg) as Error & { isConflict?: boolean; conflictMessage?: string };
  err.isConflict = isConflict;
  err.conflictMessage = conflictMessage;
  return err;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    throw await parseError(response);
  }
  if (response.status === 204) return null;
  try {
    return await response.json();
  } catch {
    return null; // Gérer les réponses 200 sans corps JSON
  }
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}/api${endpoint}`;
  const response = await fetch(url, { ...options, credentials: "include" });
  return handleResponse(response);
}

export const api = {
  async login(credentials: AuthCredentials): Promise<UserDTO> {
    return fetchAPI("/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  },

  async register(data: AuthCredentials): Promise<UserDTO> {
    return fetchAPI("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async getCurrentUser(): Promise<UserDTO> {
    return fetchAPI("/auth/whoami");
  },

  async logout(): Promise<void> {
    return fetchAPI("/auth/signout", { method: "POST" });
  },

  async updateProfile(id: number, data: Partial<UserDTO>): Promise<UserDTO> {
    return fetchAPI(`/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async getProgrammableByUser(userId: number): Promise<ProgrammableDTO[]> {
    return fetchAPI(`/programmable/user/${userId}`);
  },

  async getReceivedInvitations() {
    return fetchAPI("/invitation/received");
  },
  
  async getSentInvitations() {
    return fetchAPI("/invitation/sent");
  },
  
  async acceptInvitation(id: number) {
    return fetchAPI(`/invitation/${id}/accept`, {
      method: "PATCH",
    });
  },
  
  async refuseInvitation(id: number) {
    return fetchAPI(`/invitation/${id}/refuse`, {
      method: "PATCH",
    });
  },

  async getFriends(): Promise<UserDTO[]>{
    return fetchAPI("/users/friends")
  },

  async createFriendInvitation(senderId : number,invitedUserId: number){
    return fetchAPI("/invitation",{
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        type: "AMI",
        senderId,
        invitedUserId,
        amiId: invitedUserId,
      }),
    })
  },
  
  async createActivityInvitation(
    senderId: number,
    invitedUserId: number,
    activiteGroupeId: number
  ){
    return fetchAPI("/invitation",{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "ACTIVITE", senderId, invitedUserId, activiteGroupeId}),
    });
  },

  async searchUsers(query: string): Promise<UserDTO[]>{
    return fetchAPI(`/users/search?query=${query}`);
  },

};


export type CreateActivitePayload = {
  nom: string;
  description?: string;
  dateDepart: string;
  dureeHeures: number;
  priorite: "URGENT" | "IMPORTANCE_MOYENNE" | "IMPORTANCE_BASSE";
  forceCreate?: boolean;
};
 
export type CreateEvenementPayload = {
  nom: string;
  description?: string;
  dateDepart: string;
  dureeJours: number;
};

export type ConflitInfoDTO = {
  activiteIdA: number;
  nomA: string;
  debutA: string;
  finA: string;
  activiteIdB: number;
  nomB: string;
  debutB: string;
  finB: string;
  chevauchementMinutes: number;
};

export type CreneauDisponibleDTO = {
  debut: string;
  fin: string;
  dureeHeures: number;
};

export type ReplanifierReponseDTO = {
  activite: ActiviteDTO;
  conflitDetecte: boolean;
  suggestions: CreneauDisponibleDTO[];
};

export const programmableApi = {
  async createActivite(data: CreateActivitePayload): Promise<ActiviteDTO> {
    return fetchAPI("/programmable/activite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
 
  async createEvenement(data: CreateEvenementPayload): Promise<EvenementDTO> {
    return fetchAPI("/programmable/evenement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async getConflits(): Promise<ConflitInfoDTO[]> {
    return fetchAPI("/programmable/conflits");
  },

  async getCreneauxDisponibles(dateDebut: string, dateFin: string, dureeHeures: number): Promise<CreneauDisponibleDTO[]> {
    const params = new URLSearchParams({
      dateDebut,
      dateFin,
      dureeHeures: dureeHeures.toString(),
    });
    return fetchAPI(`/programmable/creneaux-disponibles?${params.toString()}`);
  },

  async replanifierActivite(id: number, nouvelleDate: string): Promise<ReplanifierReponseDTO> {
    return fetchAPI(`/programmable/activite/${id}/replanifier`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nouvelleDateDepart: nouvelleDate }),
    });
  },

  async deleteProgrammable(id: number): Promise<void> {
    return fetchAPI(`/programmable/${id}`, {
      method: "DELETE",
    });
  },

  async updateEvenement(id: number, data: Partial<CreateEvenementPayload>): Promise<EvenementDTO> {
    return fetchAPI(`/programmable/evenement/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async updateActivite(id: number, data: Partial<CreateActivitePayload>): Promise<ActiviteDTO> {
    return fetchAPI(`/programmable/activite/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }
};

