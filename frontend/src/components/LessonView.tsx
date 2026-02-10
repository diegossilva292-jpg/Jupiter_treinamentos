import React from 'react';
import { api, type Lesson } from '../services/api';
import { VideoPlayer } from './VideoPlayer';
import { QuizInterface } from './QuizInterface';
import { motion } from 'framer-motion';

interface LessonViewProps {
    lesson: Lesson;
    userId: string;
    userName?: string;
    onBack: () => void;
    onCompleteVideo: () => void;
    onCompleteQuiz: (score: number) => void;
}



export const LessonView: React.FC<LessonViewProps> = ({ lesson, userId, userName, onBack, onCompleteVideo, onCompleteQuiz }) => {
    const [quizVisible, setQuizVisible] = React.useState(false);
    const [isLessonCompleted, setIsLessonCompleted] = React.useState(false);

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

    const handleVideoEnded = () => {
        setQuizVisible(true);
        onCompleteVideo();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}
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
                        <p>Esta aula não possui missão interativa (quiz).</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
