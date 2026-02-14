import React, { useEffect, useState } from 'react';
import { api, type Course, type Progress } from '../services/api';
import { motion } from 'framer-motion';

interface MyCoursesProps {
    userId: string;
    onSelectLesson: (courseId: string, moduleId: string, lessonId: string) => void;
    onBack: () => void;
    onViewCertificate: () => void;
}

export const MyCourses: React.FC<MyCoursesProps> = ({ userId, onSelectLesson, onBack, onViewCertificate }) => {
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

                                                // If all completed (should be caught by button text logic, but safe fallback), or none found, go to start
                            if (!nextLesson) {
                                // If completed, maybe go to first lesson to review? Or stay at last? 
                                // Let's go to first for now as per "REVER CURSO" logic or safety
                                onSelectLesson(course.id, course.modules[0].id, course.modules[0].lessons[0].id);
                                                } else {
                                onSelectLesson(course.id, nextModuleId!, nextLesson.id);
                                                }
                                            }}
                                        >
                            {isLocked ? 'Bloqueado' : (percent > 0 ? (percent === 100 ? 'REVER CURSO' : 'CONTINUAR JORNADA') : 'INICIAR MISSÃO')}
                        </button>
                    ) : (
                <button disabled className="btn btn-secondary" style={{ width: '100%' }}>Em Breve</button>
                                    )}

                {percent === 100 && (
                    <button
                        className="btn btn-secondary"
                        style={{ width: '100%', borderColor: 'var(--accent)', color: 'var(--accent)' }}
                        onClick={onViewCertificate}
                    >
                        📜 VER CERTIFICADO
                    </button>
                )}
        </div>
                            </div >
                        </motion.div >
                    );
                })}
            </motion.div >
        </div >
    );
};
