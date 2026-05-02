import { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";
import type { UserDTO } from "../services/api";
import Calendar from "../components/Calendar";

export default function HomePage() {
  const user = useRouteLoaderData("root") as UserDTO;
  const [view, setView] = useState<"week" | "month">("month");

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Bonjour, {user?.email}</h1>
        <div>
          <button 
            onClick={() => setView("month")} 
            style={{ fontWeight: view === "month" ? "bold" : "normal", marginRight: "10px" }}
          >
            Vue Mois
          </button>
          <button 
            onClick={() => setView("week")}
            style={{ fontWeight: view === "week" ? "bold" : "normal" }}
          >
            Vue Semaine
          </button>
        </div>
      </header>

      <div style={{ flex: 1, backgroundColor: 'white', padding: '1rem', borderRadius: '8px' }}>
        <Calendar /> 
      </div>
    </div>
  );
}
