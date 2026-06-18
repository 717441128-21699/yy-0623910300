import React from 'react';
import { View, Text } from '@tarojs/components';
import { STATUS_MAP, URGENT_MAP } from '@/types';
import type { ClueStatus, UrgentLevel } from '@/types';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatusBadgeProps {
  type: 'status' | 'urgent' | 'task';
  value: string;
  size?: 'sm' | 'md';
}

const taskStatusMap: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待确认', color: '#E5484D', bgColor: 'rgba(229, 72, 77, 0.1)' },
  confirmed: { label: '处理中', color: '#F5A623', bgColor: 'rgba(245, 166, 35, 0.1)' },
  completed: { label: '已完成', color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.1)' },
  overdue: { label: '已超时', color: '#E5484D', bgColor: 'rgba(229, 72, 77, 0.15)' }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'sm' }) => {
  let config: { label: string; color: string; bgColor?: string };

  if (type === 'status') {
    config = STATUS_MAP[value as ClueStatus];
  } else if (type === 'urgent') {
    const urgent = URGENT_MAP[value as UrgentLevel];
    config = { ...urgent, bgColor: `${urgent.color}15` };
  } else {
    config = taskStatusMap[value] || taskStatusMap.pending;
  }

  return (
    <View
      className={classnames(styles.badge, size === 'md' && styles.badgeMd)}
      style={{ backgroundColor: config.bgColor, color: config.color }}
    >
      {type === 'urgent' && value === 'high' && <Text className={styles.pulseDot} />}
      <Text className={styles.text}>{config.label}</Text>
    </View>
  );
};

export default StatusBadge;
