import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { MovieDetailsPage } from '../../../components/movie/movie';
import { ShowDetailsPage } from '../../../components/show/show';
import { SearchPages } from '../../../components/search/SearchPage';
import { ForgotPassword } from '../../../components/auth/forgot-password/ForgotPassword';
import { ThemeProvider } from '../../../components/common/ThemeProvider';
import { HomePage } from '../../../components/home/Home';
import { PersonDetailsPage } from '../../../components/profile/Profile';

export const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <ThemeProvider defaultTheme="dark" storageKey="cinecontext-theme">
      <Routes>
        <Route index={true} element={<Navigate to={'/home'} />} />
        <Route path="home" element={<HomePage />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="movie/:movieId" element={<MovieDetailsPage />} />
        <Route path="person/:personId" element={<PersonDetailsPage />} />
        <Route path="show/:showId" element={<ShowDetailsPage />} />
        <Route path="search" element={<SearchPages />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </ThemeProvider>
  </BrowserRouter>
);
