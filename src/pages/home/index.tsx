import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import ClueCard from '@/components/ClueCard';
import StatCard from '@/components/StatCard';
import { useClueStore } from '@/store/useClueStore';
import { STATUS_MAP, EVENT_TYPE_MAP } from '@/types';
import type { ClueStatus, EventType } from '@/types';
import styles from './index.module.scss';
import classnames from 'classnames';

type StatusFilter = 'all' | ClueStatus;
type TypeFilter = 'all' | EventType;

const HomePage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const getFilteredClues = useClueStore((s) => s.getFilteredClues);
  const setFilters = useClueStore((s) => s.setFilters);
  const getStats = useClueStore((s) => s.getStats);
  const clues = useClueStore((s) => s.clues);

  const stats = useMemo(() => getStats(), [clues]);

  const statusOptions: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: STATUS_MAP.pending.label },
    { key: 'processing', label: STATUS_MAP.processing.label },
    { key: 'replied', label: STATUS_MAP.replied.label },
    { key: 'archived', label: STATUS_MAP.archived.label }
  ];

  const typeOptions: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: '全部类型' },
    ...Object.entries(EVENT_TYPE_MAP).map(([k, v]) => ({
      key: k as EventType,
      label: v.label
    }))
  ];

  const filteredClues = useMemo(() => {
    setFilters({
      status: statusFilter === 'all' ? undefined : statusFilter,
      eventType: typeFilter === 'all' ? undefined : typeFilter
    });
    return getFilteredClues();
  }, [statusFilter, typeFilter, clues]);

  const handleCreate = () => {
    Taro.navigateTo({ url: '/pages/create/index' });
    console.log('[HomePage] 点击新建线索');
  };

  useDidShow(() => {
    console.log('[HomePage] 页面显示，线索总数:', clues.length);
  });

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      onRefresherrefresh={() => {
        Taro.showToast({ title: '刷新成功', icon: 'success' });
        setTimeout(() => Taro.stopPullDownRefresh(), 500);
      }}
    >
      <View className={styles.headerSection}>
        <View className={styles.welcomeCard}>
          <Text className={styles.welcomeTitle}>校园舆情应急响应</Text>
          <Text className={styles.welcomeSubtitle}>
            快速发现 · 协同处置 · 温和回应
          </Text>
          {stats.urgent > 0 && (
            <View className={styles.urgentAlert}>
              <Text className={styles.alertIcon}>🚨</Text>
              <Text className={styles.alertText}>当前有 {stats.urgent} 条紧急线索待处理</Text>
            </View>
          )}
        </View>

        <View className={styles.statsGrid}>
          <StatCard
            label="今日线索"
            value={stats.total}
            trend="up"
            trendValue="3条"
            accent="primary"
          />
          <StatCard
            label="待处理"
            value={stats.pending}
            accent="danger"
          />
          <StatCard
            label="处理中"
            value={stats.processing}
            accent="warning"
          />
          <StatCard
            label="已处置"
            value={stats.replied}
            accent="success"
          />
        </View>
      </View>

      <View className={styles.filterSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>筛选条件</Text>
        </View>

        <View className={styles.filterTabs}>
          {statusOptions.map((opt) => (
            <View
              key={opt.key}
              className={classnames(
                styles.filterTab,
                statusFilter === opt.key && styles.active
              )}
              onClick={() => setStatusFilter(opt.key)}
            >
              <Text className={styles.filterTabText}>{opt.label}</Text>
            </View>
          ))}
        </View>

        <View className={styles.typeFilters}>
          {typeOptions.map((opt) => (
            <View
              key={opt.key}
              className={classnames(
                styles.typeChip,
                typeFilter === opt.key && styles.active
              )}
              onClick={() => setTypeFilter(opt.key)}
            >
              <Text className={styles.typeChipText}>{opt.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.listSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>线索列表</Text>
          <Text className={styles.sectionCount}>共 {filteredClues.length} 条</Text>
        </View>

        {filteredClues.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📭</Text>
            <Text className={styles.emptyText}>
              暂无匹配的线索
              {'\n'}
              点击右下角按钮快速登记新线索
            </Text>
          </View>
        ) : (
          filteredClues.map((clue) => <ClueCard key={clue.id} clue={clue} />)
        )}
      </View>

      <Button className={styles.fabButton} onClick={handleCreate}>
        <Text className={styles.fabIcon}>+</Text>
      </Button>
    </ScrollView>
  );
};

export default HomePage;
