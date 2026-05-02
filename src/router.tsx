import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      {/* routes publiques   */}
      <Route path="login" element={<LoginPage />} />
      {/* We will add RegisterPage later */}
      
      {/* routes protegees */}
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);
