import ShowDetailsPage from '../components/show/show';
import { ForgotPasswordPage } from '../components/ForgotPassword/ForgotPassword';
import Home from '../components/home/home';
import MovieDetailsPage from '../components/movie/movie';
import PersonDetailsPage from '../components/profile/profile';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import SearchPage from '../components/search/SearchPage';
import { ThemeProvider } from '../components/ThemeProvider';

export const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <ThemeProvider defaultTheme="dark" storageKey="cinecontext-theme">
      <Routes>
        <Route index={true} element={<Navigate to={'/home'} />} />
        <Route path="home" element={<Home />} />
        <Route path="profile" element={<PersonDetailsPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="movie/:movieId" element={<MovieDetailsPage />} />
        <Route path="person/:personId" element={<PersonDetailsPage />} />
        <Route path="show/:showId" element={<ShowDetailsPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </ThemeProvider>
  </BrowserRouter>
);

// TMDBShowDetailsPage
