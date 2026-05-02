import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [nomComplet, setNomComplet] = useState(user?.nomComplet || "");
  const [omnivoxDA, setOmnivoxDA] = useState(user?.omnivoxDA || "");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const res = await fetch(`http://localhost:3000/users/${user.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomComplet,
          omnivoxDA: omnivoxDA ? parseInt(omnivoxDA.toString()) : null,
        }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        login(updatedUser); // Update AuthContext state
        setMessage("Profil mis à jour avec succès !");
      } else {
        setMessage("Erreur lors de la mise à jour.");
      }
    } catch (err) {
      setMessage("Erreur de connexion au serveur.");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <button onClick={() => navigate("/")} style={{ marginBottom: "1rem" }}>
        ← Retour à l'accueil
      </button>

      <h2>Profil Utilisateur</h2>
      <p><strong>Email :</strong> {user?.email}</p>
      
      {message && <div style={{ color: "green", marginBottom: "1rem" }}>{message}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", maxWidth: "300px", gap: "1rem" }}>
        <div>
          <label>Nom Complet :</label><br/>
          <input 
            type="text" 
            value={nomComplet} 
            onChange={(e) => setNomComplet(e.target.value)} 
          />
        </div>

        <div>
          <label>DA Omnivox :</label><br/>
          <input 
            type="number" 
            value={omnivoxDA} 
            onChange={(e) => setOmnivoxDA(e.target.value)} 
          />
        </div>

        <button type="submit" style={{ marginTop: "1rem" }}>Sauvegarder</button>
      </form>
    </div>
  );
}
