import { useState } from "react";
import styles from "../styles/ContactPage.module.css";

export default function ContactPage() {
  const [nom, setNom] = useState("");
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");
  const [envoye, setEnvoye] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const destinataire = "equipe@tf-calendar.ca";
    const sujetEncode = encodeURIComponent(`[TF-Calendar] ${sujet}`);
    const corpsEncode = encodeURIComponent(
      `Nom : ${nom}\n\n${message}`
    );

    window.location.href = `mailto:${destinataire}?subject=${sujetEncode}&body=${corpsEncode}`;
    setEnvoye(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="3"/>
              <path d="M2 7l10 7 10-7"/>
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>Nous contacter</h1>
            <p className={styles.subtitle}>Notre équipe vous répondra dans les plus brefs délais.</p>
          </div>
        </div>

        {envoye ? (
          <div className={styles.confirmation}>
            <div className={styles.confirmIcon}>✓</div>
            <h2 className={styles.confirmTitle}>Message prêt à envoyer</h2>
            <p className={styles.confirmText}>
              Votre application de messagerie s'est ouverte avec votre message pré-rempli.
              Envoyez-le depuis votre client mail pour nous contacter.
            </p>
            <button className={styles.resetBtn} onClick={() => setEnvoye(false)}>
              Nouveau message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="nom">Votre nom</label>
              <input
                id="nom"
                type="text"
                value={nom}
                onChange={e => setNom(e.target.value)}
                placeholder="Jean Tremblay"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="sujet">Sujet</label>
              <input
                id="sujet"
                type="text"
                value={sujet}
                onChange={e => setSujet(e.target.value)}
                placeholder="Question, bug, suggestion..."
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Décrivez votre question ou problème..."
                rows={6}
                required
              />
            </div>

            <div className={styles.footer}>
              <p className={styles.note}>
                Votre client mail s'ouvrira avec le message pré-rempli.
              </p>
              <button type="submit" className={styles.submitBtn}>
                Ouvrir dans mon client mail
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
                </svg>
              </button>
            </div>
          </form>
        )}
      </div>

      <div className={styles.altContact}>
        <p>Vous pouvez aussi nous écrire directement à</p>
        <a href="mailto:equipe@tf-calendar.ca" className={styles.email}>equipe@tf-calendar.ca</a>
      </div>
    </div>
  );
}