import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import StatCard from '@/components/StatCard';
import { useClueStore } from '@/store/useClueStore';
import { EVENT_TYPE_MAP, ROLE_MAP } from '@/types';
import type { EventType, RoleType } from '@/types';
import styles from './index.module.scss';

const StatsPage: React.FC = () => {
  const getStats = useClueStore((s) => s.getStats);
  const clues = useClueStore((s) => s.clues);
  const tasks = useClueStore((s) => s.tasks);
  const templates = useClueStore((s) => s.templates);

  const stats = useMemo(() => getStats(), [clues]);

  const typeData = useMemo(() => {
    const result = Object.entries(stats.byType)
      .map(([type, count]) => ({
        type: type as EventType,
        count,
        label: EVENT_TYPE_MAP[type as EventType]?.label || type,
        color: EVENT_TYPE_MAP[type as EventType]?.color || '#78909C'
      }))
      .sort((a, b) => b.count - a.count);
    return result;
  }, [stats.byType]);

  const maxTypeCount = Math.max(...typeData.map((t) => t.count), 1);

  const trendData = useMemo(() => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const counts = [3, 5, 2, 7, 4, 8, 5];
    const maxCount = Math.max(...counts);
    return days.map((day, i) => ({
      day,
      count: counts[i],
      height: (counts[i] / maxCount) * 180 + 20
    }));
  }, []);

  const roleStats = useMemo(() => {
    const map: Record<string, { total: number; completed: number }> = {};
    tasks.forEach((t) => {
      if (!map[t.role]) {
        map[t.role] = { total: 0, completed: 0 };
      }
      map[t.role].total++;
      if (t.status === 'completed') {
        map[t.role].completed++;
      }
    });
    return Object.entries(map)
      .map(([role, s]) => ({
        role: role as RoleType,
        ...s,
        label: ROLE_MAP[role as RoleType]?.label || role,
        rate: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [tasks]);

  const avgResponseTime = useMemo(() => '32分钟', []);
  const templateUsage = useMemo(() => templates.reduce((sum, t) => sum + t.usageCount, 0), [templates]);

  useDidShow(() => {
    console.log('[StatsPage] 页面显示，线索总数:', clues.length);
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
        <View className={styles.overviewCard}>
          <Text className={styles.overviewTitle}>本周舆情数据看板</Text>
          <Text className={styles.overviewSubtitle}>截至今日 · 实时数据更新</Text>
          <View className={styles.overviewStats}>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>{stats.total}</Text>
              <Text className={styles.overviewLabel}>本周线索总量</Text>
            </View>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>{stats.replied}</Text>
              <Text className={styles.overviewLabel}>已闭环处置</Text>
            </View>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>{avgResponseTime}</Text>
              <Text className={styles.overviewLabel}>平均响应时间</Text>
            </View>
            <View className={styles.overviewItem}>
              <Text className={styles.overviewValue}>{templateUsage}</Text>
              <Text className={styles.overviewLabel}>模板累计使用</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.statsSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>核心指标</Text>
          <Text className={styles.sectionTag}>本周</Text>
        </View>
        <View className={styles.statsGrid}>
          <StatCard
            label="待处理线索"
            value={stats.pending}
            accent="danger"
            trend="down"
            trendValue="较昨日-2"
          />
          <StatCard
            label="处理中线索"
            value={stats.processing}
            accent="warning"
          />
          <StatCard
            label="紧急事件"
            value={stats.urgent}
            accent="danger"
            trend="up"
            trendValue="较上周+1"
          />
          <StatCard
            label="闭环率"
            value={`${Math.round((stats.replied / stats.total) * 100)}%`}
            accent="success"
          />
        </View>
      </View>

      <View className={styles.typeSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>事件类型分布</Text>
          <Text className={styles.sectionTag}>共 {typeData.length} 类</Text>
        </View>
        <View className={styles.typeCard}>
          <View className={styles.typeList}>
            {typeData.map((item) => (
              <View key={item.type} className={styles.typeItem}>
                <View className={styles.typeInfo}>
                  <View className={styles.typeDot} style={{ backgroundColor: item.color }} />
                  <Text className={styles.typeLabel}>{item.label}</Text>
                </View>
                <View className={styles.typeBarWrap}>
                  <View
                    className={styles.typeBar}
                    style={{
                      width: `${(item.count / maxTypeCount) * 100}%`,
                      backgroundColor: item.color
                    }}
                  />
                </View>
                <Text className={styles.typeValue}>{item.count}件</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.trendSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>近7天舆情趋势</Text>
          <Text className={styles.sectionTag}>线索数量</Text>
        </View>
        <View className={styles.trendCard}>
          <View className={styles.trendBars}>
            {trendData.map((item) => (
              <View key={item.day} className={styles.trendBarItem}>
                <View
                  className={styles.trendBar}
                  style={{ height: `${item.height}rpx` }}
                  data-count={item.count}
                />
                <Text className={styles.trendLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={stats.typeSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>部门任务完成率</Text>
          <Text className={styles.sectionTag}>按角色统计</Text>
        </View>
        <View className={styles.typeCard}>
          <View className={styles.typeList}>
            {roleStats.map((item) => (
              <View key={item.role} className={styles.typeItem}>
                <View className={styles.typeInfo}>
                  <View
                    className={styles.typeDot}
                    style={{
                      backgroundColor:
                        item.rate >= 80
                          ? '#22C55E'
                          : item.rate >= 50
                          ? '#F5A623'
                          : '#E5484D'
                    }}
                  />
                  <Text className={styles.typeLabel}>{item.label}</Text>
                </View>
                <View className={styles.typeBarWrap}>
                  <View
                    className={styles.typeBar}
                    style={{
                      width: `${item.rate}%`,
                      background:
                        item.rate >= 80
                          ? 'linear-gradient(90deg, #22C55E, #16A34A)'
                          : item.rate >= 50
                          ? 'linear-gradient(90deg, #F5A623, #F97316)'
                          : 'linear-gradient(90deg, #E5484D, #DC2626)'
                    }}
                  />
                </View>
                <Text className={styles.typeValue}>{item.rate}%</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.suggestSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>智能建议</Text>
        </View>
        <View className={styles.suggestCard}>
          <Text className={styles.suggestTitle}>📊 基于本周数据分析</Text>
          <View className={styles.suggestItem}>
            <Text className={styles.suggestIcon}>🎯</Text>
            <Text className={styles.suggestText}>
              <Text className={styles.highlight}>宿舍管理和食堂卫生</Text>类事件占比43%，
              建议后勤部门开展专项排查，预防类似问题重复发生。
            </Text>
          </View>
          <View className={styles.suggestItem}>
            <Text className={styles.suggestIcon}>⏰</Text>
            <Text className={styles.suggestText}>
              <Text className={styles.highlight}>周末夜间</Text>（22:00-次日06:00）事件响应时间较长，
              建议加强值班配置，确保15分钟内响应。
            </Text>
          </View>
          <View className={styles.suggestItem}>
            <Text className={styles.suggestIcon}>📝</Text>
            <Text className={styles.suggestText}>
              「情绪安抚」类模板使用频率最高，建议继续优化模板库，
              增加更多<Text className={styles.highlight}>场景化回复话术</Text>。
            </Text>
          </View>
          <View className={styles.suggestItem}>
            <Text className={styles.suggestIcon}>👥</Text>
            <Text className={styles.suggestText}>
              辅导员角色任务完成率较高，建议各部门学习学工系统的
              <Text className={styles.highlight}>快速响应机制</Text>。
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default StatsPage;
