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

        // Optimistic UI update (optional, but good for UX)
        // For now, we rely on the API call and parent refresh, 
        // but we could locally mutate for instant feedback.

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

    return (
        <div style={{ padding: '1rem' }}>
            <h2 style={{ color: 'var(--text-main)', marginBottom: '1.5rem' }}>Organizar Conteúdo</h2>

            <div style={{ marginBottom: '2rem' }}>
                <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Selecione o Curso para Organizar</label>
                <select
                    value={selectedCourseId}
                    onChange={e => setSelectedCourseId(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.8rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(0,0,0,0.3)',
                        color: 'var(--text-main)',
                        fontSize: '1rem'
                    }}
                >
                    <option value="" style={{ background: '#1a1b3c' }}>Selecione...</option>
                    {courses.map(c => <option key={c.id} value={c.id} style={{ background: '#1a1b3c' }}>{c.title}</option>)}
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
                                            <button
                                                onClick={(e: React.MouseEvent) => { e.stopPropagation(); toggleModule(module.id); }} // Stop propagation so we don't trigger drag
                                                onPointerDown={e => e.stopPropagation()} // Important for dnd-kit
                                                className="btn btn-secondary"
                                                style={{ padding: '0.3rem 0.8rem', fontSize: '0.9rem' }}
                                            >
                                                {expandedModules.has(module.id) ? 'Recolher' : 'Expandir Aulas'}
                                            </button>
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
                                                                    gap: '0.8rem'
                                                                }}>
                                                                    <span style={{ opacity: 0.5 }}>::</span>
                                                                    <span>{lesson.title}</span>
                                                                    {lesson.quizId && <span style={{ fontSize: '0.8rem', background: 'var(--primary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Quiz</span>}
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
