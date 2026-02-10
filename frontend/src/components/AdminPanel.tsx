import React, { useState, useEffect } from 'react';
import { api, type Course, type User } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminPanelProps {
    onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'create-course' | 'add-lesson' | 'register-user'>('create-course');

    // Form States - Create Course
    const [newCourseTitle, setNewCourseTitle] = useState('');
    const [newCourseDesc, setNewCourseDesc] = useState('');

    // Form States - Add Lesson
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonVideoUrl, setLessonVideoUrl] = useState('');
    const [lessonContent, setLessonContent] = useState('');
    const [uploading, setUploading] = useState(false);
    const [videoSourceType, setVideoSourceType] = useState<'youtube' | 'upload'>('youtube');

    // Form States - Register User
    const [newUserName, setNewUserName] = useState('');
    const [newUserRole, setNewUserRole] = useState<'admin' | 'student'>('student');

    // Quiz State
    const [includeQuiz, setIncludeQuiz] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState(Array(5).fill(null).map(() => ({
        text: '',
        options: ['', '', ''],
        correctOptionIndex: 0
    })));

    const updateQuizQuestion = (index: number, field: string, value: any) => {
        const newQuestions = [...quizQuestions];
        // @ts-ignore
        newQuestions[index][field] = value;
        setQuizQuestions(newQuestions);
    };

    useEffect(() => {
        loadCourses();
        loadUsers();
    }, []);

    const loadCourses = async () => {
        const data = await api.getCourses();
        setCourses(data);
    };

    const loadUsers = async () => {
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        }
    };

    // ... (handlers)

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('http://localhost:3000/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newCourseTitle, description: newCourseDesc })
            });
            alert('Curso criado com sucesso!');
            setNewCourseTitle('');
            setNewCourseDesc('');
            loadCourses();
        } catch (error) {
            console.error(error);
            alert('Erro ao criar curso');
        }
    };

    const handleAddLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourseId || !selectedModuleId) return;

        try {
            let quizId = undefined;

            if (includeQuiz) {
                // Create Quiz First
                const quiz = await api.createQuiz({
                    questions: quizQuestions
                });
                quizId = quiz.id;
            }

            await fetch(`http://localhost:3000/courses/${selectedCourseId}/modules/${selectedModuleId}/lessons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: lessonTitle,
                    videoUrl: lessonVideoUrl,
                    content: lessonContent,
                    quizId
                })
            });
            alert('Aula adicionada com sucesso!');
            setLessonTitle('');
            setLessonVideoUrl('');
            setLessonContent('');
            setIncludeQuiz(false);
            setQuizQuestions(Array(5).fill(null).map(() => ({
                text: '',
                options: ['', '', ''],
                correctOptionIndex: 0
            })));
        } catch (error) {
            console.error(error);
            alert('Erro ao adicionar aula');
        }
    };

    const handleRegisterUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createUser({
                name: newUserName,
                role: newUserRole,
                xp: 0
            });
            alert('Usuário cadastrado com sucesso!');
            setNewUserName('');
            setNewUserRole('student');
            loadUsers();
        } catch (error) {
            console.error(error);
            alert('Erro ao cadastrar usuário');
        }
    };

    // Helper to get modules of selected course
    const selectedCourse = courses.find(c => c.id === selectedCourseId);

    // Auto-create module if course has none (Mock convenience)
    const ensureModule = async (courseId: string) => {
        const c = courses.find(x => x.id === courseId);
        if (c && c.modules.length === 0) {
            await fetch(`http://localhost:3000/courses/${courseId}/modules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'Módulo 1' })
            });
            loadCourses();
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '0.8rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--glass-border)',
        background: 'rgba(0,0,0,0.3)',
        color: 'var(--text-main)',
        outline: 'none',
        marginTop: '0.5rem',
        boxSizing: 'border-box' as const,
        transition: 'border-color 0.2s',
        fontSize: '1rem'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}
        >
            <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
                ← Voltar
            </button>
            <h1 className="text-glow" style={{ marginBottom: '2rem', fontFamily: 'var(--font-display)' }}>Painel Administrativo 🛠️</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    className={`btn ${activeTab === 'create-course' ? '' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('create-course')}
                    style={activeTab === 'create-course' ? { boxShadow: '0 0 15px var(--primary-glow)' } : {}}
                >
                    Criar Novo Curso
                </button>
                <button
                    className={`btn ${activeTab === 'add-lesson' ? '' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('add-lesson')}
                    style={activeTab === 'add-lesson' ? { boxShadow: '0 0 15px var(--primary-glow)' } : {}}
                >
                    Adicionar Aulas
                </button>
                <button
                    className={`btn ${activeTab === 'register-user' ? '' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('register-user')}
                    style={activeTab === 'register-user' ? { boxShadow: '0 0 15px var(--primary-glow)' } : {}}
                >
                    Cadastrar Colaborador
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'create-course' && (
                    <motion.div
                        key="create-course"
                        className="glass-panel"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        style={{ padding: '2rem' }}
                    >
                        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Nova Trilha (Curso)</h2>
                        <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ color: 'var(--text-muted)' }}>Nome do Curso</label>
                                <input
                                    type="text"
                                    value={newCourseTitle}
                                    onChange={e => setNewCourseTitle(e.target.value)}
                                    required
                                    style={inputStyle}
                                    placeholder="Ex: Introdução à Segurança"
                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                                />
                            </div>
                            <div>
                                <label style={{ color: 'var(--text-muted)' }}>Descrição</label>
                                <textarea
                                    value={newCourseDesc}
                                    onChange={e => setNewCourseDesc(e.target.value)}
                                    required
                                    rows={4}
                                    style={inputStyle}
                                    placeholder="Breve descrição do conteúdo..."
                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                                />
                            </div>
                            <button type="submit" className="btn" style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem' }}>Criar Curso</button>
                        </form>

                        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                            <h3 style={{ color: 'var(--text-main)' }}>Cursos Existentes</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                {courses.map(course => (
                                    <div key={course.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold' }}>{course.title}</span>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Tem certeza que deseja excluir o curso "${course.title}"?`)) {
                                                    try {
                                                        await api.deleteCourse(course.id);
                                                        loadCourses();
                                                    } catch (error) {
                                                        console.error('Erro ao excluir:', error);
                                                        alert('Erro ao excluir o curso. Verifique o console para mais detalhes.');
                                                    }
                                                }
                                            }}
                                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'add-lesson' && (
                    <motion.div
                        key="add-lesson"
                        className="glass-panel"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        style={{ padding: '2rem' }}
                    >
                        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Adicionar Aula a um Curso</h2>
                        <form onSubmit={handleAddLesson} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ color: 'var(--text-muted)' }}>Selecione o Curso</label>
                                <select
                                    value={selectedCourseId}
                                    onChange={e => {
                                        setSelectedCourseId(e.target.value);
                                        ensureModule(e.target.value);
                                        setSelectedModuleId('');
                                    }}
                                    style={inputStyle}
                                    required
                                >
                                    <option value="" style={{ background: '#1a1b3c' }}>Selecione...</option>
                                    {courses.map(c => <option key={c.id} value={c.id} style={{ background: '#1a1b3c' }}>{c.title}</option>)}
                                </select>
                            </div>

                            {selectedCourse && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                    <label style={{ color: 'var(--text-muted)' }}>Selecione o Módulo</label>
                                    <select
                                        value={selectedModuleId}
                                        onChange={e => setSelectedModuleId(e.target.value)}
                                        style={inputStyle}
                                        required
                                    >
                                        <option value="" style={{ background: '#1a1b3c' }}>Selecione...</option>
                                        {selectedCourse.modules.map(m => <option key={m.id} value={m.id} style={{ background: '#1a1b3c' }}>{m.title}</option>)}
                                    </select>
                                    {selectedCourse.modules.length === 0 && <small style={{ color: 'var(--accent)' }}>Criando módulo padrão...</small>}
                                </motion.div>
                            )}

                            <div>
                                <label style={{ color: 'var(--text-muted)' }}>Título da Aula</label>
                                <input
                                    type="text"
                                    value={lessonTitle}
                                    onChange={e => setLessonTitle(e.target.value)}
                                    style={inputStyle}
                                    required
                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                                />
                            </div>
                            <div>
                                <label style={{ color: 'var(--text-muted)' }}>Fonte do Vídeo</label>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <label style={{ cursor: 'pointer', color: 'var(--text-main)' }}>
                                        <input
                                            type="radio"
                                            checked={videoSourceType === 'youtube'}
                                            onChange={() => setVideoSourceType('youtube')}
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        YouTube
                                    </label>
                                    <label style={{ cursor: 'pointer', color: 'var(--text-main)' }}>
                                        <input
                                            type="radio"
                                            checked={videoSourceType === 'upload'}
                                            onChange={() => setVideoSourceType('upload')}
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        Upload de Arquivo (Flussonic)
                                    </label>
                                </div>

                                {videoSourceType === 'youtube' ? (
                                    <input
                                        type="url"
                                        placeholder="https://www.youtube.com/embed/..."
                                        value={lessonVideoUrl}
                                        onChange={e => setLessonVideoUrl(e.target.value)}
                                        style={inputStyle}
                                        required={videoSourceType === 'youtube'}
                                        onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                        onBlur={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                                    />
                                ) : (
                                    <div>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setUploading(true);
                                                    try {
                                                        const url = await api.uploadVideo(file);
                                                        setLessonVideoUrl(url);
                                                        alert('Upload concluído com sucesso!');
                                                    } catch (error) {
                                                        console.error(error);
                                                        alert('Erro no upload do vídeo.');
                                                    } finally {
                                                        setUploading(false);
                                                    }
                                                }
                                            }}
                                            style={{ ...inputStyle, padding: '0.5rem' }}
                                            required={videoSourceType === 'upload' && !lessonVideoUrl}
                                        />
                                        {uploading && <p style={{ color: 'var(--accent)', marginTop: '0.5rem' }}>Enviando vídeo... Aguarde...</p>}
                                        {lessonVideoUrl && videoSourceType === 'upload' && !uploading && (
                                            <p style={{ color: 'var(--primary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                                Vídeo pronto: {lessonVideoUrl}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={{ color: 'var(--text-muted)' }}>Conteúdo (Texto/Resumo)</label>
                                <textarea
                                    value={lessonContent}
                                    onChange={e => setLessonContent(e.target.value)}
                                    style={inputStyle}
                                    rows={4}
                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                                />
                            </div>

                            {/* Quiz Creation Section */}
                            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--primary)', fontWeight: 'bold' }}>
                                    <input
                                        type="checkbox"
                                        checked={includeQuiz}
                                        onChange={e => setIncludeQuiz(e.target.checked)}
                                    />
                                    Incluir Quiz (5 Perguntas)
                                </label>

                                {includeQuiz && (
                                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        {quizQuestions.map((q, index) => (
                                            <div key={index} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--secondary)' }}>Pergunta {index + 1}</h4>

                                                <input
                                                    type="text"
                                                    placeholder="Enunciado da pergunta"
                                                    value={q.text}
                                                    onChange={e => updateQuizQuestion(index, 'text', e.target.value)}
                                                    style={{ ...inputStyle, marginBottom: '0.5rem' }}
                                                    required
                                                />

                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {q.options.map((opt, optIndex) => (
                                                        <div key={optIndex} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                            <input
                                                                type="text"
                                                                placeholder={`Opção ${optIndex + 1}`}
                                                                value={opt}
                                                                onChange={e => {
                                                                    const newOptions = [...q.options];
                                                                    newOptions[optIndex] = e.target.value;
                                                                    updateQuizQuestion(index, 'options', newOptions);
                                                                }}
                                                                style={{ ...inputStyle, marginTop: 0, fontSize: '0.9rem' }}
                                                                required
                                                            />
                                                            <input
                                                                type="radio"
                                                                name={`correct-${index}`}
                                                                checked={q.correctOptionIndex === optIndex}
                                                                onChange={() => updateQuizQuestion(index, 'correctOptionIndex', optIndex)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="btn" disabled={!selectedCourseId || !selectedModuleId} style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem' }}>
                                Adicionar Aula
                            </button>
                        </form>
                    </motion.div>
                )}

                {activeTab === 'register-user' && (
                    <motion.div
                        key="register-user"
                        className="glass-panel"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        style={{ padding: '2rem' }}
                    >
                        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Cadastrar Novo Colaborador</h2>
                        <form onSubmit={handleRegisterUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ color: 'var(--text-muted)' }}>Nome do Usuário</label>
                                <input
                                    type="text"
                                    value={newUserName}
                                    onChange={e => setNewUserName(e.target.value)}
                                    required
                                    style={inputStyle}
                                    placeholder="Ex: joao.silva"
                                    onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onBlur={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                                />
                            </div>
                            <div>
                                <label style={{ color: 'var(--text-muted)' }}>Função</label>
                                <select
                                    value={newUserRole}
                                    onChange={e => setNewUserRole(e.target.value as 'admin' | 'student')}
                                    style={inputStyle}
                                >
                                    <option value="student" style={{ background: '#1a1b3c' }}>Aluno / Colaborador</option>
                                    <option value="admin" style={{ background: '#1a1b3c' }}>Administrador / Desenvolvedor</option>
                                </select>
                            </div>
                            <button type="submit" className="btn" style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem' }}>
                                Cadastrar
                            </button>
                        </form>

                        <div style={{ marginTop: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                            <h3 style={{ color: 'var(--text-main)' }}>Colaboradores Cadastrados</h3>
                            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                                {Array.isArray(users) && users.map(user => (
                                    <div key={user.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontWeight: 'bold', display: 'block' }}>{user.name}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user.role === 'admin' ? 'Administrador' : 'Aluno'} | XP: {user.xp || 0}</span>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) {
                                                    try {
                                                        await api.deleteUser(user.id);
                                                        loadUsers();
                                                    } catch (error) {
                                                        console.error('Erro ao excluir:', error);
                                                        alert('Erro ao excluir usuário. Verifique se ele não tem dependências.');
                                                    }
                                                }
                                            }}
                                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
