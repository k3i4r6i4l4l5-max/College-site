import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { DEFAULT_USER, STORAGE_KEYS } from './constants';
import { Navbar } from './components/Navbar';
import { PopularCoursesSidebar } from './components/PopularCoursesSidebar';
import { AuthPage } from './pages/AuthPage';
import { CoursePage } from './pages/CoursePage';
import { CoursesPage } from './pages/CoursesPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProgressPage } from './pages/ProgressPage';
import { TopicPage } from './pages/TopicPage';
import { TrainingPage } from './pages/TrainingPage';
import { rateTopic, readProgress } from './utils/progress';

export function App() {
  const [progress, setProgress] = useState(readProgress);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(DEFAULT_USER);
  const location = useLocation();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
    } catch {
      // Состояние React продолжает работать, даже если хранилище браузера недоступно.
    }
  }, [progress]);

  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.legacyAuth);
      localStorage.removeItem(STORAGE_KEYS.legacyUser);
    } catch {
      // Старые данные входа могут остаться только при недоступном localStorage.
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  function authenticate(nextUser) {
    setUser(nextUser);
    setAuthenticated(true);
  }

  function logout() {
    setAuthenticated(false);
    setUser(DEFAULT_USER);
  }

  function handleRate(topicId, rating) {
    setProgress(current => rateTopic(current, topicId, rating));
  }

  if (!authenticated) {
    return <AuthPage user={user} onAuthenticate={authenticate} />;
  }

  return (
    <>
      <a className="skip-link" href="#main">К содержимому</a>
      <Navbar user={user} onLogout={logout} progress={progress} />
      <div className="app-shell">
        <PopularCoursesSidebar />
        <main id="main" className="container">
          <Routes>
            <Route path="/" element={<CoursesPage progress={progress} />} />
            <Route path="/courses/:id" element={<CoursePage progress={progress} />} />
            <Route path="/topics/:id" element={<TopicPage progress={progress} />} />
            <Route
              path="/training"
              element={(
                <TrainingPage
                  key={location.search + location.key}
                  progress={progress}
                  onRate={handleRate}
                />
              )}
            />
            <Route path="/progress" element={<ProgressPage progress={progress} />} />
            <Route
              path="/profile"
              element={<ProfilePage progress={progress} user={user} onUpdate={setUser} />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
      <footer className="footer">
        <span>практика</span>
        <span>Учиться. Вспоминать. Понимать.</span>
      </footer>
    </>
  );
}
