import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type {
  Clue,
  Task,
  ReplyTemplate,
  ClueStatus,
  EventType,
  UrgentLevel,
  TemplateCategory,
  TargetAudience,
  RoleType
} from '@/types';
import { AUDIENCE_MAP } from '@/types';
import { mockClues } from '@/data/clues';
import { mockTasks } from '@/data/tasks';
import { mockTemplates } from '@/data/templates';
import { generateId, generateTaskContent } from '@/utils';

const STORAGE_KEYS = {
  CLUES: 'yuqing_clues',
  TASKS: 'yuqing_tasks',
  TEMPLATES: 'yuqing_templates',
  INIT_FLAG: 'yuqing_init_flag',
  VARIABLE_CACHE: 'yuqing_variable_cache',
  REPLY_LOG: 'yuqing_reply_log',
  REPLY_DRAFTS: 'yuqing_reply_drafts'
};

interface PersistState {
  _hydrated: boolean;
  _persist: (key: string, data: unknown) => void;
  _load: <T>(key: string, fallback: T) => T;
  hydrateFromStorage: () => void;
  resetAllData: () => void;
}

interface ClueState extends PersistState {
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
  addClue: (clue: Partial<Clue>) => Clue;
  updateClueStatus: (id: string, status: ClueStatus) => void;
  addTask: (task: Partial<Task>) => Task;
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
  getRecommendedRoles: (eventType: EventType, urgentLevel: UrgentLevel) => RoleType[];
  getRecommendedTemplates: (eventType: EventType, audience?: TargetAudience, urgentLevel?: UrgentLevel, preferCategory?: TemplateCategory) => ReplyTemplate[];
  replyContext: { clueId: string; audience?: TargetAudience; templateId?: string } | null;
  setReplyContext: (ctx: { clueId: string; audience?: TargetAudience; templateId?: string } | null) => void;
  dispatchTasksForClue: (clueId: string, roles: RoleType[]) => number;
  variableCache: Record<string, Record<string, string>>;
  setVariableCache: (templateId: string, values: Record<string, string>) => void;
  getLatestFeedbackForClue: (clueId: string) => string;
  replyDrafts: Record<string, {
    templateId: string;
    variables: Record<string, string>;
    editedContent: string;
    updatedAt: string;
  }>;
  setReplyDraft: (clueId: string, audience: TargetAudience, draft: {
    templateId: string;
    variables: Record<string, string>;
    editedContent: string;
  }) => void;
  getReplyDraft: (clueId: string, audience: TargetAudience) => {
    templateId: string;
    variables: Record<string, string>;
    editedContent: string;
    updatedAt: string;
  } | null;
  getFallbackTemplate: (eventType: EventType, audience: TargetAudience, preferredCategory?: TemplateCategory) => ReplyTemplate | null;
  replyLog: Array<{
    id: string;
    clueId: string;
    audience: TargetAudience;
    templateId?: string;
    content: string;
    sentAt: string;
  }>;
  recordReply: (record: Omit<{
    id: string;
    clueId: string;
    audience: TargetAudience;
    templateId?: string;
    content: string;
    sentAt: string;
  }, 'id' | 'sentAt'> & { id?: string; sentAt?: string }) => void;
  getRepliesByClueId: (clueId: string) => Array<{
    id: string;
    clueId: string;
    audience: TargetAudience;
    templateId?: string;
    content: string;
    sentAt: string;
  }>;
  getClosureSummary: (clueId: string) => {
    totalReplies: number;
    replyByAudience: Record<string, number>;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    confirmations: number;
    progresses: number;
    completions: number;
    duration: string;
    latestFeedback: string;
  };
  archiveClue: (clueId: string) => void;
}

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const data = Taro.getStorageSync(key);
    if (data) {
      return JSON.parse(data) as T;
    }
  } catch (e) {
    console.warn('[Store] 读取本地存储失败:', key, e);
  }
  return fallback;
};

const saveToStorage = (key: string, data: unknown): void => {
  try {
    Taro.setStorageSync(key, JSON.stringify(data));
  } catch (e) {
    console.warn('[Store] 保存本地存储失败:', key, e);
  }
};

export const useClueStore = create<ClueState>((set, get) => ({
  clues: [],
  tasks: [],
  templates: [],
  selectedClueId: null,
  filters: {},
  replyContext: null,
  variableCache: loadFromStorage('yuqing_variable_cache', {}),
  replyLog: loadFromStorage(STORAGE_KEYS.REPLY_LOG, []),
  replyDrafts: loadFromStorage(STORAGE_KEYS.REPLY_DRAFTS, {}),
  _hydrated: false,

  _persist: (key, data) => {
    saveToStorage(key, data);
  },

  _load: (key, fallback) => {
    return loadFromStorage(key, fallback);
  },

  hydrateFromStorage: () => {
    if (get()._hydrated) return;

    const hasInit = Taro.getStorageSync(STORAGE_KEYS.INIT_FLAG);
    let clues: Clue[];
    let tasks: Task[];
    let templates: ReplyTemplate[];

    if (hasInit) {
      clues = loadFromStorage(STORAGE_KEYS.CLUES, mockClues);
      tasks = loadFromStorage(STORAGE_KEYS.TASKS, mockTasks);
      templates = loadFromStorage(STORAGE_KEYS.TEMPLATES, mockTemplates);
    } else {
      clues = mockClues;
      tasks = mockTasks;
      templates = mockTemplates;
      saveToStorage(STORAGE_KEYS.CLUES, clues);
      saveToStorage(STORAGE_KEYS.TASKS, tasks);
      saveToStorage(STORAGE_KEYS.TEMPLATES, templates);
      Taro.setStorageSync(STORAGE_KEYS.INIT_FLAG, '1');
    }

    set({
      clues,
      tasks,
      templates,
      _hydrated: true
    });
    console.log('[Store] 数据已从本地存储加载', clues.length + '条线索，' + tasks.length + '个任务，' + templates.length + '个模板');
  },

  resetAllData: () => {
    Taro.removeStorageSync(STORAGE_KEYS.CLUES);
    Taro.removeStorageSync(STORAGE_KEYS.TASKS);
    Taro.removeStorageSync(STORAGE_KEYS.TEMPLATES);
    Taro.removeStorageSync(STORAGE_KEYS.INIT_FLAG);
    Taro.removeStorageSync(STORAGE_KEYS.VARIABLE_CACHE);
    Taro.removeStorageSync(STORAGE_KEYS.REPLY_LOG);
    Taro.removeStorageSync(STORAGE_KEYS.REPLY_DRAFTS);
    set({
      clues: mockClues,
      tasks: mockTasks,
      templates: mockTemplates,
      variableCache: {},
      replyLog: [],
      replyDrafts: {},
      _hydrated: false
    });
    console.log('[Store] 已重置为初始数据');
  },

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

  addClue: (clue) => {
    const newClue: Clue = {
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
          note: clue.source ? undefined : '手动创建'
        }
      ],
      ...clue
    } as Clue;

    set((state) => {
      const newClues = [newClue, ...state.clues];
      saveToStorage(STORAGE_KEYS.CLUES, newClues);
      return { clues: newClues };
    });

    console.log('[Store] 新增线索:', newClue.title);
    return newClue;
  },

  updateClueStatus: (id, status) =>
    set((state) => {
      const newClues = state.clues.map((c) =>
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
      );
      saveToStorage(STORAGE_KEYS.CLUES, newClues);
      return { clues: newClues };
    }),

  addTask: (task) => {
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

    set((state) => {
      const newTasks = [newTask, ...state.tasks];
      const newClues = state.clues.map((c) =>
        c.id === newTask.clueId
          ? {
              ...c,
              taskIds: [...c.taskIds, newTask.id],
              timeline: [
                ...c.timeline,
                {
                  id: generateId(),
                  time: new Date().toISOString(),
                  action: '派发任务',
                  operator: '当前用户',
                  role: 'propaganda',
                  note: `派发给${task.role} - ${task.content?.slice(0, 20)}`
                }
              ]
            }
          : c
      );
      saveToStorage(STORAGE_KEYS.TASKS, newTasks);
      saveToStorage(STORAGE_KEYS.CLUES, newClues);
      return { tasks: newTasks, clues: newClues };
    });

    console.log('[Store] 新增任务:', newTask.content);
    return newTask;
  },

  updateTaskStatus: (id, status, feedback) =>
    set((state) => {
      const originalTask = state.tasks.find((t) => t.id === id);
      const newTasks = state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              feedback: feedback || t.feedback,
              feedbackAt: feedback ? new Date().toISOString() : t.feedbackAt
            }
          : t
      );

      let newClues = state.clues;
      if (originalTask) {
        let timelineAction = '';
        let timelineNote = feedback?.slice(0, 30);
        
        if (originalTask.status === 'pending' && status === 'confirmed' && !feedback) {
          timelineAction = '任务确认';
        } else if (status === 'confirmed' && feedback) {
          timelineAction = '任务进展';
        } else if (status === 'completed') {
          timelineAction = '任务完成';
        }

        if (timelineAction) {
          newClues = state.clues.map((c) =>
            c.id === originalTask.clueId
              ? {
                  ...c,
                  timeline: [
                    ...c.timeline,
                    {
                      id: generateId(),
                      time: new Date().toISOString(),
                      action: timelineAction,
                      operator: originalTask.assignee || '责任部门',
                      role: originalTask.role,
                      note: timelineNote
                    }
                  ]
                }
              : c
          );
        }
      }

      saveToStorage(STORAGE_KEYS.TASKS, newTasks);
      if (originalTask) saveToStorage(STORAGE_KEYS.CLUES, newClues);
      return { tasks: newTasks, clues: newClues };
    }),

  getStats: () => {
    const { clues } = get();
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
    set((state) => {
      const newTemplates = [
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
      ];
      saveToStorage(STORAGE_KEYS.TEMPLATES, newTemplates);
      return { templates: newTemplates };
    }),

  updateTemplate: (id, updates) =>
    set((state) => {
      const newTemplates = state.templates.map((t) =>
        t.id === id
          ? {
              ...t,
              ...updates,
              updatedAt: new Date().toISOString()
            }
          : t
      );
      saveToStorage(STORAGE_KEYS.TEMPLATES, newTemplates);
      return { templates: newTemplates };
    }),

  deleteTemplate: (id) =>
    set((state) => {
      const newTemplates = state.templates.filter((t) => t.id !== id);
      saveToStorage(STORAGE_KEYS.TEMPLATES, newTemplates);
      return { templates: newTemplates };
    }),

  incrementTemplateUsage: (id) =>
    set((state) => {
      const newTemplates = state.templates.map((t) =>
        t.id === id
          ? { ...t, usageCount: t.usageCount + 1, updatedAt: new Date().toISOString() }
          : t
      );
      saveToStorage(STORAGE_KEYS.TEMPLATES, newTemplates);
      return { templates: newTemplates };
    }),

  getRecommendedRoles: (eventType, urgentLevel) => {
    const roleMap: Record<EventType, RoleType[]> = {
      dorm: ['dorm_admin', 'logistics', 'counselor'],
      canteen: ['canteen_admin', 'logistics', 'counselor'],
      exam: ['academic', 'counselor'],
      conflict: ['security', 'counselor', 'propaganda'],
      teaching: ['academic', 'counselor'],
      service: ['logistics', 'counselor'],
      other: ['counselor', 'propaganda']
    };

    let roles = roleMap[eventType] || roleMap.other;

    if (urgentLevel === 'high') {
      roles = [...roles, 'leader'];
    }

    return Array.from(new Set(roles));
  },

  getRecommendedTemplates: (eventType, audience, urgentLevel, preferCategory) => {
    const { templates } = get();
    let list = templates;
    if (audience) list = list.filter(t => t.audience === audience);
    if (list.length === 0) return templates;
    const filtered = list.filter(t => {
      if (t.eventType && t.eventType !== eventType) return false;
      if (preferCategory && t.category !== preferCategory) return false;
      return true;
    });
    const others = list.filter(t => {
      if (t.eventType && t.eventType !== eventType) return false;
      if (preferCategory && t.category !== preferCategory) return true;
      return false;
    });
    const withoutCategory = list.filter(t => {
      if (!preferCategory) return false;
      return t.eventType === eventType || !t.eventType;
    });
    return [...filtered, ...others, ...withoutCategory].sort((a, b) => b.usageCount - a.usageCount);
  },

  setReplyDraft: (clueId, audience, draft) => set((state) => {
    const key = `${clueId}__${audience}`;
    const newDrafts = {
      ...state.replyDrafts,
      [key]: { ...draft, updatedAt: new Date().toISOString() }
    };
    saveToStorage(STORAGE_KEYS.REPLY_DRAFTS, newDrafts);
    return { replyDrafts: newDrafts };
  }),

  getReplyDraft: (clueId, audience) => {
    const key = `${clueId}__${audience}`;
    return get().replyDrafts[key] || null;
  },

  getFallbackTemplate: (eventType, audience, preferredCategory) => {
    const { templates } = get();
    const sameAudience = templates.filter(t => t.audience === audience);
    if (sameAudience.length === 0) {
      return templates.sort((a, b) => b.usageCount - a.usageCount)[0] || null;
    }
    if (preferredCategory) {
      const preferred = sameAudience
        .filter(t => t.category === preferredCategory)
        .sort((a, b) => {
          const scoreA = a.eventType === eventType ? 10 : !a.eventType ? 5 : 0;
          const scoreB = b.eventType === eventType ? 10 : !b.eventType ? 5 : 0;
          if (scoreA !== scoreB) return scoreB - scoreA;
          return b.usageCount - a.usageCount;
        });
      if (preferred.length > 0) return preferred[0];
    }
    const sameType = sameAudience
      .filter(t => t.eventType === eventType)
      .sort((a, b) => b.usageCount - a.usageCount);
    if (sameType.length > 0) return sameType[0];
    const generic = sameAudience
      .filter(t => !t.eventType)
      .sort((a, b) => b.usageCount - a.usageCount);
    if (generic.length > 0) return generic[0];
    return sameAudience.sort((a, b) => b.usageCount - a.usageCount)[0];
  },

  dispatchTasksForClue: (clueId, roles) => {
    const clue = get().getClueById(clueId);
    if (!clue) return 0;

    const deadlineMap: Record<RoleType, number> = {
      security: 30,
      counselor: 60,
      logistics: 120,
      dorm_admin: 60,
      canteen_admin: 60,
      academic: 120,
      propaganda: 60,
      leader: 30
    };

    roles.forEach((role) => {
      const minutes = deadlineMap[role] || 60;
      const content = generateTaskContent(clue.eventType, role, clue.title);
      const deadline = new Date(Date.now() + minutes * 60 * 1000).toISOString();

      get().addTask({
        clueId,
        clueTitle: clue.title,
        role,
        content,
        deadline
      });
    });

    console.log('[Store] 自动派发任务:', clue.title, roles.length + '个任务');
    return roles.length;
  },

  setReplyContext: (ctx) => set({ replyContext: ctx }),

  setVariableCache: (templateId, values) => set((state) => {
    const newCache = { ...state.variableCache, [templateId]: values };
    saveToStorage(STORAGE_KEYS.VARIABLE_CACHE, newCache);
    return { variableCache: newCache };
  }),

  getLatestFeedbackForClue: (clueId) => {
    const tasks = get().getTasksByClueId(clueId);
    const withFeedback = tasks.filter(t => t.feedback);
    if (withFeedback.length === 0) return '';
    return withFeedback.sort((a, b) =>
      new Date(b.feedbackAt || 0).getTime() - new Date(a.feedbackAt || 0).getTime()
    )[0].feedback || '';
  },

  recordReply: (record) => set((state) => {
    const newEntry = {
      id: record.id || generateId(),
      sentAt: record.sentAt || new Date().toISOString(),
      clueId: record.clueId,
      audience: record.audience,
      templateId: record.templateId,
      content: record.content
    };
    const newLog = [newEntry, ...state.replyLog];
    saveToStorage(STORAGE_KEYS.REPLY_LOG, newLog);
    const newClues = state.clues.map((c) =>
      c.id === record.clueId
        ? {
            ...c,
            timeline: [
              ...c.timeline,
              {
                id: generateId(),
                time: newEntry.sentAt,
                action: `发送${AUDIENCE_MAP[record.audience]?.label || ''}回复`,
                operator: '当前用户',
                role: 'propaganda' as RoleType,
                note: record.content.slice(0, 30)
              }
            ]
          }
        : c
    );
    saveToStorage(STORAGE_KEYS.CLUES, newClues);
    return { replyLog: newLog, clues: newClues };
  }),
  getRepliesByClueId: (clueId) => get().replyLog.filter(r => r.clueId === clueId),
  getClosureSummary: (clueId) => {
    const clue = get().getClueById(clueId);
    const tasks = get().getTasksByClueId(clueId);
    const replies = get().getRepliesByClueId(clueId);
    if (!clue) {
      return { totalReplies: 0, replyByAudience: {}, totalTasks: 0, completedTasks: 0, pendingTasks: 0, confirmations: 0, progresses: 0, completions: 0, duration: '', latestFeedback: '' };
    }
    const replyByAudience: Record<string, number> = {};
    replies.forEach(r => {
      replyByAudience[r.audience] = (replyByAudience[r.audience] || 0) + 1;
    });
    let confirmations = 0, progresses = 0, completions = 0;
    tasks.forEach(t => {
      if (t.status === 'confirmed') confirmations++;
      if (t.status === 'completed') { completions++; confirmations++; }
      if (t.feedbackAt && t.status !== 'completed') progresses++;
      if (t.feedbackAt && t.status === 'completed') progresses++;
    });
    const durationMs = Date.now() - new Date(clue.createdAt).getTime();
    const hours = Math.floor(durationMs / 3600000);
    const mins = Math.floor((durationMs % 3600000) / 60000);
    const duration = hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`;
    const latestFeedback = get().getLatestFeedbackForClue(clueId);
    return {
      totalReplies: replies.length,
      replyByAudience,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      pendingTasks: tasks.filter(t => t.status !== 'completed').length,
      confirmations,
      progresses,
      completions,
      duration,
      latestFeedback
    };
  },
  archiveClue: (clueId) => set((state) => {
    const clue = state.clues.find(c => c.id === clueId);
    if (!clue) return {};
    const summary = get().getClosureSummary(clueId);
    const summaryNote = `回复${summary.totalReplies}条/任务${summary.totalTasks}项/完成${summary.completedTasks}项/用时${summary.duration}`;
    const newClues = state.clues.map(c =>
      c.id === clueId
        ? {
            ...c,
            status: 'archived' as ClueStatus,
            timeline: [
              ...c.timeline,
              {
                id: generateId(),
                time: new Date().toISOString(),
                action: '✅ 处置闭环归档',
                operator: '当前用户',
                role: 'propaganda' as RoleType,
                note: summaryNote
              }
            ]
          }
        : c
    );
    saveToStorage(STORAGE_KEYS.CLUES, newClues);
    return { clues: newClues };
  }),
}));
