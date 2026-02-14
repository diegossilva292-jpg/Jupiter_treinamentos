import React from 'react';
import { api, type Lesson, type CourseModule } from '../services/api';
import { VideoPlayer } from './VideoPlayer';
import { QuizInterface } from './QuizInterface';
import { motion } from 'framer-motion';

interface LessonViewProps {
    lesson: Lesson;
    courseId: string;
    moduleId: string;
    userId: string;
    userName?: string;
    onBack: () => void;
    onSelectLesson: (courseId: string, moduleId: string, lessonId: string) => void;
    onCompleteVideo: () => void;
    onCompleteQuiz: (score: number) => void;
}



export const LessonView: React.FC<LessonViewProps> = ({ lesson, courseId, moduleId, userId, userName, onBack, onSelectLesson, onCompleteVideo, onCompleteQuiz }) => {
    const [quizVisible, setQuizVisible] = React.useState(false);
    const [isLessonCompleted, setIsLessonCompleted] = React.useState(false);
    const [course, setCourse] = React.useState<any | null>(null);
    const [currentModule, setCurrentModule] = React.useState<CourseModule | null>(null);
    const [completedLessons, setCompletedLessons] = React.useState<Set<string>>(new Set());
    const [expandedModules, setExpandedModules] = React.useState<Record<string, boolean>>({});

    // DEBUG: Log lesson data
    console.log('[LessonView] Rendering lesson:', {
        id: lesson.id,
        title: lesson.title,
        videoUrl: lesson.videoUrl,
        quizId: lesson.quizId
    });

    React.useEffect(() => {
        // Reset state when lesson changes
        setQuizVisible(false);
        setIsLessonCompleted(false);

        const checkProgress = async () => {
            try {
                const progressList = await api.getProgress(userId);
                const isCompleted = progressList.some(p => p.lessonId === lesson.id && p.status === 'COMPLETED');
                if (isCompleted) {
                    setQuizVisible(true);
                    setIsLessonCompleted(true);
                }

                // Track all completed lessons for sidebar indicators
                const completedIds = new Set(
                    progressList
                        .filter(p => p.status === 'COMPLETED')
                        .map(p => p.lessonId)
                );
                setCompletedLessons(completedIds);
            } catch (error) {
                console.error("Erro ao verificar progresso:", error);
            }
        };

        checkProgress();
    }, [lesson.id, userId]);

    // Load course and module data
    React.useEffect(() => {
        const loadCourseData = async () => {
            try {
                const courses = await api.getCourses();
                const foundCourse = courses.find(c => c.id === courseId);
                if (foundCourse) {
                    setCourse(foundCourse);
                    const foundModule = foundCourse.modules.find(m => m.id === moduleId);
                    setCurrentModule(foundModule || null);

                    // Auto-expand current module
                    if (moduleId) {
                        setExpandedModules(prev => ({ ...prev, [moduleId]: true }));
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar dados do curso:", error);
            }
        };

        if (courseId) {
            loadCourseData();
        }
    }, [courseId, moduleId]);

    const handleVideoEnded = async () => {
        // Mark lesson as completed silently
        await onCompleteVideo();

        // Auto-advance to next lesson if available
        if (hasNext && currentModule) {
            const nextLesson = currentModule.lessons[currentLessonIndex + 1];
            onSelectLesson(courseId, moduleId, nextLesson.id);
        }
        // If there's a quiz and no next lesson, show the quiz
        else if (lesson.quizId) {
            setQuizVisible(true);
        }
    };

    // Find current lesson index and determine next/previous
    const currentLessonIndex = currentModule?.lessons.findIndex(l => l.id === lesson.id) ?? -1;
    const currentModuleIndex = course?.modules.findIndex((m: CourseModule) => m.id === moduleId) ?? -1;

    const hasNextLessonInModule = currentModule && currentLessonIndex < currentModule.lessons.length - 1;
    const hasNextModule = course && currentModuleIndex < course.modules.length - 1;
    const hasNext = hasNextLessonInModule || hasNextModule;

    const hasPreviousLessonInModule = currentLessonIndex > 0;
    const hasPreviousModule = currentModuleIndex > 0;
    const hasPrevious = hasPreviousLessonInModule || hasPreviousModule;

    const goToNextLesson = () => {
        if (hasNextLessonInModule && currentModule) {
            const nextLesson = currentModule.lessons[currentLessonIndex + 1];
            onSelectLesson(courseId, moduleId, nextLesson.id);
        } else if (hasNextModule && course) {
            const nextModule = course.modules[currentModuleIndex + 1];
            if (nextModule.lessons.length > 0) {
                onSelectLesson(courseId, nextModule.id, nextModule.lessons[0].id);
                // Expand next module
                setExpandedModules(prev => ({ ...prev, [nextModule.id]: true }));
            }
        }
    };

    const goToPreviousLesson = () => {
        if (hasPreviousLessonInModule && currentModule) {
            const prevLesson = currentModule.lessons[currentLessonIndex - 1];
            onSelectLesson(courseId, moduleId, prevLesson.id);
        } else if (hasPreviousModule && course) {
            const prevModule = course.modules[currentModuleIndex - 1];
            if (prevModule.lessons.length > 0) {
                const lastLesson = prevModule.lessons[prevModule.lessons.length - 1];
                onSelectLesson(courseId, prevModule.id, lastLesson.id);
                setExpandedModules(prev => ({ ...prev, [prevModule.id]: true }));
            }
        }
    };

    const toggleModule = (modId: string) => {
        setExpandedModules(prev => ({
            ...prev,
            [modId]: !prev[modId]
        }));
    };

    return (
        <div style={{ display: 'flex', gap: '2rem', maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{ flex: 1, minWidth: 0 }}
            >
                <button
                    className="btn btn-secondary"
                    onClick={onBack}
                    style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
                >
                    ← Voltar para o Dashboard
                </button>

                <h1 className="text-glow" style={{ marginBottom: '2rem', fontSize: '2.5rem', fontFamily: 'var(--font-display)' }}>
                    {lesson.title === 'Bem-vindo' && userName ? `Bem-vindo, ${userName}` : lesson.title}
                </h1>

                <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                    <VideoPlayer
                        key={lesson.id}
                        videoUrl={lesson.videoUrl}
                        onEnded={handleVideoEnded}
                    />

                    {/* Manual completion button for all videos */}
                    {!quizVisible && (
                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <button
                                className="btn"
                                onClick={handleVideoEnded}
                                style={{ padding: '0.75rem 2rem' }}
                            >
                                ✓ Marcar Aula como Concluída
                            </button>
                            {/* Removed text instruction as button is self-explanatory */}
                        </div>
                    )}

                    {lesson.content && (
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                            <h3 style={{ marginTop: 0, color: 'var(--secondary)' }}>Conteúdo da Aula</h3>
                            <p style={{ lineHeight: '1.8', color: 'var(--text-main)', fontSize: '1.1rem' }}>{lesson.content}</p>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    {hasPrevious && (
                        <button className="btn btn-secondary" onClick={goToPreviousLesson} style={{ flex: 1 }}>
                            ← Aula Anterior
                        </button>
                    )}
                    {hasNext && (
                        <button className="btn" onClick={goToNextLesson} style={{ flex: 1 }}>
                            Próxima Aula →
                        </button>
                    )}
                </div>

                <div className="glass-panel" style={{ padding: '0' }}>
                    {lesson.quizId ? (
                        <>
                            {!quizVisible && (
                                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🔒</div>
                                    <h3>Quiz Bloqueado</h3>
                                    <p>Assista a videoaula completa para liberar o quiz de conhecimentos.</p>
                                </div>
                            )}
                            {quizVisible && (
                                <QuizInterface
                                    quizId={lesson.quizId}
                                    userId={userId}
                                    isCompleted={isLessonCompleted}
                                    onComplete={(score) => {
                                        if (score >= 4) {
                                            onCompleteQuiz(score);
                                            setIsLessonCompleted(true);
                                        }
                                    }}
                                />
                            )}
                        </>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Nenhum quiz disponível para esta aula
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Sidebar with lesson list */}
            {course && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ width: '350px', flexShrink: 0 }}
                >
                    <div className="glass-panel" style={{ padding: '0', position: 'sticky', top: '2rem', maxHeight: 'calc(100vh - 4rem)', overflowY: 'auto' }}>

                        {course.modules.map((mod: CourseModule) => {
                            const isExpanded = expandedModules[mod.id];
                            const isActiveModule = mod.id === moduleId;

                            return (
                                <div key={mod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <button
                                        onClick={() => toggleModule(mod.id)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '1.2rem',
                                            background: isActiveModule ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        <span style={{ color: isActiveModule ? 'var(--primary)' : 'var(--secondary)' }}>
                                            {mod.title}
                                        </span>
                                        <span style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
                                            ▼
                                        </span>
                                    </button>

                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', padding: '0.5rem' }}>
                                                {mod.lessons.map((l) => {
                                                    const isCompleted = completedLessons.has(l.id);
                                                    const isCurrent = l.id === lesson.id;

                                                    return (
                                                        <button
                                                            key={l.id}
                                                            className={isCurrent ? "btn" : "btn btn-ghost"}
                                                            onClick={() => onSelectLesson(courseId, mod.id, l.id)}
                                                            style={{
                                                                justifyContent: 'flex-start',
                                                                padding: '0.75rem 1rem',
                                                                fontSize: '0.9rem',
                                                                opacity: isCurrent ? 1 : 0.7,
                                                                background: isCurrent ? 'var(--primary)' : 'transparent',
                                                                color: isCurrent ? 'white' : 'var(--text-muted)',
                                                                borderRadius: '0.5rem',
                                                                width: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.8rem',
                                                                textAlign: 'left'
                                                            }}
                                                        >
                                                            {/* Completion indicator */}
                                                            {isCompleted ? (
                                                                <span style={{ color: '#10b981', minWidth: '20px' }}>✓</span>
                                                            ) : (
                                                                <span style={{
                                                                    width: '8px',
                                                                    height: '8px',
                                                                    borderRadius: '50%',
                                                                    background: isCurrent ? 'white' : 'rgba(255,255,255,0.2)',
                                                                    marginLeft: '6px',
                                                                    marginRight: '6px'
                                                                }} />
                                                            )}

                                                            <span style={{ flex: 1 }}>
                                                                {l.title}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
};
