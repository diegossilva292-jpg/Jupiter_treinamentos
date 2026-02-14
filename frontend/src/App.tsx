import { useEffect, useState } from 'react';
import { api, type Lesson, type User } from './services/api';
import { Dashboard } from './components/Dashboard';
import { LessonView } from './components/LessonView';
import { Login } from './components/Login';
import { CoursesList } from './components/CoursesList';
import { RankingBoard } from './components/RankingBoard';

import { AdminPanel } from './components/AdminPanel';
import { CategorySelector } from './components/CategorySelector';
import { CertificatesView } from './components/CertificatesView';
import { Background } from './components/Background';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'courses' | 'ranking' | 'admin-panel' | 'certificates'>('dashboard');

  // ... (rest of authentication state and Login handler same as before)

  useEffect(() => {
    // Restore session
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
        localStorage.removeItem('user');
      }
    }

    // No longer fetching users for login screen
  }, []);

  const handleLogin = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleSelectLesson = async (courseId: string, moduleId: string, lessonId: string) => {
    const courses = await api.getCourses();
    const course = courses.find(c => c.id === courseId);
    const module = course?.modules.find(m => m.id === moduleId);
    const lesson = module?.lessons.find(l => l.id === lessonId);
    if (lesson) {
      setCurrentLesson(lesson);
      setCurrentCourseId(courseId);
      setCurrentModuleId(moduleId);
    }
  };

  const handleCompleteVideo = async () => {
    if (currentUser && currentLesson) {
      if (currentLesson.quizId) {
        alert('Vídeo concluído! Agora responda ao Quiz para finalizar a aula (Mínimo 4 acertos).');
        return;
      }
      await api.markProgress(currentUser.id, currentLesson.id);
      alert('Aula concluída! Progresso salvo.');
      const updatedUsers = await api.getUsers();
      const me = updatedUsers.find(u => u.id === currentUser.id);
      if (me) {
        const updatedMe = { ...me, name: currentUser.name };
        setCurrentUser(updatedMe);
        localStorage.setItem('user', JSON.stringify(updatedMe));
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setCurrentLesson(null);
    setView('dashboard');
  };

  return (
    <>
      <Background />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {!currentUser ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Login onLogin={handleLogin} />
          </div>
        ) : !currentUser.category && currentUser.role !== 'admin' ? (
          <CategorySelector onSelect={async (category) => {
            await api.updateUserCategory(currentUser.id, category);
            const updatedUser = { ...currentUser, category };
            setCurrentUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }} />
        ) : (
          <>
            <header className="glass-panel" style={{ padding: '1rem 2rem', margin: '1rem 2rem', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <h3 className="text-glow" style={{ margin: 0, cursor: 'pointer', fontSize: '1.5rem', fontWeight: '700', letterSpacing: '1px', fontFamily: 'var(--font-display)', color: 'var(--primary)' }} onClick={() => { setCurrentLesson(null); setView('dashboard'); }}>
                  JUPITER <span style={{ color: 'var(--text-main)', fontWeight: '400' }}>TREINAMENTOS</span>
                </h3>
                <nav style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className={`btn btn-secondary`}
                    style={{
                      background: view === 'dashboard' ? 'var(--primary)' : 'transparent',
                      color: view === 'dashboard' ? 'white' : 'var(--text-muted)',
                      borderColor: view === 'dashboard' ? 'var(--primary)' : 'transparent'
                    }}
                    onClick={() => { setCurrentLesson(null); setView('dashboard'); }}
                  >
                    Dashboard
                  </button>
                  <button
                    className={`btn btn-secondary`}
                    style={{
                      background: view === 'courses' ? 'var(--primary)' : 'transparent',
                      color: view === 'courses' ? 'white' : 'var(--text-muted)',
                      borderColor: view === 'courses' ? 'var(--primary)' : 'transparent'
                    }}
                    onClick={() => { setCurrentLesson(null); setView('courses'); }}
                  >
                    Meus Cursos
                  </button>
                  <button
                    className={`btn btn-secondary`}
                    style={{
                      background: view === 'ranking' ? 'var(--primary)' : 'transparent',
                      color: view === 'ranking' ? 'white' : 'var(--text-muted)',
                      borderColor: view === 'ranking' ? 'var(--primary)' : 'transparent'
                    }}
                    onClick={() => { setCurrentLesson(null); setView('ranking'); }}
                  >
                    Ranking 🏆
                  </button>
                </nav>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', letterSpacing: '0.5px' }}>
                    {currentUser.name}
                  </span>
                  {currentUser.xp !== undefined && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 'bold' }}>
                      {currentUser.xp} XP
                    </span>
                  )}
                </div>
                <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={handleLogout}>
                  Sair
                </button>
              </div>
            </header>

            <main className="page-container">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view + (currentLesson ? '-lesson' : '')}
                  initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ width: '100%' }}
                >
                  {currentLesson ? (
                    <LessonView
                      lesson={currentLesson}
                      courseId={currentCourseId || ''}
                      moduleId={currentModuleId || ''}
                      userId={currentUser.id}
                      userName={currentUser.name}
                      onBack={() => { setCurrentLesson(null); }}
                      onSelectLesson={handleSelectLesson}
                      onCompleteVideo={handleCompleteVideo}
                      onCompleteQuiz={async (score) => {
                        if (currentUser && currentLesson && score >= 4) {
                          await api.markProgress(currentUser.id, currentLesson.id);
                          const updatedUsers = await api.getUsers();
                          const me = updatedUsers.find(u => u.id === currentUser.id);
                          if (me) setCurrentUser({ ...me, name: currentUser.name });
                        }
                      }}
                    />
                  ) : view === 'ranking' ? (
                    <RankingBoard onBack={() => setView('dashboard')} currentUserId={currentUser.id} />
                  ) : view === 'admin-panel' ? (
                    <AdminPanel onBack={() => setView('dashboard')} />
                  ) : view === 'certificates' ? (
                    <CertificatesView currentUser={currentUser} onBack={() => setView('dashboard')} />
                  ) : view === 'courses' ? (
                    <CoursesList
                      userId={currentUser.id}
                      onSelectLesson={handleSelectLesson}
                      onBack={() => setView('dashboard')}
                      onViewCertificate={() => setView('certificates')}
                    />) : (
                    <Dashboard user={currentUser} onSelectLesson={handleSelectLesson} onNavigate={setView} />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </>
        )}
      </div>
    </>
  );
}


export default App;
