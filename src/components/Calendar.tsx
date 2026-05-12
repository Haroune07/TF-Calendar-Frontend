import { useEffect, useState } from "react";
import "../styles/calendar.css";
import { api, programmableApi, type ActiviteDTO, type EvenementDTO, type ProgrammableDTO, type UserDTO, type ConflitInfoDTO, CATEGORIES, type CategorieProgrammable } from "../services/api";
import { useRouteLoaderData } from "react-router-dom";
import CreateProgrammable from "./CreateProgrammable";
import DetailProgrammableModal from "./DetailProgrammableModal";


const PRIORITYTOCOLOR: Record<string, string> = {
  URGENT: "#ef4444",
  IMPORTANCE_MOYENNE: "#2563eb",
  IMPORTANCE_BASSE: "#10b981",
};

 
const CATEGORIETOCOLOR: Record<string, string> = {
  COURS:     "#2563eb",
  TRAVAIL:   "#d97706",
  PERSONNEL: "#7c3aed",
  SPORT:     "#10b981",
  AUTRE:     "#64748b",
};

function EventPill({ programmable, estVueSemaine, onClick, estEnConflit }: { 
  programmable: ProgrammableDTO, 
  estVueSemaine?: boolean,
  onClick?: (p: ProgrammableDTO) => void,
  estEnConflit?: boolean
}) {
  const color =
    programmable.categorie
      ? CATEGORIETOCOLOR[programmable.categorie]
      : programmable.type === "activite"
        ? PRIORITYTOCOLOR[programmable.priorite ?? "IMPORTANCE_MOYENNE"]
        : `hsl(${(programmable.nom.length * 40) % 360}, 60%, 50%)`;
 
  return (
    <div
      className={`event-pill ${estVueSemaine ? "vue-semaine" : ""} ${estEnConflit ? "en-conflit" : ""}`}
      style={{ backgroundColor: color, height: estVueSemaine ? "100%" : "auto", position: "relative" }}
      title={`${programmable.nom}${programmable.description ? ` — ${programmable.description}` : ""}`}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation(); // Empêche d'ouvrir le modal de création du jour
          onClick(programmable);
        }
      }}
    >
      <span className="event-name">{programmable.nom}</span>
      {estVueSemaine && programmable.description && (
        <p className="event-desc-court">{programmable.description}</p>
      )}
      {estEnConflit && <span className="conflict-badge" title="Conflit d'horaire">!</span>}
    </div>
  );
}

export default function Calendar({ view, replanifierId }: { view: "month" | "week", replanifierId?: number | null }) {
  const [date, setDate] = useState(new Date());
  const [activites, setActivites] = useState<ActiviteDTO[]>([]);
  const [evenements, setEvenements] = useState<EvenementDTO[]>([]);
  const [conflits, setConflits] = useState<ConflitInfoDTO[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [selectedItem, setSelectedItem] = useState<ProgrammableDTO | null>(null);
  const user = useRouteLoaderData("root") as UserDTO;
  const [activeCategories, setActiveCategories] = useState<Set<CategorieProgrammable>>(
    new Set(CATEGORIES.map(c => c.value))
  );


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

  const chargerDonnees = () => {
    if (!user?.id) return;
    api.getProgrammableByUser(user.id).then(programmable => {
      setActivites(programmable.filter(p => p.type == "activite" || p.type === "activite_groupe") as ActiviteDTO[]);
      setEvenements(programmable.filter(p => p.type == "evenement") as EvenementDTO[]);
    });
    // On charge aussi les conflits pour afficher les badges
    programmableApi.getConflits().then(setConflits);
  };

  useEffect(() => {
    chargerDonnees();
  }, [user?.id]);

  // Si on reçoit un ID de replanification depuis l'extérieur (ex: panneau de conflits)
  useEffect(() => {
    if (replanifierId) {
      const item = [...activites, ...evenements].find(i => i.id === replanifierId);
      if (item) {
        setSelectedItem(item);
      }
    }
  }, [replanifierId, activites, evenements]);




  const handleCreated = (item: ProgrammableDTO) => {
    if (item.type === "activite" || item.type === "activite_groupe"){
      setActivites(prev => [...prev, item as ActiviteDTO])
    }
    else {
      setEvenements(prev => [...prev, item as EvenementDTO])
    }
    programmableApi.getConflits().then(setConflits);
  }

  const handleDeleted = (id: number) => {
    setActivites(prev => prev.filter(a => a.id !== id));
    setEvenements(prev => prev.filter(e => e.id !== id));
    programmableApi.getConflits().then(setConflits);
  };

  const handleUpdated = (item: ProgrammableDTO) => {
    if (item.type === "activite" || item.type === "activite_groupe") {
      setActivites(prev => prev.map(a => a.id === item.id ? (item as ActiviteDTO) : a));
    } else {
      setEvenements(prev => prev.map(e => e.id === item.id ? (item as EvenementDTO) : e));
    }
    programmableApi.getConflits().then(setConflits);
  };

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

   
  const toggleCategorie = (cat: CategorieProgrammable) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  function getProgrammablesParDate(d: Date): ProgrammableDTO[] {
    const tous = [...activites, ...evenements].filter(p =>
      activeCategories.has((p.categorie ?? 'AUTRE') as CategorieProgrammable)
    );

    const jourCible = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    return tous.filter((p) => {
      // Utiliser le parsing direct pour éviter le décalage timezone
      const jourDebut = parseDateSansTimezone(p.dateDepart);

      if (p.type === "evenement" && p.dureeJours) {
        const jourFin = new Date(jourDebut);
        jourFin.setDate(jourFin.getDate() + (p.dureeJours || 1) - 1);
        return jourCible >= jourDebut && jourCible <= jourFin;
      }

      return jourCible.getTime() === jourDebut.getTime();
    });
  }

  // Vérifie si un programmable est en conflit avec un autre
  function estEnConflit(id: number) {
    return conflits.some(c => c.activiteIdA === id || c.activiteIdB === id);
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

  /**
   * Calcule le layout (top, height, left, width) pour les activités d'une journée
   * afin que celles qui se chevauchent s'affichent côte-à-côte
   */
  function getLayoutForDay(dayDate: Date) {
    const acts = getProgrammablesParDate(dayDate).filter(p => p.type === "activite" || p.type === "activite_groupe") as ActiviteDTO[];
    
    const events = acts.map(p => {
      const start = new Date(p.dateDepart);
      const top = start.getHours() * 60 + start.getMinutes();
      const height = p.dureeHeures * 60;
      return { p, top, bottom: top + height, column: 0, width: 100, left: 0, height:height };
    });

    events.sort((a, b) => a.top - b.top || b.bottom - a.bottom);

    const clusters: typeof events[] = [];
    let currentCluster: typeof events = [];
    let clusterEnd = 0;

    events.forEach(ev => {
      if (ev.top >= clusterEnd && currentCluster.length > 0) {
        clusters.push(currentCluster);
        currentCluster = [];
      }
      currentCluster.push(ev);
      clusterEnd = Math.max(clusterEnd, ev.bottom);
    });
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    clusters.forEach(cluster => {
      const columns: typeof events[] = [];
      
      cluster.forEach(ev => {
        let placed = false;
        for (let i = 0; i < columns.length; i++) {
          const lastEv = columns[i][columns[i].length - 1];
          // On ajoute une petite marge pour le visuel, si les heures se touchent exactement on ne les met pas côté à côté
          if (lastEv.bottom <= ev.top) { 
            columns[i].push(ev);
            ev.column = i;
            placed = true;
            break;
          }
        }
        if (!placed) {
          columns.push([ev]);
          ev.column = columns.length - 1;
        }
      });

      const maxCols = columns.length;
      cluster.forEach(ev => {
        ev.width = 100 / maxCols;
        ev.left = ev.column * ev.width;
      });
    });

    return events;
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
                      <EventPill 
                        key={programmable.id} 
                        programmable={programmable} 
                        estVueSemaine={false} 
                        onClick={setSelectedItem}
                        estEnConflit={estEnConflit(programmable.id)}
                      />
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
                        <EventPill 
                          programmable={e} 
                          estVueSemaine={false} 
                          onClick={setSelectedItem}
                          estEnConflit={estEnConflit(e.id)}
                        />
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
                  {getLayoutForDay(dayDate).map(({ p, top, height, width, left }) => (
                    <div 
                      key={p.id} 
                      className="week-event-wrapper"
                      style={{ 
                        top: `${top}px`, 
                        height: `${height}px`,
                        left: `calc(${left}% + 2px)`,
                        width: `calc(${width}% - 4px)`,
                        position: 'absolute'
                      }}
                    >
                      <EventPill 
                        programmable={p} 
                        estVueSemaine={true} 
                        onClick={setSelectedItem}
                        estEnConflit={estEnConflit(p.id)}
                      />
                    </div>
                  ))}
                </div>

              ))}
            </div>
          </div>
        )}




 
        <div className="calendar-legend">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              className={`filter-btn ${activeCategories.has(cat.value) ? "active" : "inactive"}`}
              style={{ "--cat-color": cat.color } as React.CSSProperties}
              onClick={() => toggleCategorie(cat.value)}
            >
              <span className="legend-dot" style={{ backgroundColor: activeCategories.has(cat.value) ? cat.color : "#cbd5e1" }} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    
      {showModal && (
        <CreateProgrammable
          defaultDate={selectedDate}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {selectedItem && (
        <DetailProgrammableModal
          programmable={selectedItem}
          onFermer={() => setSelectedItem(null)}
          onSupprime={handleDeleted}
          onMisAJour={handleUpdated}
        />
      )}

    </>
  );
}