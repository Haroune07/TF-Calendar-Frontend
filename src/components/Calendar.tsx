import { useState } from "react";
import "../styles/calendar.css";

export default function Calendar() {
  const [date, setDate] = useState(new Date());

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

  const days = getDays();

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth}>‹</button>
        <h2>{monthLabel}</h2>
        <button onClick={nextMonth}>›</button>
      </div>

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
              {day}
            </div>
          ) : (
            <div key={index} />
          )
        )}
      </div>
    </div>
  );
}