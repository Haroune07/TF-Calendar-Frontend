import { useEffect, useState } from "react";
import "../styles/calendar.css";
import { api, type ActiviteDTO, type EvenementDTO, type ProgrammableDTO, type UserDTO } from "../services/api";
import { useRouteLoaderData } from "react-router-dom";


const PRIORITYTOCOLOR: Record<string, string> = {
  URGENT: "#ef4444",
  IMPORTANCE_MOYENNE: "#2563eb",
  IMPORTANCE_BASSE: "#10b981",
};

function EventPill({ programmable, estVueSemaine }: { programmable: ProgrammableDTO, estVueSemaine?: boolean }) {
  const color =
    programmable.type === "activite"
      ? PRIORITYTOCOLOR[programmable.priorite ?? "IMPORTANCE_MOYENNE"]
      : "#8b5cf6";
 
  return (
    <div
      className={`event-pill ${estVueSemaine ? "vue-semaine" : ""}`}
      style={{ backgroundColor: color, height: estVueSemaine ? "100%" : "auto" }}
      title={`${programmable.nom}${programmable.description ? ` — ${programmable.description}` : ""}`}
    >
      <span className="event-name">{programmable.nom}</span>
      {estVueSemaine && programmable.description && (
        <p className="event-desc-court">{programmable.description}</p>
      )}
    </div>
  );
}

export default function Calendar({ view }: { view: "month" | "week" }) {
  const [date, setDate] = useState(new Date());
  const [activites, setActivites] = useState<ActiviteDTO[]>([]);
  const [evenements, setEvenements] = useState<EvenementDTO[]>([]);
  const user = useRouteLoaderData("root") as UserDTO;


  const today = new Date();
  const month = date.getMonth();
  const year = date.getFullYear();

  const weekDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  function getWeekDays() {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }

  const joursSemaine = getWeekDays();
  const titreHeader = view === "month"
    ? date.toLocaleDateString("fr-CA", { month: "long", year: "numeric" })
    : `${joursSemaine[0].toLocaleDateString("fr-CA", { day: "numeric", month: "short" })} - ${joursSemaine[6].toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" })}`;

  const allerPrecedent = () => {
    if (view === "month") {
      setDate(new Date(year, month - 1, 1));
    } else {
      // On recule de 7 jours pour la semaine
      const d = new Date(date);
      d.setDate(d.getDate() - 7);
      setDate(d);
    }
  };

  const allerSuivant = () => {
    if (view === "month") {
      setDate(new Date(year, month + 1, 1));
    } else {
      // On avance de 7 jours pour la semaine
      const d = new Date(date);
      d.setDate(d.getDate() + 7);
      setDate(d);
    }
  };

  const getDays = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysNumbers = [];

    for (let i = 1; i <= daysInMonth; i++) {
      daysNumbers.push(i);
    }

    return [
      ...Array(firstDay).fill(null),
      ...daysNumbers,
    ];
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isDateToday = (d: Date) => {
    return d.toDateString() === today.toDateString();
  };

  useEffect(() => {
    if (!user?.id) return;
    api.getProgrammableByUser(user.id).then(programmable => {
      console.log("raw data:", programmable);
      setActivites(programmable.filter(p => p.type == "activite"))
      setEvenements(programmable.filter(p => p.type == "evenement"))
    });
  }, [user?.id]);

  /**
   * Récupère les programmables pour une date précise
   * On compare juste l'année, le mois et le jour pour pas avoir de trouble avec les heures
   */
  function getProgrammablesParDate(d: Date): ProgrammableDTO[] {
    const tous = [...activites, ...evenements];
    return tous.filter((p) => {
      const debut = new Date(p.dateDepart);
      
      // On crée des dates "pures" (minuit) pour comparer
      const jourDebut = new Date(debut.getFullYear(), debut.getMonth(), debut.getDate());
      const jourCible = new Date(d.getFullYear(), d.getMonth(), d.getDate());

      if (p.type === "evenement" && p.dureeJours) {
        const jourFin = new Date(jourDebut);
        jourFin.setDate(jourFin.getDate() + p.dureeJours - 1);
        return jourCible >= jourDebut && jourCible <= jourFin;
      }
      
      return jourCible.getTime() === jourDebut.getTime();
    });
  }

  /**
   * Trouve les événements qui doivent s'afficher dans la barre du haut
   */
  function getEvenementsSemaine() {
    const debutSemaine = joursSemaine[0];
    const finSemaine = joursSemaine[6];

    return evenements.filter(e => {
      const debut = new Date(e.dateDepart);
      const fin = new Date(debut);
      fin.setDate(fin.getDate() + (e.dureeJours || 1) - 1);

      // Ça chevauche la semaine si :
      // debut <= finSemaine ET fin >= debutSemaine
      return debut <= finSemaine && fin >= debutSemaine;
    });
  }

  /**
   * Calcule où l'événement doit se placer dans la grille (colonne et étalement)
   */
  function calculerPositionEvenement(e: EvenementDTO) {
    const debutE = new Date(e.dateDepart);
    const debutSemaine = joursSemaine[0];
    
    // On normalise les dates à minuit pour un calcul de jours exact
    const d1 = new Date(debutE.getFullYear(), debutE.getMonth(), debutE.getDate());
    const d2 = new Date(debutSemaine.getFullYear(), debutSemaine.getMonth(), debutSemaine.getDate());
    
    let colDepart = Math.floor((d1.getTime() - d2.getTime()) / (24 * 3600 * 1000)) + 1;
    let span = e.dureeJours;

    // Si ça commence avant dimanche, on tronque le début
    if (colDepart < 1) {
      span += (colDepart - 1);
      colDepart = 1;
    }
    // Si ça finit après samedi, on tronque la fin
    if (colDepart + span > 8) {
      span = 8 - colDepart;
    }

    return { colDepart, span };
  }

  const days = getDays();

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={allerPrecedent}>‹</button>
        <h2>{titreHeader}</h2>
        <button onClick={allerSuivant}>›</button>
      </div>

      {view === "month" ? (
        <div className="calendar-grid">
          {weekDays.map((day) => (
            <div key={day} className="header-day">
              {day}
            </div>
          ))}

          {days.map((day, index) =>
            day ? (
              <div
                key={index}
                className={`day ${isToday(day) ? "today" : ""}`}
              >
                <span className="day-number">{day}</span>
                <div className="day-programmables">
                  {getProgrammablesParDate(new Date(year, month, day)).map((programmable) =>(
                    <EventPill key={programmable.id} programmable={programmable} estVueSemaine={false} />
                  ))}
                </div>
              </div>
            ) : (
              <div key={index}  className="day empty" />
            )
          )}
        </div>
      ) : (
        <div className="week-view-container">
          {/* En-tête des jours de la semaine */}
          <div className="week-header">
            <div className="time-gutter-header" />
            {joursSemaine.map((dayDate, i) => (
              <div key={i} className="week-day-column-header">
                <span className="week-day-label">{weekDays[dayDate.getDay()]}</span>
                <span className={`week-day-number ${isDateToday(dayDate) ? "today" : ""}`}>
                  {dayDate.getDate()}
                </span>
              </div>
            ))}
          </div>

          {/* Barre des événements multi-jours */}
          <div className="week-all-day-row">
            <div className="time-gutter-header" />
            <div className="all-day-events-grid">
              {getEvenementsSemaine().map(e => {
                const { colDepart, span } = calculerPositionEvenement(e);

                if (span <= 0) return null;

                return (
                  <div 
                    key={e.id}
                    className="all-day-event-wrapper"
                    style={{ gridColumn: `${colDepart} / span ${span}` }}
                  >
                    <EventPill programmable={e} estVueSemaine={true} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grille horaire */}
          <div className="week-grid">
            <div className="time-gutter">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="hour-label">
                  {i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`}
                </div>
              ))}
            </div>
            {getWeekDays().map((dayDate, i) => (
              <div key={i} className="week-day-column">
                {Array.from({ length: 24 }).map((_, h) => (
                  <div key={h} className="time-slot" />
                ))}
                {getProgrammablesParDate(dayDate).filter(p => p.type === "activite").map((p) => {
                  const start = new Date(p.dateDepart);
                  const hour = start.getHours();
                  const minutes = start.getMinutes();
                  // 60px par heure, donc on calcule le top
                  const top = hour * 60 + (minutes / 60) * 60;
                  
                  // On calcule la hauteur : activités utilisent dureeHeures, événements on met 30px par défaut
                  const hauteur = p.type === "activite" ? p.dureeHeures * 60 : 30;

                  return (
                    <div 
                      key={p.id} 
                      className="week-event-wrapper"
                      style={{ top: `${top}px`, height: `${hauteur}px` }}
                    >
                      <EventPill programmable={p} estVueSemaine={true} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}



      <div className="calendar-legend">
        <span className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: "#ef4444" }} />
          Urgent
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: "#2563eb" }} />
          Activité
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: "#10b981" }} />
          Basse priorité
        </span>
        <span className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: "#8b5cf6" }} />
          Événement
        </span>
      </div>
    </div>
  );
}