import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import type { UrgentLevel, ClueStatus, EventType } from '@/types';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export const formatTime = (dateStr: string): string => {
  return dayjs(dateStr).format('MM-DD HH:mm');
};

export const formatFullTime = (dateStr: string): string => {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm');
};

export const timeFromNow = (dateStr: string): string => {
  return dayjs(dateStr).fromNow();
};

export const formatDeadline = (deadline: string): { text: string; isOverdue: boolean; isUrgent: boolean } => {
  const now = dayjs();
  const dl = dayjs(deadline);
  const diffHours = dl.diff(now, 'hour');
  const diffMinutes = dl.diff(now, 'minute');

  if (diffMinutes < 0) {
    return { text: `已超时 ${Math.abs(diffMinutes)}分钟`, isOverdue: true, isUrgent: true };
  }
  if (diffMinutes < 60) {
    return { text: `剩余 ${diffMinutes}分钟`, isOverdue: false, isUrgent: true };
  }
  if (diffHours < 24) {
    return { text: `剩余 ${diffHours}小时`, isOverdue: false, isUrgent: diffHours < 3 };
  }
  return { text: dl.format('MM-DD HH:mm'), isOverdue: false, isUrgent: false };
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getUrgentLevel = (
  eventType: EventType,
  involvedCount: number,
  negativeSentiment: boolean
): UrgentLevel => {
  let score = 0;

  if (eventType === 'conflict') score += 3;
  if (eventType === 'dorm' || eventType === 'canteen') score += 1;
  if (involvedCount >= 50) score += 3;
  else if (involvedCount >= 20) score += 2;
  else if (involvedCount >= 10) score += 1;
  if (negativeSentiment) score += 2;

  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
};

export const generateTaskContent = (
  eventType: EventType,
  role: string,
  clueTitle: string
): string => {
  const contentMap: Record<string, string> = {
    'security-conflict': `核实【${clueTitle}】中的现场情况，确认是否有肢体冲突，提供监控视频说明`,
    'logistics-dorm': `排查【${clueTitle}】涉及的宿舍区域设施问题，2小时内给出整改方案`,
    'canteen_admin-canteen': `针对【${clueTitle}】检查相关窗口卫生，采集留样，约谈负责人`,
    'academic-exam': `核实【${clueTitle}】中的考试安排、监考等问题，给出官方解释`,
    'counselor': `联系【${clueTitle}】涉及的学生，了解具体诉求，做好情绪安抚`
  };

  const key = `${role}-${eventType}`;
  if (contentMap[key]) return contentMap[key];
  if (contentMap[role]) return contentMap[role];
  return `核实处理【${clueTitle}】相关问题，及时反馈进展`;
};

export const renderTemplate = (content: string, variables: Record<string, string>): string => {
  let result = content;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  });
  return result;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (process.env.TARO_ENV === 'h5') {
      await navigator.clipboard.writeText(text);
    } else {
      const Taro = (await import('@tarojs/taro')).default;
      Taro.setClipboardData({ data: text });
    }
    return true;
  } catch (err) {
    console.error('[Utils] copyToClipboard error:', err);
    return false;
  }
};
