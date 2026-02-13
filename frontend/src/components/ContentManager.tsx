import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '../services/api';
import type { Course, Lesson } from '../services/api';

// --- Sortable Item Components ---

const SortableItem = ({ id, children, style = {} }: { id: string, children: React.ReactNode, style?: React.CSSProperties }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const cssStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        ...style,
    };
    return (
        <div ref={setNodeRef} style={cssStyle} {...attributes} {...listeners}>
            {children}
        </div>
    );
};

// --- Main Component ---

interface ContentManagerProps {
    courses: Course[];
    onUpdate: () => void;
}

export const ContentManager: React.FC<ContentManagerProps> = ({ courses, onUpdate }) => {
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const selectedCourse = courses.find(c => c.id === selectedCourseId);

    const toggleModule = (moduleId: string) => {
        const newExpanded = new Set(expandedModules);
        if (newExpanded.has(moduleId)) {
            newExpanded.delete(moduleId);
        } else {
            newExpanded.add(moduleId);
        }
        setExpandedModules(newExpanded);
    };

    const handleDragEndModule = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !selectedCourse) return;

        const oldIndex = selectedCourse.modules.findIndex(m => m.id === active.id);
        const newIndex = selectedCourse.modules.findIndex(m => m.id === over.id);

        const newOrder = arrayMove(selectedCourse.modules, oldIndex, newIndex);

        try {
            await api.reorderModules(selectedCourse.id, newOrder.map((m: any) => m.id));
            onUpdate();
        } catch (error) {
            console.error("Failed to reorder modules", error);
            alert("Erro ao salvar ordem dos módulos.");
        }
    };

    const handleDragEndLesson = async (event: DragEndEvent, moduleId: string) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !selectedCourse) return;

        const module = selectedCourse.modules.find(m => m.id === moduleId);
        if (!module) return;

        const oldIndex = module.lessons.findIndex(l => l.id === active.id);
        const newIndex = module.lessons.findIndex(l => l.id === over.id);

        const newOrder = arrayMove(module.lessons, oldIndex, newIndex);

        try {
            await api.reorderLessons(selectedCourse.id, moduleId, newOrder.map((l: Lesson) => l.id));
            onUpdate();
        } catch (error) {
            console.error("Failed to reorder lessons", error);
            alert("Erro ao salvar ordem das aulas.");
        }
    }

    // ========== CRUD HANDLERS ==========

    const handleEditModule = async (moduleId: string, currentTitle: string) => {
        const newTitle = prompt("Novo nome do módulo:", currentTitle);
        if (!newTitle || !selectedCourse) return;

        try {
            await api.updateModule(selectedCourse.id, moduleId, { title: newTitle });
            onUpdate();
            alert("Módulo atualizado!");
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar módulo");
        }
    };

    const handleDeleteModule = async (moduleId: string, moduleTitle: string) => {
        if (!confirm(`Tem certeza que deseja deletar o módulo "${moduleTitle}"?`)) return;
        if (!selectedCourse) return;

        try {
            await api.deleteModule(selectedCourse.id, moduleId);
            onUpdate();
            alert("Módulo deletado!");
        } catch (error) {
            console.error(error);
            alert("Erro ao deletar módulo");
        }
    };

    const handleEditLesson = async (moduleId: string, lessonId: string, currentTitle: string, currentVideoUrl: string) => {
        const newTitle = prompt("Novo título da aula:", currentTitle);
        if (!newTitle) return;

        const newVideoUrl = prompt("Nova URL do vídeo:", currentVideoUrl);
        if (!newVideoUrl) return;

        if (!selectedCourse) return;

        try {
            await api.updateLesson(selectedCourse.id, moduleId, lessonId, {
                title: newTitle,
                videoUrl: newVideoUrl
            });
            onUpdate();
            alert("Aula atualizada!");
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar aula");
        }
    };

    const handleDeleteLesson = async (moduleId: string, lessonId: string, lessonTitle: string) => {
        if (!confirm(`Deletar a aula "${lessonTitle}"?`)) return;
        if (!selectedCourse) return;

        try {
            await api.deleteLesson(selectedCourse.id, moduleId, lessonId);
            onUpdate();
            alert("Aula deletada!");
        } catch (error) {
            console.error(error);
            alert("Erro ao deletar aula");
        }
    };

    return (
        <div style={{ padding: '1rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1.5rem' }}>Organizar Conteúdo</h2>

            <div style={{ marginBottom: '2rem' }}>
                <label htmlFor="course-select" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    Selecione o Curso
                </label>
                <select
                    id="course-select"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    style={{
                        padding: '0.8rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-main)',
                        fontSize: '1rem',
                        width: '100%',
                        maxWidth: '400px'
                    }}
                >
                    <option value="">-- Escolha o Curso --</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                </select>
            </div>

            {selectedCourse && (
                <div>
                    <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Módulos (Arraste para reordenar)</h3>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndModule}>
                        <SortableContext items={selectedCourse.modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {selectedCourse.modules.map(module => (
                                    <SortableItem key={module.id} id={module.id} style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--glass-border)',
                                        cursor: 'grab'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>☰</span>
                                                <span style={{ fontWeight: 'bold' }}>{module.title}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleEditModule(module.id, module.title); }}
                                                    onPointerDown={e => e.stopPropagation()}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem' }}
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDeleteModule(module.id, module.title); }}
                                                    onPointerDown={e => e.stopPropagation()}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem', background: '#ef4444' }}
                                                >
                                                    🗑️ Deletar
                                                </button>
                                                <button
                                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); toggleModule(module.id); }}
                                                    onPointerDown={e => e.stopPropagation()}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem' }}
                                                >
                                                    {expandedModules.has(module.id) ? 'Recolher' : 'Expandir Aulas'}
                                                </button>
                                            </div>
                                        </div>

                                        {expandedModules.has(module.id) && (
                                            <div style={{ marginTop: '1rem', paddingLeft: '2rem', borderLeft: '2px solid var(--glass-border)' }}>
                                                <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Aulas</h4>
                                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e: DragEndEvent) => handleDragEndLesson(e, module.id)}>
                                                    <SortableContext items={module.lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                            {module.lessons.length > 0 ? module.lessons.map(lesson => (
                                                                <SortableItem key={lesson.id} id={lesson.id} style={{
                                                                    background: 'rgba(0,0,0,0.2)',
                                                                    padding: '0.8rem',
                                                                    borderRadius: 'var(--radius-sm)',
                                                                    cursor: 'grab',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    gap: '0.8rem'
                                                                }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                                        <span style={{ opacity: 0.5 }}>::</span>
                                                                        <span>{lesson.title}</span>
                                                                        {lesson.quizId && <span style={{ fontSize: '0.8rem', background: 'var(--primary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Quiz</span>}
                                                                    </div>
                                                                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                                        <button
                                                                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleEditLesson(module.id, lesson.id, lesson.title, lesson.videoUrl); }}
                                                                            onPointerDown={e => e.stopPropagation()}
                                                                            className="btn btn-secondary"
                                                                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                                                        >
                                                                            ✏️
                                                                        </button>
                                                                        <button
                                                                            onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDeleteLesson(module.id, lesson.id, lesson.title); }}
                                                                            onPointerDown={e => e.stopPropagation()}
                                                                            className="btn btn-secondary"
                                                                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: '#ef4444' }}
                                                                        >
                                                                            🗑️
                                                                        </button>
                                                                    </div>
                                                                </SortableItem>
                                                            )) : (
                                                                <p style={{ fontStyle: 'italic', opacity: 0.5 }}>Nenhuma aula neste módulo</p>
                                                            )}
                                                        </div>
                                                    </SortableContext>
                                                </DndContext>
                                            </div>
                                        )}
                                    </SortableItem>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}
        </div>
    );
};
