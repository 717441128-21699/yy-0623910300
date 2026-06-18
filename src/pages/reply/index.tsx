import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import TemplateCard from '@/components/TemplateCard';
import { useClueStore } from '@/store/useClueStore';
import { TEMPLATE_CATEGORY_MAP, AUDIENCE_MAP } from '@/types';
import type { TemplateCategory, TargetAudience } from '@/types';
import styles from './index.module.scss';
import classnames from 'classnames';

const ReplyPage: React.FC = () => {
  const [selectedAudience, setSelectedAudience] = useState<TargetAudience | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const templates = useClueStore((s) => s.templates);

  const audienceOptions: { key: TargetAudience | 'all'; icon: string; label: string }[] = [
    { key: 'all', icon: '📋', label: '全部' },
    { key: 'students', icon: '🎓', label: AUDIENCE_MAP.students.label },
    { key: 'parents', icon: '👨‍👩‍👧', label: AUDIENCE_MAP.parents.label },
    { key: 'public', icon: '📢', label: AUDIENCE_MAP.public.label }
  ];

  const categoryOptions: { key: TemplateCategory | 'all'; label: string }[] = [
    { key: 'all', label: '全部分类' },
    ...Object.entries(TEMPLATE_CATEGORY_MAP).map(([k, v]) => ({
      key: k as TemplateCategory,
      label: v.label
    }))
  ];

  const filteredTemplates = useMemo(() => {
    return templates
      .filter((t) => {
        if (selectedAudience !== 'all' && t.audience !== selectedAudience) return false;
        if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
        return true;
      })
      .sort((a, b) => b.usageCount - a.usageCount);
  }, [templates, selectedAudience, selectedCategory]);

  const handleCreate = () => {
    Taro.navigateTo({ url: '/pages/template-edit/index' });
    console.log('[ReplyPage] 点击创建模板');
  };

  useDidShow(() => {
    console.log('[ReplyPage] 页面显示，模板总数:', templates.length);
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
          <Text className={styles.welcomeTitle}>温和回复 · 校园语境</Text>
          <Text className={styles.welcomeSubtitle}>
            避免官腔，稳定情绪，快速生成面向不同场景的回应文案
          </Text>
          <View className={styles.featureRow}>
            <View className={styles.featureItem}>
              <Text className={styles.featureIcon}>🎓</Text>
              <Text className={styles.featureText}>学生群</Text>
            </View>
            <View className={styles.featureItem}>
              <Text className={styles.featureIcon}>👨‍👩‍👧</Text>
              <Text className={styles.featureText}>家长群</Text>
            </View>
            <View className={styles.featureItem}>
              <Text className={styles.featureIcon}>📢</Text>
              <Text className={styles.featureText}>校内公告</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.audienceTabs}>
        <Text className={styles.audienceTitle}>选择发布对象</Text>
        <View className={styles.audienceRow}>
          {audienceOptions.map((opt) => (
            <View
              key={opt.key}
              className={classnames(
                styles.audienceCard,
                selectedAudience === opt.key && styles.active
              )}
              onClick={() => setSelectedAudience(opt.key)}
            >
              <Text className={styles.audienceIcon}>{opt.icon}</Text>
              <Text className={styles.audienceLabel}>{opt.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.categorySection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>模板分类</Text>
        </View>
        <View className={styles.categoryScroll}>
          {categoryOptions.map((opt) => (
            <View
              key={opt.key}
              className={classnames(
                styles.categoryChip,
                selectedCategory === opt.key && styles.active
              )}
              onClick={() => setSelectedCategory(opt.key)}
            >
              <Text className={styles.categoryChipText}>{opt.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.listSection}>
        <View className={styles.listTitleRow}>
          <Text className={styles.listTitle}>模板列表</Text>
          <Text className={styles.listCount}>
            {filteredTemplates.length} 个模板
          </Text>
        </View>

        <View className={styles.tipsCard}>
          <Text className={styles.tipsTitle}>💡 使用建议</Text>
          <Text className={styles.tipsText}>
            周末夜间突发舆情时，优先选择「情绪安抚」类模板先稳住学生情绪，
            再推动责任部门核实信息后发布「进展通报」或「正式通知」。
          </Text>
        </View>

        {filteredTemplates.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📝</Text>
            <Text className={styles.emptyText}>
              暂无匹配的模板
              {'\n'}
              点击右下角按钮创建新模板
            </Text>
          </View>
        ) : (
          filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))
        )}
      </View>

      <Button className={styles.createFab} onClick={handleCreate}>
        <Text className={styles.createFabIcon}>✏️</Text>
        <Text className={styles.createFabText}>新建模板</Text>
      </Button>
    </ScrollView>
  );
};

export default ReplyPage;
