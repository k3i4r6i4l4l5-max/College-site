import React, { useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { DEFAULT_SETTINGS, DEFAULT_USER, STORAGE_KEYS } from './constants';
import { Navbar } from './components/Navbar';
import { PopularCoursesSidebar } from './components/PopularCoursesSidebar';
import { PreparationPlanSidebar } from './components/PreparationPlanSidebar';
import { ProfileStudySidebar } from './components/ProfileStudySidebar';
import { PageTransition } from './components/PageTransition';
import { AuthPage } from './pages/AuthPage';
import { CoursePage } from './pages/CoursePage';
import { CoursesPage } from './pages/CoursesPage';
import { CommunityPage } from './pages/CommunityPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProgressPage } from './pages/ProgressPage';
import { TopicPage } from './pages/TopicPage';
import { TrainingPage } from './pages/TrainingPage';
import { SettingsPage } from './pages/SettingsPage';
import { rateTopic, readProgress } from './utils/progress';
import { readPreparationPlan, savePreparationPlan } from './utils/preparationPlan';
import { addActivityEntry, readActivity, saveActivity } from './utils/activity';
import { applySettings, readSettings, saveSettings } from './utils/settings';
import { clearSession, readSession, saveSession } from './utils/session';

export function App() {
  const [initialSession] = useState(readSession);
  const [progress, setProgress] = useState(readProgress);
  const [activity, setActivity] = useState(readActivity);
  const [authenticated, setAuthenticated] = useState(initialSession.authenticated);
  const [user, setUser] = useState(initialSession.user);
  const [preparationPlan, setPreparationPlan] = useState(readPreparationPlan);
  const [settings, setSettings] = useState(readSettings);
  const [planningCourseId, setPlanningCourseId] = useState(null);
  const routeTransitionIntent = useRef({ style: 'fade', direction: 'down' });
  const suppressPersistence = useRef(false);
  const location = useLocation();

  useEffect(() => {
    if (suppressPersistence.current) return;
    try {
      localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
    } catch {
      // Состояние React продолжает работать, даже если хранилище браузера недоступно.
    }
  }, [progress]);

  useEffect(() => {
    if (suppressPersistence.current) return;
    saveActivity(activity);
  }, [activity]);

  useEffect(() => {
    applySettings(settings);
    if (suppressPersistence.current) return;
    saveSettings(settings);
  }, [settings]);

  function authenticate(nextUser) {
    suppressPersistence.current = false;
    setUser(nextUser);
    setAuthenticated(true);
    saveSession(nextUser);
  }

  function updateUser(nextUser) {
    setUser(nextUser);
    saveSession(nextUser);
  }

  function handleRate(topicId, rating, cardIndex) {
    const nextProgress = rateTopic(progress, topicId, rating);
    setProgress(nextProgress);
    setActivity(current => addActivityEntry(
      current,
      topicId,
      rating,
      cardIndex,
      nextProgress[topicId],
    ));
  }

  function createPlan(plan) {
    setPreparationPlan(plan);
    savePreparationPlan(plan);
  }

  function logoutAllDevices() {
    clearSession();
    setAuthenticated(false);
    setUser(DEFAULT_USER);
  }

  function deleteAccount() {
    suppressPersistence.current = true;
    try {
      localStorage.removeItem(STORAGE_KEYS.progress);
      localStorage.removeItem(STORAGE_KEYS.activity);
      localStorage.removeItem(STORAGE_KEYS.preparationPlan);
      localStorage.removeItem(STORAGE_KEYS.settings);
    } catch {
      // Локальное состояние всё равно сбрасывается ниже.
    }
    clearSession();
    setProgress(readProgress());
    setActivity(readActivity());
    setPreparationPlan(null);
    setSettings(DEFAULT_SETTINGS);
    setPlanningCourseId(null);
    setUser(DEFAULT_USER);
    setAuthenticated(false);
  }

  if (!authenticated) {
    return <AuthPage user={user} onAuthenticate={authenticate} />;
  }

  return (
    <>
      <a className="skip-link" href="#main">К содержимому</a>
      <Navbar user={user} />
      <div className={`app-shell${location.pathname === '/profile' ? ' has-profile-sidebar' : ''}`}>
        <PopularCoursesSidebar
          onCourseNavigate={direction => {
            routeTransitionIntent.current = { style: 'course-swipe', direction };
          }}
        />
        <main id="main" className="container">
          <PageTransition location={location} transitionIntent={routeTransitionIntent}>
            {routeLocation => (
              <Routes location={routeLocation}>
                <Route path="/" element={<CoursesPage progress={progress} />} />
                <Route
                  path="/courses/:id"
                  element={<CoursePage progress={progress} onPlanCourse={setPlanningCourseId} />}
                />
                <Route path="/topics/:id" element={<TopicPage progress={progress} />} />
                <Route
                  path="/training"
                  element={(
                    <TrainingPage
                      key={routeLocation.search + routeLocation.key}
                      progress={progress}
                      onRate={handleRate}
                    />
                  )}
                />
                <Route path="/progress" element={<ProgressPage activity={activity} progress={progress} />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route
                  path="/profile"
                  element={<ProfilePage activity={activity} progress={progress} user={user} onUpdate={updateUser} />}
                />
                <Route
                  path="/settings"
                  element={(
                    <SettingsPage
                      settings={settings}
                      user={user}
                      onDeleteAccount={deleteAccount}
                      onLogoutAll={logoutAllDevices}
                      onSettingsChange={setSettings}
                      onUpdate={updateUser}
                    />
                  )}
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            )}
          </PageTransition>
        </main>
        <PreparationPlanSidebar
          selectedCourseId={planningCourseId}
          progress={progress}
          plan={preparationPlan}
          onCreatePlan={createPlan}
        >
          {location.pathname === '/profile' && <ProfileStudySidebar embedded />}
        </PreparationPlanSidebar>
      </div>
      <footer className="footer">
        <span>практика</span>
        <span>Учиться. Вспоминать. Понимать.</span>
      </footer>
    </>
  );
}
