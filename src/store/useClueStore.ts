import { create } from 'zustand';
import type { Clue, Task, ReplyTemplate, ClueStatus, EventType, UrgentLevel, TemplateCategory, TargetAudience } from '@/types';
import { mockClues } from '@/data/clues';
import { mockTasks } from '@/data/tasks';
import { mockTemplates } from '@/data/templates';
import { generateId } from '@/utils';

interface ClueState {
  clues: Clue[];
  tasks: Task[];
  templates: ReplyTemplate[];
  selectedClueId: string | null;
  filters: {
    status?: ClueStatus;
    eventType?: EventType;
    urgentLevel?: UrgentLevel;
    keyword?: string;
  };
  setFilters: (filters: Partial<ClueState['filters']>) => void;
  getFilteredClues: () => Clue[];
  getClueById: (id: string) => Clue | undefined;
  getTasksByClueId: (clueId: string) => Task[];
  getTasksByStatus: (status: Task['status']) => Task[];
  getPendingTaskCount: () => number;
  addClue: (clue: Partial<Clue>) => void;
  updateClueStatus: (id: string, status: ClueStatus) => void;
  addTask: (task: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: Task['status'], feedback?: string) => void;
  getStats: () => {
    total: number;
    pending: number;
    processing: number;
    replied: number;
    urgent: number;
    byType: Record<string, number>;
  };
  getTemplateById: (id: string) => ReplyTemplate | undefined;
  addTemplate: (template: Partial<ReplyTemplate>) => void;
  updateTemplate: (id: string, updates: Partial<ReplyTemplate>) => void;
  deleteTemplate: (id: string) => void;
  incrementTemplateUsage: (id: string) => void;
}

export const useClueStore = create<ClueState>((set, get) => ({
  clues: mockClues,
  tasks: mockTasks,
  templates: mockTemplates,
  selectedClueId: null,
  filters: {},

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),

  getFilteredClues: () => {
    const { clues, filters } = get();
    return clues.filter((clue) => {
      if (filters.status && clue.status !== filters.status) return false;
      if (filters.eventType && clue.eventType !== filters.eventType) return false;
      if (filters.urgentLevel && clue.urgentLevel !== filters.urgentLevel) return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        return (
          clue.title.toLowerCase().includes(kw) ||
          clue.description.toLowerCase().includes(kw)
        );
      }
      return true;
    }).sort((a, b) => {
      const urgentScore = { high: 0, medium: 1, low: 2 };
      if (urgentScore[a.urgentLevel] !== urgentScore[b.urgentLevel]) {
        return urgentScore[a.urgentLevel] - urgentScore[b.urgentLevel];
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  getClueById: (id) => get().clues.find((c) => c.id === id),

  getTasksByClueId: (clueId) => get().tasks.filter((t) => t.clueId === clueId),

  getTasksByStatus: (status) => get().tasks.filter((t) => t.status === status),

  getPendingTaskCount: () =>
    get().tasks.filter((t) => t.status === 'pending' || t.status === 'confirmed').length,

  addClue: (clue) =>
    set((state) => ({
      clues: [
        {
          id: generateId(),
          title: clue.title || '未命名线索',
          description: clue.description || '',
          eventType: clue.eventType || 'other',
          status: 'pending',
          urgentLevel: clue.urgentLevel || 'medium',
          source: clue.source || 'other',
          createdAt: new Date().toISOString(),
          taskIds: [],
          timeline: [
            {
              id: generateId(),
              time: new Date().toISOString(),
              action: '线索登记',
              operator: '当前用户',
              role: 'propaganda',
              note: '手动创建'
            }
          ],
          ...clue
        } as Clue,
        ...state.clues
      ]
    })),

  updateClueStatus: (id, status) =>
    set((state) => ({
      clues: state.clues.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              timeline: [
                ...c.timeline,
                {
                  id: generateId(),
                  time: new Date().toISOString(),
                  action: `状态变更：${status}`,
                  operator: '当前用户',
                  role: 'propaganda'
                }
              ]
            }
          : c
      )
    })),

  addTask: (task) =>
    set((state) => {
      const newTask: Task = {
        id: generateId(),
        clueId: task.clueId || '',
        clueTitle: task.clueTitle || '',
        role: task.role || 'counselor',
        assignee: task.assignee || '',
        content: task.content || '',
        deadline: task.deadline || new Date(Date.now() + 3600000).toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      return {
        tasks: [newTask, ...state.tasks],
        clues: state.clues.map((c) =>
          c.id === newTask.clueId
            ? { ...c, taskIds: [...c.taskIds, newTask.id] }
            : c
        )
      };
    }),

  updateTaskStatus: (id, status, feedback) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              feedback: feedback || t.feedback,
              feedbackAt: feedback ? new Date().toISOString() : t.feedbackAt
            }
          : t
      )
    })),

  getStats: () => {
    const { clues, tasks } = get();
    const byType: Record<string, number> = {};
    clues.forEach((c) => {
      byType[c.eventType] = (byType[c.eventType] || 0) + 1;
    });
    return {
      total: clues.length,
      pending: clues.filter((c) => c.status === 'pending').length,
      processing: clues.filter((c) => c.status === 'processing').length,
      replied: clues.filter((c) => c.status === 'replied' || c.status === 'archived').length,
      urgent: clues.filter((c) => c.urgentLevel === 'high').length,
      byType
    };
  },

  getTemplateById: (id) => get().templates.find((t) => t.id === id),

  addTemplate: (template) =>
    set((state) => ({
      templates: [
        {
          id: `tpl-${Date.now()}`,
          title: template.title || '未命名模板',
          category: template.category || 'explanation',
          audience: template.audience || 'students',
          content: template.content || '',
          variables: template.variables || [],
          eventType: template.eventType,
          usageCount: 0,
          updatedAt: new Date().toISOString()
        } as ReplyTemplate,
        ...state.templates
      ]
    })),

  updateTemplate: (id, updates) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id
          ? {
              ...t,
              ...updates,
              updatedAt: new Date().toISOString()
            }
          : t
      )
    })),

  deleteTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id)
    })),

  incrementTemplateUsage: (id) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id
          ? { ...t, usageCount: t.usageCount + 1, updatedAt: new Date().toISOString() }
          : t
      )
    }))
}));
