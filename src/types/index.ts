export type EventType =
  | 'dorm'
  | 'canteen'
  | 'exam'
  | 'conflict'
  | 'teaching'
  | 'service'
  | 'other';

export type ClueStatus = 'pending' | 'processing' | 'replied' | 'archived';

export type UrgentLevel = 'high' | 'medium' | 'low';

export type ClueSource = 'group' | 'wall' | 'forum' | 'report' | 'other';

export type RoleType =
  | 'security'
  | 'logistics'
  | 'counselor'
  | 'academic'
  | 'propaganda'
  | 'dorm_admin'
  | 'canteen_admin'
  | 'leader';

export type TemplateCategory = 'emotion' | 'explanation' | 'apology' | 'notice' | 'update';

export type TargetAudience = 'students' | 'parents' | 'public';

export interface Clue {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  status: ClueStatus;
  urgentLevel: UrgentLevel;
  source: ClueSource;
  createdAt: string;
  reportedBy?: string;
  location?: string;
  involvedCount?: number;
  attachments?: string[];
  taskIds: string[];
  templateId?: string;
  timeline: TimelineItem[];
}

export interface TimelineItem {
  id: string;
  time: string;
  action: string;
  operator: string;
  role: RoleType;
  note?: string;
}

export interface Task {
  id: string;
  clueId: string;
  clueTitle: string;
  role: RoleType;
  assignee: string;
  content: string;
  deadline: string;
  status: 'pending' | 'confirmed' | 'completed' | 'overdue';
  feedback?: string;
  feedbackAt?: string;
  createdAt: string;
}

export interface ReplyTemplate {
  id: string;
  title: string;
  category: TemplateCategory;
  eventType?: EventType;
  audience: TargetAudience;
  content: string;
  variables: string[];
  usageCount: number;
  updatedAt: string;
}

export interface RoleInfo {
  type: RoleType;
  name: string;
  department: string;
  contact: string;
  avatar?: string;
}

export const EVENT_TYPE_MAP: Record<EventType, { label: string; color: string }> = {
  dorm: { label: '宿舍管理', color: '#FF9F43' },
  canteen: { label: '食堂卫生', color: '#26C6DA' },
  exam: { label: '考试安排', color: '#7C4DFF' },
  conflict: { label: '师生冲突', color: '#FF5252' },
  teaching: { label: '教学质量', color: '#1E88E5' },
  service: { label: '后勤服务', color: '#43A047' },
  other: { label: '其他事件', color: '#78909C' }
};

export const STATUS_MAP: Record<ClueStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待处理', color: '#E5484D', bgColor: 'rgba(229, 72, 77, 0.1)' },
  processing: { label: '处理中', color: '#F5A623', bgColor: 'rgba(245, 166, 35, 0.1)' },
  replied: { label: '已回复', color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.1)' },
  archived: { label: '已归档', color: '#718096', bgColor: 'rgba(113, 128, 150, 0.1)' }
};

export const URGENT_MAP: Record<UrgentLevel, { label: string; color: string }> = {
  high: { label: '紧急', color: '#E5484D' },
  medium: { label: '关注', color: '#F5A623' },
  low: { label: '普通', color: '#718096' }
};

export const SOURCE_MAP: Record<ClueSource, { label: string }> = {
  group: { label: '学生群聊' },
  wall: { label: '表白墙' },
  forum: { label: '校园论坛' },
  report: { label: '师生举报' },
  other: { label: '其他渠道' }
};

export const ROLE_MAP: Record<RoleType, { label: string; department: string; icon: string }> = {
  security: { label: '保卫处', department: '保卫处', icon: '🛡️' },
  logistics: { label: '后勤处', department: '后勤管理处', icon: '🔧' },
  counselor: { label: '学院辅导员', department: '各学院学工办', icon: '👨‍🏫' },
  academic: { label: '教务处', department: '教务处', icon: '📚' },
  propaganda: { label: '宣传部', department: '党委宣传部', icon: '📣' },
  dorm_admin: { label: '宿管中心', department: '学生公寓管理中心', icon: '🏠' },
  canteen_admin: { label: '餐饮中心', department: '后勤餐饮服务中心', icon: '🍽️' },
  leader: { label: '值班领导', department: '校办公室', icon: '👔' }
};

export const TEMPLATE_CATEGORY_MAP: Record<TemplateCategory, { label: string; color: string }> = {
  emotion: { label: '情绪安抚', color: '#8B5CF6' },
  explanation: { label: '情况说明', color: '#3A7BD5' },
  apology: { label: '致歉声明', color: '#E5484D' },
  notice: { label: '正式通知', color: '#1E5AA8' },
  update: { label: '进展通报', color: '#22C55E' }
};

export const AUDIENCE_MAP: Record<TargetAudience, { label: string; color: string }> = {
  students: { label: '学生群', color: '#3A7BD5' },
  parents: { label: '家长群', color: '#8B5CF6' },
  public: { label: '校内公告', color: '#1E5AA8' }
};
