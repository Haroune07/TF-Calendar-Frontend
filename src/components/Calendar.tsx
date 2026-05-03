import { useEffect, useState } from "react";
import "../styles/calendar.css";
import { api, type ActiviteDTO, type EvenementDTO, type ProgrammableDTO, type UserDTO } from "../services/api";
import { useRouteLoaderData } from "react-router-dom";


const PRIORITYTOCOLOR: Record<string, string> = {
  URGENT: "#ef4444",
  IMPORTANCE_MOYENNE: "#2563eb",
  IMPORTANCE_BASSE: "#10b981",
};

function EventPill({ programmable }: { programmable: ProgrammableDTO }) {
  const color =
    programmable.type === "activite"
      ? PRIORITYTOCOLOR[programmable.priorite ?? "IMPORTANCE_MOYENNE"]
      : "#8b5cf6";
 
  return (
    <div
      className="event-pill"
      style={{ backgroundColor: color }}
      title={`${programmable.nom}${programmable.description ? ` — ${programmable.description}` : ""}`}
    >
      {programmable.nom}
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

  const monthLabel = date.toLocaleDateString("fr-CA", {
    month: "long",
    year: "numeric",
  });


  const prevMonth = () => setDate(new Date(year, month - 1, 1));
  const nextMonth = () => setDate(new Date(year, month + 1, 1));

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

  const getWeekDays = () => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  useEffect(() => {
    if (!user?.id) return;
    api.getProgrammableByUser(user.id).then(programmable => {
      console.log("raw data:", programmable);
      setActivites(programmable.filter(p => p.type == "activite"))
      setEvenements(programmable.filter(p => p.type == "evenement"))
    });
  }, [user?.id]);

  const getProgrammablesForDay = (day : number): ProgrammableDTO[] => {
    const programmables = [...activites, ...evenements];
    return programmables.filter((programmable) => {
      const start = new Date(programmable.dateDepart)
      const startDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
      const cellDate = new Date(Date.UTC(year, month, day));

      if (programmable.type == "evenement" && programmable.dureeJours){
        const end = new Date(startDay);
        end.setUTCDate(end.getUTCDate() + programmable.dureeJours - 1);
        return cellDate >= startDay && cellDate <= end;
      }
      return cellDate.getTime() == startDay.getTime()
    })
  }

  const getProgrammablesForDate = (d: Date): ProgrammableDTO[] => {
    const programmables = [...activites, ...evenements];
    return programmables.filter((p) => {
      const start = new Date(p.dateDepart);
      const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const targetDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

      if (p.type === "evenement" && p.dureeJours) {
        const endDay = new Date(startDay);
        endDay.setDate(endDay.getDate() + p.dureeJours - 1);
        return targetDay >= startDay && targetDay <= endDay;
      }
      return targetDay.getTime() === startDay.getTime();
    });
  };

  const days = getDays();

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth}>‹</button>
        <h2>{monthLabel}</h2>
        <button onClick={nextMonth}>›</button>
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
                  {getProgrammablesForDay(day).map((programmable) =>(
                    <EventPill key={programmable.id} programmable={programmable} />
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
            {getWeekDays().map((dayDate, i) => (
              <div key={i} className="week-day-column-header">
                <span className="week-day-label">{weekDays[dayDate.getDay()]}</span>
                <span className={`week-day-number ${isDateToday(dayDate) ? "today" : ""}`}>
                  {dayDate.getDate()}
                </span>
              </div>
            ))}
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
                {getProgrammablesForDate(dayDate).map((p) => {
                  const start = new Date(p.dateDepart);
                  const hour = start.getHours();
                  const minutes = start.getMinutes();
                  const top = hour * 60 + (minutes / 60) * 60;
                  
                  return (
                    <div 
                      key={p.id} 
                      className="week-event-wrapper"
                      style={{ top: `${top}px` }}
                    >
                      <EventPill programmable={p} />
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