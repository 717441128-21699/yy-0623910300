import React from 'react';
import { View, Text } from '@tarojs/components';
import { EVENT_TYPE_MAP, SOURCE_MAP, TEMPLATE_CATEGORY_MAP, AUDIENCE_MAP, ROLE_MAP } from '@/types';
import type { EventType, ClueSource, TemplateCategory, TargetAudience, RoleType } from '@/types';
import styles from './index.module.scss';
import classnames from 'classnames';

interface TypeTagProps {
  type: 'event' | 'source' | 'templateCategory' | 'audience' | 'role';
  value: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

const sourceColors: Record<string, string> = {
  group: '#3A7BD5',
  wall: '#EC4899',
  forum: '#8B5CF6',
  report: '#F59E0B',
  other: '#718096'
};

const TypeTag: React.FC<TypeTagProps> = ({ type, value, showIcon = false, size = 'sm' }) => {
  let label = '';
  let color = '#718096';
  let icon = '';

  if (type === 'event') {
    const cfg = EVENT_TYPE_MAP[value as EventType];
    label = cfg?.label || value;
    color = cfg?.color || '#718096';
    icon = '📋';
  } else if (type === 'source') {
    const cfg = SOURCE_MAP[value as ClueSource];
    label = cfg?.label || value;
    color = sourceColors[value] || '#718096';
    const icons: Record<string, string> = { group: '💬', wall: '📝', forum: '🌐', report: '📢', other: '📌' };
    icon = icons[value] || '📌';
  } else if (type === 'templateCategory') {
    const cfg = TEMPLATE_CATEGORY_MAP[value as TemplateCategory];
    label = cfg?.label || value;
    color = cfg?.color || '#718096';
    icon = '📄';
  } else if (type === 'audience') {
    const cfg = AUDIENCE_MAP[value as TargetAudience];
    label = cfg?.label || value;
    color = cfg?.color || '#718096';
    const icons: Record<string, string> = { students: '🎓', parents: '👨‍👩‍👧', public: '📢' };
    icon = icons[value] || '👥';
  } else if (type === 'role') {
    const cfg = ROLE_MAP[value as RoleType];
    label = cfg?.label || value;
    color = '#1E5AA8';
    icon = '👔';
  }

  return (
    <View
      className={classnames(styles.tag, size === 'md' && styles.tagMd)}
      style={{ backgroundColor: `${color}15`, color }}
    >
      {showIcon && <Text className={styles.icon}>{icon}</Text>}
      <Text className={styles.text}>{label}</Text>
    </View>
  );
};

export default TypeTag;
