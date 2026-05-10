import { Link } from "react-router-dom";
import "../styles/NotFound.css";
import { useMemo } from "react";

const MESSAGES = [
  "Il semble que vous vous soyez aventuré dans un coin du calendrier qui n'existe pas encore.",
  "404 : Même le temps a ses limites. Cette page n'existe pas !",
  "Oups ! Cette date a été effacée de l'histoire (ou vous avez juste fait une faute de frappe).",
  "Perdu dans les méandres du temps ? Cette page est restée bloquée en 1999."
];

export default function NotFoundPage() {
  const message = useMemo(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)], []);

  return (
    <div className="not-found-container">
      <div className="not-found-illustration">404</div>
      <h1 className="not-found-title">Oups ! Page introuvable</h1>
      <p className="not-found-text">{message}</p>
      <Link to="/" className="back-home-btn">
        Retour à l'accueil
      </Link>
    </div>
  );
}
