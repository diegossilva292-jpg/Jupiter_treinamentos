export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3336';

export interface User {
    id: string;
    name: string;
    role: 'admin' | 'student';
    xp?: number;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    modules: CourseModule[];
}

export interface CourseModule {
    id: string;
    title: string;
    lessons: Lesson[];
}

export interface Lesson {
    id: string;
    title: string;
    videoUrl: string;
    content?: string;
    quizId?: string;
}

export interface Progress {
    userId: string;
    lessonId: string;
    status: 'COMPLETED' | 'PENDING';
    attempts?: number;
    score?: number;
}

export interface Certificate {
    id: string;
    userId: string;
    courseId: string;
    courseTitle: string;
    userName: string;
    issuedAt: string;
}

export interface AuthResponse {
    accessToken: string;
    user: {
        id: string;
        nome: string;
        usuario: string;
        email: string;
        avatar: string;
        xp?: number;
        role?: 'admin' | 'student';
    };
}

export interface QuizQuestion {
    id: string;
    text: string;
    options: string[];
    correctOptionIndex: number;
}

export interface Quiz {
    id: string;
    questions: QuizQuestion[];
    passingScore: number;
}

export const setToken = (token: string) => localStorage.setItem('authToken', token);
export const getToken = () => localStorage.getItem('authToken');
export const removeToken = () => localStorage.removeItem('authToken');

export const api = {
    getUser: async (id: string): Promise<User> => {
        const res = await fetch(`${API_URL}/users/${id}`);
        return res.json();
    },
    updateXP: async (userId: string, amount: number): Promise<void> => {
        await fetch(`${API_URL}/users/${userId}/xp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount }),
        });
    },
    getRanking: async (): Promise<User[]> => {
        const res = await fetch(`${API_URL}/users/ranking`);
        return res.json();
    },
    getQuiz: async (id: string): Promise<Quiz> => {
        const res = await fetch(`${API_URL}/quizzes/${id}`);
        return res.json();
    },
    login: async (usuario: string, senha: string): Promise<AuthResponse> => {
        const res = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ usuario, senha }),
        });

        if (!res.ok) {
            throw new Error('Falha na autenticação');
        }

        return res.json();
    },
    getUsers: async (): Promise<User[]> => {
        const res = await fetch(`${API_URL}/users`);
        return res.json();
    },
    createUser: async (user: Omit<User, 'id'>): Promise<User> => {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...user, id: user.name, xp: 0 }), // Simple ID gen
        });
        return res.json();
    },
    getCourses: async (): Promise<Course[]> => {
        const res = await fetch(`${API_URL}/courses`);
        return res.json();
    },
    markProgress: async (userId: string, lessonId: string): Promise<Progress> => {
        const res = await fetch(`${API_URL}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, lessonId }),
        });
        return res.json();
    },
    recordQuizAttempt: async (userId: string, lessonId: string, score: number): Promise<Progress> => {
        const res = await fetch(`${API_URL}/progress/attempt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, lessonId, score }),
        });
        return res.json();
    },
    // Admin Methods
    createCourse: async (data: { title: string, description: string }): Promise<Course> => {
        const res = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Falha ao criar curso: ${res.statusText}`);
        return res.json();
    },
    addModule: async (courseId: string, title: string): Promise<CourseModule> => {
        const res = await fetch(`${API_URL}/courses/${courseId}/modules`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ title }),
        });
        if (!res.ok) throw new Error(`Falha ao criar módulo: ${res.statusText}`);
        return res.json();
    },
    addLesson: async (courseId: string, moduleId: string, data: any): Promise<Lesson> => {
        const res = await fetch(`${API_URL}/courses/${courseId}/modules/${moduleId}/lessons`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Falha ao adicionar aula: ${res.statusText}`);
        return res.json();
    },
    reorderModules: async (courseId: string, moduleIds: string[]): Promise<void> => {
        const res = await fetch(`${API_URL}/courses/${courseId}/modules/reorder`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ moduleIds }),
        });
        if (!res.ok) throw new Error(`Falha ao reordenar módulos: ${res.statusText}`);
    },
    reorderLessons: async (courseId: string, moduleId: string, lessonIds: string[]): Promise<void> => {
        const res = await fetch(`${API_URL}/courses/${courseId}/modules/${moduleId}/lessons/reorder`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ lessonIds }),
        });
        if (!res.ok) throw new Error(`Falha ao reordenar aulas: ${res.statusText}`);
    },
    deleteCourse: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/courses/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        if (!res.ok) {
            throw new Error(`Falha ao excluir curso: ${res.statusText}`);
        }
    },
    createQuiz: async (quiz: any): Promise<Quiz> => {
        const res = await fetch(`${API_URL}/quizzes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(quiz),
        });
        return res.json();
    },
    getProgress: async (userId: string): Promise<Progress[]> => {
        const res = await fetch(`${API_URL}/progress/${userId}`);
        return res.json();
    },
    getAllProgress: async (): Promise<Progress[]> => {
        const res = await fetch(`${API_URL}/progress`);
        return res.json();
    },
    getCertificates: async (userId: string): Promise<Certificate[]> => {
        const res = await fetch(`${API_URL}/certificates/${userId}`);
        return res.json();
    },
    deleteUser: async (id: string): Promise<void> => {
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        if (!res.ok) {
            throw new Error(`Falha ao excluir usuário: ${res.statusText}`);
        }
    },

    // ========== NEW CRUD METHODS ==========

    /**
     * Update course details
     */
    updateCourse: async (courseId: string, data: Partial<Course>): Promise<Course> => {
        const res = await fetch(`${API_URL}/courses/${courseId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Falha ao atualizar curso: ${res.statusText}`);
        return res.json();
    },

    /**
     * Update module details
     */
    updateModule: async (courseId: string, moduleId: string, data: any): Promise<any> => {
        const res = await fetch(`${API_URL}/courses/${courseId}/modules/${moduleId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Falha ao atualizar módulo: ${res.statusText}`);
        return res.json();
    },

    /**
     * Delete a module
     */
    deleteModule: async (courseId: string, moduleId: string): Promise<void> => {
        const res = await fetch(`${API_URL}/courses/${courseId}/modules/${moduleId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        if (!res.ok) throw new Error(`Falha ao deletar módulo: ${res.statusText}`);
    },

    /**
     * Update lesson details
     */
    updateLesson: async (courseId: string, moduleId: string, lessonId: string, data: any): Promise<any> => {
        const res = await fetch(`${API_URL}/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Falha ao atualizar aula: ${res.statusText}`);
        return res.json();
    },

    /**
     * Delete a lesson
     */
    deleteLesson: async (courseId: string, moduleId: string, lessonId: string): Promise<void> => {
        const res = await fetch(`${API_URL}/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
        if (!res.ok) throw new Error(`Falha ao deletar aula: ${res.statusText}`);
    },

    uploadVideo: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const token = getToken();

        const res = await fetch(`${API_URL}/uploads`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });

        if (!res.ok) {
            throw new Error(`Falha ao enviar vídeo: ${res.statusText}`);
        }

        const data = await res.json();
        return data.url;
    },
};
