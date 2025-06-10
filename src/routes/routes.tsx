import ShowDetailsPage from '../component/show/show';
import { ForgotPasswordPage } from '../component/forgot-password/forgot-password';
import Home from '../component/home/home';
import { LoginPage } from '../component/login/login';
import MovieDetailsPage from '../component/movie/movie';
import { ProfilePage } from '../component/profile/profile';
import { SignUpPage } from '../component/signup/signup';
import type React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import SearchPage from '../component/search/SearchPage';

export const AppRoutes: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route index={true} element={<Navigate to={'/home'} />} />
      <Route path="home" element={<Home />} index={true} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignUpPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="movie/:movieId" element={<MovieDetailsPage />} />
      <Route path="show/:showId" element={<ShowDetailsPage />} />
      <Route path="search" element={<SearchPage />} />
    </Routes>
  </BrowserRouter>
);

// TMDBShowDetailsPage
