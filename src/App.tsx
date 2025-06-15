// import { AppRoutes } from './components/core/routes/routes';

import  { BrowserRouter, Routes, Route, Navigate } from "react-router";
import  { ThemeProvider } from "./components/common";
import HomePage from "./components/home/Home";

export default function App() {
  return   <BrowserRouter>
  <ThemeProvider defaultTheme="dark" storageKey="cinecontext-theme">
    <Routes>
      <Route index={true} element={<Navigate to={'/home'} />} />
      <Route path="home" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  </ThemeProvider>
</BrowserRouter>;
}
