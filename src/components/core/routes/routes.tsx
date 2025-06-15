import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { MovieDetailsPage } from '@app/components/movie/movie';
import { PersonDetailsPage } from '@app/components/profile/Profile';
import { ShowDetailsPage } from '@app/components/show/show';
import { SearchPages } from '@app/components/search/SearchPage';
import { HomePage } from '@app/components/home/Home';
import { ForgotPassword } from '@app/components/auth/forgot-password/ForgotPassword';
import { ThemeProvider } from '@app/components/common/ThemeProvider';

export const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <ThemeProvider defaultTheme="dark" storageKey="cinecontext-theme">
      <Routes>
        <Route index={true} element={<Navigate to={'/home'} />} />
        <Route path="home" element={<HomePage />} />
        <Route path="profile" element={<PersonDetailsPage />} />
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
