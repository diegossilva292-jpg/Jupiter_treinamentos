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
    const [currentModule, setCurrentModule] = React.useState<CourseModule | null>(null);

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
                    const foundModule = foundCourse.modules.find(m => m.id === moduleId);
                    setCurrentModule(foundModule || null);
                }
            } catch (error) {
                console.error("Erro ao carregar dados do curso:", error);
            }
        };

        if (courseId && moduleId) {
            loadCourseData();
        }
    }, [courseId, moduleId]);

    const handleVideoEnded = () => {
        setQuizVisible(true);
        onCompleteVideo();
    };

    // Find current lesson index and determine next/previous
    const currentLessonIndex = currentModule?.lessons.findIndex(l => l.id === lesson.id) ?? -1;
    const hasNext = currentModule && currentLessonIndex < currentModule.lessons.length - 1;
    const hasPrevious = currentLessonIndex > 0;

    const goToNextLesson = () => {
        if (hasNext && currentModule) {
            const nextLesson = currentModule.lessons[currentLessonIndex + 1];
            onSelectLesson(courseId, moduleId, nextLesson.id);
        }
    };

    const goToPreviousLesson = () => {
        if (hasPrevious && currentModule) {
            const prevLesson = currentModule.lessons[currentLessonIndex - 1];
            onSelectLesson(courseId, moduleId, prevLesson.id);
        }
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
                    <VideoPlayer videoUrl={lesson.videoUrl} onEnded={handleVideoEnded} />
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
            {currentModule && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ width: '300px', flexShrink: 0 }}
                >
                    <div className="glass-panel" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', color: 'var(--secondary)' }}>{currentModule.title}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {currentModule.lessons.map((l, idx) => (
                                <button
                                    key={l.id}
                                    className={l.id === lesson.id ? "btn" : "btn btn-secondary"}
                                    onClick={() => onSelectLesson(courseId, moduleId, l.id)}
                                    style={{
                                        justifyContent: 'flex-start',
                                        padding: '0.75rem 1rem',
                                        fontSize: '0.9rem',
                                        opacity: l.id === lesson.id ? 1 : 0.7,
                                        borderColor: l.id === lesson.id ? 'var(--primary)' : 'transparent'
                                    }}
                                >
                                    <span style={{ marginRight: '0.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>
                                        {idx + 1}.
                                    </span>
                                    {l.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
