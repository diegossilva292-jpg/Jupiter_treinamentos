import React, { useEffect, useState } from 'react';
import { api, type Course, type Progress } from '../services/api';
import { motion } from 'framer-motion';

interface MyCoursesProps {
    userId: string;
    onSelectLesson: (courseId: string, moduleId: string, lessonId: string) => void;
    onBack: () => void;
    onViewCertificate: () => void;
}

export const CoursesList: React.FC<MyCoursesProps> = ({ userId, onSelectLesson, onBack, onViewCertificate }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [progressList, setProgressList] = useState<Progress[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getCoursesForUser(userId),
            api.getProgress(userId)
        ])
            .then(([coursesData, progressData]) => {
                console.log('[MyCourses] Loaded courses:', coursesData);
                setCourses(coursesData);
                setProgressList(progressData);
            })
            .catch(err => console.error("Erro ao carregar dados:", err))
            .finally(() => setLoading(false));
    }, [userId]);

    const getCourseProgress = (course: Course) => {
        const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
        if (totalLessons === 0) return 0;

        const courseLessonIds = new Set(course.modules.flatMap(m => m.lessons.map(l => l.id)));
        const completedCount = progressList.filter(p => courseLessonIds.has(p.lessonId) && p.status === 'COMPLETED').length;

        return Math.round((completedCount / totalLessons) * 100);
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}><div className="animate-pulse-glow">Carregando universos...</div></div>;
    }

    if (courses.length === 0) {
        return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>Nenhum curso encontrado.</div>;
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h1 className="text-glow" style={{ margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>MEUS CURSOS 📚</h1>
                <button
                    className="btn btn-secondary"
                    onClick={onBack}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    ← Voltar para Home
                </button>
            </div>

            <motion.div
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}
            >
                {courses.map((course, index) => {
                    // Generate a unique hue for each course
                    const hue = (index * 40 + 200) % 360; // Adjusted base hue for cooler colors
                    const gradient = `linear-gradient(135deg, hsla(${hue}, 70%, 25%, 0.8), hsla(${hue + 40}, 70%, 15%, 0.8))`;
                    const percent = getCourseProgress(course);

                    return (
                        <motion.div
                            key={course.id}
                            className="glass-panel"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 }
                            }}
                            style={{
                                display: 'flex', flexDirection: 'column',
                                background: gradient,
                                border: '1px solid rgba(255,255,255,0.1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            whileHover={{ translateY: -5, borderColor: 'var(--primary)', boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)' }}
                        >
                            <div style={{ padding: '2rem', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '3rem' }}>🎓</div>
                                    <div style={{ zIndex: 1, opacity: 0.5, fontSize: '1.5rem' }}>#{index + 1}</div>
                                </div>

                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                    {course.title}
                                </h2>
                                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {course.description}
                                </p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
                                    <span>Progresso</span>
                                    <span style={{ color: percent === 100 ? 'var(--success)' : 'inherit', fontWeight: 'bold' }}>{`${percent}%`}</span>
                                </div>

                                <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        style={{ height: '100%', background: percent === 100 ? 'var(--success)' : 'var(--primary)', borderRadius: '3px', boxShadow: '0 0 10px currentColor' }}
                                    />
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem', paddingTop: 0 }}>
                                {course.modules.length > 0 && course.modules[0].lessons.length > 0 ? (
                                    <button
                                        className="btn"
                                        style={{ width: '100%', borderRadius: 0, padding: '1.2rem', marginTop: 'auto', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(5px)', borderTop: '1px solid rgba(255,255,255,0.1)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.875rem', fontWeight: 'bold' }}
                                        onClick={() => {
                                            // Find first uncompleted lesson
                                            let nextLessonId = course.modules[0].lessons[0].id;
                                            let nextModuleId = course.modules[0].id;
                                            let foundUncompleted = false;

                                            for (const mod of course.modules) {
                                                if (foundUncompleted) break;
                                                for (const lesson of mod.lessons) {
                                                    const isCompleted = progressList.some(p => p.lessonId === lesson.id && p.status === 'COMPLETED');
                                                    if (!isCompleted) {
                                                        nextLessonId = lesson.id;
                                                        nextModuleId = mod.id;
                                                        foundUncompleted = true;
                                                        break;
                                                    }
                                                }
                                            }
                                            // Fallback if all completed (revisit first) or default
                                            onSelectLesson(course.id, nextModuleId, nextLessonId);
                                        }}
                                    >
                                        {percent > 0 ? (percent === 100 ? 'REVER CURSO' : 'CONTINUAR JORNADA') : 'INICIAR MISSÃO'}
                                    </button>
                                ) : (
                                    <button disabled className="btn btn-secondary" style={{ width: '100%' }}>Em Breve</button>
                                )}

                                {percent === 100 && (
                                    <button
                                        className="btn btn-secondary"
                                        style={{ width: '100%', marginTop: '0.5rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}
                                        onClick={onViewCertificate}
                                    >
                                        📜 VER CERTIFICADO
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};
