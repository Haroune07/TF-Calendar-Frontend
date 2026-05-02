import { createBrowserRouter, createRoutesFromElements, Route, redirect } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage, { loginAction } from "./pages/LoginPage";
import RegisterPage, { registerAction } from "./pages/RegisterPage";
import ProfilePage, { profileAction } from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import { api } from "./services/api";

async function requireAuthLoader() {
  try {
    const user = await api.getCurrentUser();
    return user; // Passes the user to the route via useLoaderData
  } catch (error) {
    return redirect("/login");
  }
}

async function requireGuestLoader() {
  try {
    await api.getCurrentUser();
    return redirect("/");
  } catch (error) {
    return null;
  }
}

async function logoutAction() {
  await api.logout();
  return redirect("/login");
}

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="login" element={<LoginPage />} action={loginAction} loader={requireGuestLoader} />
      <Route path="register" element={<RegisterPage />} action={registerAction} loader={requireGuestLoader} />
      <Route path="logout" action={logoutAction} />
      
      <Route element={<MainLayout />} loader={requireAuthLoader} id="root">
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} action={profileAction} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);
