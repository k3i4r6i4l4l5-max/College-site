import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { DEFAULT_SETTINGS, DEFAULT_USER, applySettings, readSettings } from '../entities/user';
import { STORAGE_KEYS } from '../shared/config/storageKeys';
import { authService } from '../features/auth';
import { catalogService } from '../entities/catalog';
import { userService } from '../entities/user';
import { trainingService } from '../entities/training';
import { progressService } from '../entities/progress';
import { planService } from '../entities/preparation-plan';
import { CatalogProvider } from '../entities/catalog';
import { LoadingState, ErrorState } from '../shared/ui/AsyncState';
import { SectionErrorBoundary } from '../shared/ui/SectionErrorBoundary';
import { Navbar } from '../widgets/navbar';
import { PopularCoursesSidebar } from '../widgets/popular-courses-sidebar';
import { PreparationPlanSidebar } from '../widgets/preparation-plan-sidebar';
import { ProfileStudySidebar } from '../widgets/profile-study-sidebar';
import { PageTransition } from './ui/PageTransition';
import { AuthPage } from '../pages/auth';
import { CoursePage } from '../pages/course';
import { CoursesPage } from '../pages/courses';
import { CommunityPage } from '../pages/community';
import { NotFoundPage } from '../pages/not-found';
import { ProfilePage } from '../pages/profile';
import { ProgressPage } from '../pages/progress';
import { TopicPage } from '../pages/topic';
import { TrainingPage } from '../pages/training';
import { SettingsPage } from '../pages/settings';

const emptyCatalog = { courses: [], topics: [] };
const readCollapsed = key => localStorage.getItem(key) === 'true';

export function App() {
  const [session, setSession] = useState({ loading: true, authenticated: false, user: DEFAULT_USER });
  const [workspace, setWorkspace] = useState({ loading: false, error: null });
  const [catalog, setCatalog] = useState(emptyCatalog);
  const [progress, setProgress] = useState({});
  const [activity, setActivity] = useState([]);
  const [activeTraining, setActiveTraining] = useState(null);
  const [preparationPlan, setPreparationPlan] = useState(null);
  const [userCourses, setUserCourses] = useState([]);
  const [settings, setSettings] = useState(readSettings);
  const [planningCourseId, setPlanningCourseId] = useState(null);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(() => readCollapsed(STORAGE_KEYS.leftSidebarCollapsed));
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(() => readCollapsed(STORAGE_KEYS.rightSidebarCollapsed));
  const routeTransitionIntent = useRef({ style: 'fade', direction: 'down' });
  const location = useLocation();

  const loadWorkspace = useCallback(async () => {
    setWorkspace({ loading: true, error: null });
    try {
      const [nextCatalog, nextProgress, nextActivity, nextPlan, nextTraining, nextCourses, nextSettings] = await Promise.all([
        catalogService.getCatalog(), progressService.getProgress(), progressService.getActivity(),
        planService.getActive(), trainingService.getActive(), userService.getCourses(), userService.getSettings(),
      ]);
      setCatalog(nextCatalog);
      setProgress(nextProgress);
      setActivity(nextActivity);
      setPreparationPlan(nextPlan);
      setActiveTraining(nextTraining);
      setUserCourses(nextCourses);
      setSettings({ ...DEFAULT_SETTINGS, ...nextSettings });
      setWorkspace({ loading: false, error: null });
    } catch (error) {
      setWorkspace({ loading: false, error });
    }
  }, []);

  useEffect(() => {
    let alive = true;
    authService.getSession().then(next => {
      if (!alive) return;
      setSession({ loading: false, ...next });
      if (next.authenticated) loadWorkspace();
    }).catch(() => alive && setSession({ loading: false, authenticated: false, user: DEFAULT_USER }));
    return () => { alive = false; };
  }, [loadWorkspace]);

  useEffect(() => applySettings(settings), [settings]);
  useEffect(() => {
    const unauthorized = () => setSession({ loading: false, authenticated: false, user: DEFAULT_USER });
    window.addEventListener('practice:unauthorized', unauthorized);
    return () => window.removeEventListener('practice:unauthorized', unauthorized);
  }, []);

  async function authenticate(mode, credentials) {
    const user = mode === 'register' ? await authService.register(credentials) : await authService.login(credentials);
    setSession({ loading: false, authenticated: true, user });
    await loadWorkspace();
  }

  async function updateUser(nextUser) {
    const user = await userService.updateProfile(nextUser);
    setSession(current => ({ ...current, user }));
    return user;
  }

  function updateSettings(updater) {
    setSettings(current => {
      const next = typeof updater === 'function' ? updater(current) : updater;
      userService.updateSettings(next).catch(() => {});
      return next;
    });
  }

  async function savePlan(plan) {
    const saved = await planService.save(plan);
    setPreparationPlan(saved);
  }

  async function deletePlan() {
    if (preparationPlan) await planService.remove(preparationPlan.id || preparationPlan.courseId);
    setPreparationPlan(null);
  }

  async function updateCourse(courseId, changes) {
    const next = await userService.updateCourse(courseId, changes);
    setUserCourses(next);
  }

  async function logoutAllDevices() {
    await authService.logoutAll();
    setSession({ loading: false, authenticated: false, user: DEFAULT_USER });
  }

  async function deleteAccount() {
    await userService.deleteAccount();
    setSession({ loading: false, authenticated: false, user: DEFAULT_USER });
    setCatalog(emptyCatalog); setProgress({}); setActivity([]); setPreparationPlan(null); setActiveTraining(null); setUserCourses([]);
    setSettings(DEFAULT_SETTINGS);
  }

  function toggleSidebar(side) {
    if (side === 'left') {
      setLeftSidebarCollapsed(current => {
        const next = !current;
        localStorage.setItem(STORAGE_KEYS.leftSidebarCollapsed, String(next));
        return next;
      });
      return;
    }
    setRightSidebarCollapsed(current => {
      const next = !current;
      localStorage.setItem(STORAGE_KEYS.rightSidebarCollapsed, String(next));
      return next;
    });
  }

  if (session.loading) return <main className="container"><LoadingState label="Проверяем сессию" rows={4} /></main>;
  if (!session.authenticated) return <AuthPage user={session.user} onAuthenticate={authenticate} />;
  if (workspace.loading) return <main className="container"><LoadingState label="Загружаем учебные данные" rows={5} /></main>;
  if (workspace.error) return <main className="container"><ErrorState message={workspace.error.message} onRetry={loadWorkspace} /></main>;

  const guarded = element => <SectionErrorBoundary>{element}</SectionErrorBoundary>;
  return (
    <CatalogProvider catalog={catalog}>
      <a className="skip-link" href="#main">К содержимому</a>
      <Navbar user={session.user} />
      <div className={`app-shell${location.pathname === '/profile' ? ' has-profile-sidebar' : ''}${leftSidebarCollapsed ? ' left-sidebar-collapsed' : ''}${rightSidebarCollapsed ? ' right-sidebar-collapsed' : ''}`}>
        <PopularCoursesSidebar collapsed={leftSidebarCollapsed} onToggle={() => toggleSidebar('left')} userCourses={userCourses} onCourseNavigate={direction => { routeTransitionIntent.current = { style: 'course-swipe', direction }; }} />
        <main id="main" className="container">
          <PageTransition location={location} transitionIntent={routeTransitionIntent}>
            {routeLocation => (
              <Routes location={routeLocation}>
                <Route path="/" element={guarded(<CoursesPage progress={progress} activity={activity} activeTraining={activeTraining} userCourses={userCourses} onUpdateCourse={updateCourse} />)} />
                <Route path="/courses/:id" element={guarded(<CoursePage activity={activity} progress={progress} userCourses={userCourses} onUpdateCourse={updateCourse} onPlanCourse={setPlanningCourseId} />)} />
                <Route path="/topics/:id" element={guarded(<TopicPage progress={progress} />)} />
                <Route path="/training" element={guarded(<TrainingPage key={routeLocation.search + routeLocation.key} activeTraining={activeTraining} onTrainingChange={setActiveTraining} onLearningChange={({ progress: nextProgress, activity: nextActivity }) => { setProgress(nextProgress); setActivity(nextActivity); }} />)} />
                <Route path="/progress" element={guarded(<ProgressPage activity={activity} progress={progress} />)} />
                <Route path="/community" element={guarded(<CommunityPage userCourses={userCourses} onUpdateCourse={updateCourse} />)} />
                <Route path="/profile" element={guarded(<ProfilePage activity={activity} progress={progress} user={session.user} userCourses={userCourses} onUpdateCourse={updateCourse} onUpdate={updateUser} />)} />
                <Route path="/settings" element={guarded(<SettingsPage settings={settings} user={session.user} onChangePassword={userService.changePassword} onDeleteAccount={deleteAccount} onLogoutAll={logoutAllDevices} onSettingsChange={updateSettings} onUpdate={updateUser} />)} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            )}
          </PageTransition>
        </main>
        <PreparationPlanSidebar collapsed={rightSidebarCollapsed} onToggle={() => toggleSidebar('right')} selectedCourseId={planningCourseId} progress={progress} plan={preparationPlan} onSavePlan={savePlan} onDeletePlan={deletePlan}>
          {location.pathname === '/profile' && <ProfileStudySidebar embedded activity={activity} progress={progress} />}
        </PreparationPlanSidebar>
      </div>
      <footer className="footer"><span>практика</span><span>Учиться. Вспоминать. Понимать.</span></footer>
    </CatalogProvider>
  );
}
