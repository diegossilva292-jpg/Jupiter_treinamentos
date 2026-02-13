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
            api.getCourses(),
            api.getProgress(userId)
        ])
            .then(([coursesData, progressData]) => {
                console.log('[MyCourses] Loaded courses:', coursesData);
                console.log('[MyCourses] Total courses:', coursesData.length);
                coursesData.forEach((course, idx) => {
                    console.log(`[MyCourses] Course ${idx + 1}: ${course.title}, Modules: ${course.modules.length}`);
                    course.modules.forEach((module, mIdx) => {
                        console.log(`  Module ${mIdx + 1}: ${module.title}, Lessons: ${module.lessons.length}`);
                        module.lessons.forEach((lesson, lIdx) => {
                            console.log(`    Lesson ${lIdx + 1}: ${lesson.title}, Video: ${lesson.videoUrl}`);
                        });
                    });
                });
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

                    // Locking Logic
                    let isLocked = false;
                    if (index > 0) {
                        const prevCourse = courses[index - 1];
                        const prevLessonIds = new Set(prevCourse.modules.flatMap(m => m.lessons.map(l => l.id)));
                        const isPrevCompleted = progressList.some(p => prevLessonIds.has(p.lessonId) && p.status === 'COMPLETED');
                        if (!isPrevCompleted) isLocked = true;
                    }

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
                                opacity: isLocked ? 0.6 : 1,
                                filter: isLocked ? 'grayscale(0.8)' : 'none',
                                cursor: isLocked ? 'not-allowed' : 'default',
                                padding: '0',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}
                            whileHover={!isLocked ? { translateY: -5, borderColor: 'var(--primary)', boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)' } : {}}
                        >
                            <div style={{ height: '140px', background: gradient, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', position: 'relative' }}>
                                <div style={{ zIndex: 1 }}>{isLocked ? '🔒' : '🎓'}</div>
                                {/* Background pattern inside card header */}
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '10px 10px', opacity: 0.3 }}></div>

                                {!isLocked && (
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: 'rgba(0,0,0,0.5)' }}>
                                        <div style={{ width: `${percent}%`, height: '100%', background: 'var(--success)', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 10px var(--success)' }}></div>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>{course.title}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    <span>{isLocked ? 'Bloqueado' : 'Progresso'}</span>
                                    <span style={{ color: percent === 100 ? 'var(--success)' : 'inherit', fontWeight: 'bold' }}>{isLocked ? '' : `${percent}%`}</span>
                                </div>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)', flex: 1, lineHeight: '1.5' }}>{course.description}</p>

                                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {course.modules[0]?.lessons[0] ? (
                                        <button
                                            className="btn"
                                            style={{ width: '100%', background: isLocked ? '#4b5563' : undefined, cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.5 : 1 }}
                                            disabled={isLocked}
                                            onClick={() => {
                                                if (isLocked) return;

                                                // Find the first lesson that is NOT completed
                                                let nextLesson = null;
                                                let nextModuleId = null;

                                                for (const module of course.modules) {
                                                    for (const lesson of module.lessons) {
                                                        const isCompleted = progressList.some(p => p.lessonId === lesson.id && p.status === 'COMPLETED');
                                                        if (!isCompleted) {
                                                            nextLesson = lesson;
                                                            nextModuleId = module.id;
                                                            break;
                                                        }
                                                    }
                                                    if (nextLesson) break;
                                                }

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
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};
