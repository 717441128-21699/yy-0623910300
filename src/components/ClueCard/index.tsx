import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import type { Clue } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import TypeTag from '@/components/TypeTag';
import { timeFromNow } from '@/utils';
import styles from './index.module.scss';
import classnames from 'classnames';

interface ClueCardProps {
  clue: Clue;
  onClick?: () => void;
}

const ClueCard: React.FC<ClueCardProps> = ({ clue, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({ url: `/pages/detail/index?id=${clue.id}` });
    }
  };

  return (
    <View
      className={classnames(
        styles.card,
        clue.urgentLevel === 'high' && styles.cardUrgent
      )}
      onClick={handleClick}
    >
      {clue.urgentLevel === 'high' && <View className={styles.urgentStrip} />}

      <View className={styles.header}>
        <View className={styles.tagsRow}>
          <StatusBadge type="urgent" value={clue.urgentLevel} size="sm" />
          <TypeTag type="event" value={clue.eventType} size="sm" />
          <TypeTag type="source" value={clue.source} showIcon size="sm" />
        </View>
        <StatusBadge type="status" value={clue.status} size="sm" />
      </View>

      <Text className={styles.title}>{clue.title}</Text>

      <Text className={styles.description}>{clue.description}</Text>

      <View className={styles.metaRow}>
        <View className={styles.metaItem}>
          <Text className={styles.metaIcon}>⏰</Text>
          <Text className={styles.metaText}>{timeFromNow(clue.createdAt)}</Text>
        </View>
        {clue.involvedCount && (
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>👥</Text>
            <Text className={styles.metaText}>约 {clue.involvedCount} 人</Text>
          </View>
        )}
        {clue.taskIds.length > 0 && (
          <View className={styles.metaItem}>
            <Text className={styles.metaIcon}>📋</Text>
            <Text className={styles.metaText}>{clue.taskIds.length} 项任务</Text>
          </View>
        )}
      </View>

      {clue.reportedBy && (
        <View className={styles.footer}>
          <View className={styles.reporter}>
            <View className={styles.avatarCircle}>
              <Text className={styles.avatarText}>{clue.reportedBy.charAt(0)}</Text>
            </View>
            <Text className={styles.reporterName}>{clue.reportedBy}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ClueCard;
