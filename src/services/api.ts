const API_URL = "http://localhost:3000";

export type UserDTO = {
  id: number;
  email: string;
  nomComplet: string;
  omnivoxDA?: number | null;
  calendrierId?: number;
};

export type AuthCredentials = { email: string; password?: string; nomComplet?: string };

async function parseError(response: Response): Promise<Error> {
  let msg = "Erreur de connexion à l'API";
  try {
    const errorData = await response.json();
    msg = errorData.message || msg;
  } catch {
    // Ignorer si la réponse n'est pas du JSON valide
  }
  return new Error(msg);
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
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, { ...options, credentials: "include" });
  return handleResponse(response);
}

export const api = {
  async login(credentials: AuthCredentials): Promise<UserDTO> {
    return fetchAPI("/users/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  },

  async register(data: AuthCredentials): Promise<UserDTO> {
    return fetchAPI("/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  async getCurrentUser(): Promise<UserDTO> {
    return fetchAPI("/users/me");
  },

  async logout(): Promise<void> {
    return fetchAPI("/users/signout", { method: "POST" });
  },

  async updateProfile(id: number, data: Partial<UserDTO>): Promise<UserDTO> {
    return fetchAPI(`/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }
};
