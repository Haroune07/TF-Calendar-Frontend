import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./App.css";

import { ThemeProvider } from "./services/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
