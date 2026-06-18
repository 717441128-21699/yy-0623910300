import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatCardProps {
  label: string;
  value: number | string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  accent?: 'primary' | 'danger' | 'warning' | 'success';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  trendValue,
  accent = 'primary',
  onClick
}) => {
  return (
    <View
      className={classnames(
        styles.card,
        styles[`accent${accent.charAt(0).toUpperCase() + accent.slice(1)}`],
        onClick && styles.clickable
      )}
      onClick={onClick}
    >
      <View className={styles.topRow}>
        <Text className={styles.label}>{label}</Text>
        {trend && trendValue && (
          <View
            className={classnames(
              styles.trend,
              trend === 'up' && styles.trendUp,
              trend === 'down' && styles.trendDown
            )}
          >
            <Text className={styles.trendIcon}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </Text>
            <Text className={styles.trendText}>{trendValue}</Text>
          </View>
        )}
      </View>
      <Text className={styles.value}>{value}</Text>
      <View className={styles.bar} />
    </View>
  );
};

export default StatCard;
