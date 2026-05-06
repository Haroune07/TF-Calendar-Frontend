import { useEffect, useState } from "react";
import "../styles/calendar.css";
import { api, type ActiviteDTO, type EvenementDTO, type ProgrammableDTO, type UserDTO } from "../services/api";
import { useRouteLoaderData } from "react-router-dom";
import CreateProgrammable from "./CreateProgrammable";


const PRIORITYTOCOLOR: Record<string, string> = {
  URGENT: "#ef4444",
  IMPORTANCE_MOYENNE: "#2563eb",
  IMPORTANCE_BASSE: "#10b981",
};

function EventPill({ programmable, estVueSemaine }: { programmable: ProgrammableDTO, estVueSemaine?: boolean }) {
  const color =
    programmable.type === "activite"
      ? PRIORITYTOCOLOR[programmable.priorite ?? "IMPORTANCE_MOYENNE"]
      : `hsl(${(programmable.nom.length * 40) % 360}, 60%, 50%)`; // Couleur unique basée sur le nom
 
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
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
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
      setActivites(programmable.filter(p => p.type == "activite"))
      setEvenements(programmable.filter(p => p.type == "evenement"))
    });
  }, [user?.id]);




  const handleCreated = (item: ProgrammableDTO) => {
    if (item.type === "activite"){
      setActivites(prev => [...prev, item as ActiviteDTO])
    }
    else {
      setEvenements(prev => [...prev, item as EvenementDTO])
    }
  }

  const handleDayClicked = (day : number) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateString = `${year}-${pad(month + 1)}-${pad(day)}T08:00`;
    setSelectedDate(dateString)
    setShowModal(true)
  }


  /**
   * Récupère les programmables pour une date précise
   * On compare juste l'année, le mois et le jour pour pas avoir de trouble avec les heures
   */
  /**
   * Parse la partie date (YYYY-MM-DD) d'une chaîne ISO directement,
   * sans conversion timezone, pour éviter le décalage UTC→local.
   */
  function parseDateSansTimezone(dateStr: string | Date): Date {
    const str = typeof dateStr === 'string' ? dateStr : dateStr.toISOString();
    const [year, month, day] = str.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function getProgrammablesParDate(d: Date): ProgrammableDTO[] {
    const tous = [...activites, ...evenements];
    const jourCible = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    return tous.filter((p) => {
      // Utiliser le parsing direct pour éviter le décalage timezone
      const jourDebut = parseDateSansTimezone(p.dateDepart);

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
    const debutSemaine = new Date(joursSemaine[0].getFullYear(), joursSemaine[0].getMonth(), joursSemaine[0].getDate());
    const finSemaine = new Date(joursSemaine[6].getFullYear(), joursSemaine[6].getMonth(), joursSemaine[6].getDate(), 23, 59, 59);

    return evenements.filter(e => {
      // Parsing direct pour éviter le décalage timezone
      const d = parseDateSansTimezone(e.dateDepart);
      const f = new Date(d);
      f.setDate(f.getDate() + (e.dureeJours || 1) - 1);
      f.setHours(23, 59, 59);

      return d <= finSemaine && f >= debutSemaine;
    });
  }

  /**
   * Calcule où l'événement doit se placer dans la grille (colonne et étalement)
   */
  function calculerPositionEvenement(e: EvenementDTO) {
    // Parsing direct pour éviter le décalage timezone
    const d1 = parseDateSansTimezone(e.dateDepart);
    const d2 = new Date(joursSemaine[0].getFullYear(), joursSemaine[0].getMonth(), joursSemaine[0].getDate());

    let colDepart = Math.round((d1.getTime() - d2.getTime()) / (24 * 3600 * 1000)) + 1;
    let span = e.dureeJours || 1;

    if (colDepart < 1) {
      span += (colDepart - 1);
      colDepart = 1;
    }
    if (colDepart + span > 8) {
      span = 8 - colDepart;
    }

    return { colDepart, span };
  }

  /**
   * Assigne une ligne (grid-row) à chaque événement de la barre all-day
   * pour éviter le chevauchement visuel entre événements qui partagent des colonnes.
   */
  function assignerLignesEvenements(evts: EvenementDTO[]): Map<number, number> {
    const lignes = new Map<number, number>();
    // On garde trace de l'occupation: { colDepart, colFin, ligne }[]
    const occupees: Array<{ colDepart: number; colFin: number; ligne: number }> = [];

    for (const e of evts) {
      const { colDepart, span } = calculerPositionEvenement(e);
      if (span <= 0) continue;
      const colFin = colDepart + span;

      // Trouver la première ligne libre (sans chevauchement de colonnes)
      let ligne = 1;
      while (true) {
        const conflit = occupees.some(
          o => o.ligne === ligne && colDepart < o.colFin && colFin > o.colDepart
        );
        if (!conflit) break;
        ligne++;
      }

      lignes.set(e.id, ligne);
      occupees.push({ colDepart, colFin, ligne });
    }

    return lignes;
  }

  const days = getDays();

  return (

    <>
    
      <div className="calendar-container">
        <div className="calendar-header">
          <button onClick={allerPrecedent}>‹</button>
          <h2>{titreHeader}</h2>
          <button onClick={allerSuivant}>›</button>

          <button
            className="add-btn"
            onClick={() => { setSelectedDate(undefined); setShowModal(true); }}
            title="Créer un élément"
          >
            +
          </button>

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
                  onClick={() => handleDayClicked(day)}
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
                {(() => {
                  const evtsSemaine = getEvenementsSemaine();
                  const lignes = assignerLignesEvenements(evtsSemaine);
                  return evtsSemaine.map(e => {
                    const { colDepart, span } = calculerPositionEvenement(e);
                    const ligne = lignes.get(e.id) ?? 1;

                    if (span <= 0) return null;

                    return (
                      <div
                        key={e.id}
                        className="all-day-event-wrapper"
                        style={{ gridColumn: `${colDepart} / span ${span}`, gridRow: ligne }}
                      >
                        <EventPill programmable={e} estVueSemaine={true} />
                      </div>
                    );
                  });
                })()}
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
    
      {showModal && (
        <CreateProgrammable
          defaultDate={selectedDate}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

    </>
  );
}