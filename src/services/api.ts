const API_URL = "http://localhost:3000";

export const api = {
  // Skeleton for Phase 1
  async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    // This will be implemented in Phase 2
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Erreur de connexion à l'API");
    }

    return response.json();
  },
};
