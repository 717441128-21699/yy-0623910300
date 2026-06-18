import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import TemplateCard from '@/components/TemplateCard';
import TypeTag from '@/components/TypeTag';
import StatusBadge from '@/components/StatusBadge';
import { useClueStore } from '@/store/useClueStore';
import { TEMPLATE_CATEGORY_MAP, AUDIENCE_MAP, EVENT_TYPE_MAP } from '@/types';
import type { TemplateCategory, TargetAudience, Clue } from '@/types';
import { renderTemplate, copyToClipboard, formatTime } from '@/utils';
import styles from './index.module.scss';
import classnames from 'classnames';

const ReplyPage: React.FC = () => {
  const router = useRouter();
  const clues = useClueStore((s) => s.clues);
  const templates = useClueStore((s) => s.templates);
  const getRecommendedTemplates = useClueStore((s) => s.getRecommendedTemplates);
  const incrementTemplateUsage = useClueStore((s) => s.incrementTemplateUsage);

  const [selectedClueId, setSelectedClueId] = useState<string>('');
  const [showCluePicker, setShowCluePicker] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<TargetAudience>('students');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [showUseMode, setShowUseMode] = useState(false);

  const selectedClue = useMemo(
    () => clues.find((c) => c.id === selectedClueId),
    [clues, selectedClueId]
  );

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId),
    [templates, selectedTemplateId]
  );

  const displayedTemplates = useMemo(() => {
    let list = templates.filter((t) => t.audience === selectedAudience);
    if (selectedCategory !== 'all') {
      list = list.filter((t) => t.category === selectedCategory);
    }
    if (selectedClue) {
      const recommended = list.filter((t) => t.eventType === selectedClue.eventType);
      const others = list.filter((t) => !t.eventType || t.eventType !== selectedClue.eventType);
      return [...recommended.sort((a, b) => b.usageCount - a.usageCount), ...others];
    }
    return list.sort((a, b) => b.usageCount - a.usageCount);
  }, [templates, selectedAudience, selectedCategory, selectedClue]);

  const audienceTabs: { key: TargetAudience; icon: string; label: string }[] = [
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

  useEffect(() => {
    const urlClueId = router.params.clueId;
    const urlTemplateId = router.params.templateId;
    if (urlClueId && clues.some((c) => c.id === urlClueId)) {
      setSelectedClueId(urlClueId);
    }
    if (urlTemplateId && templates.some((t) => t.id === urlTemplateId)) {
      setSelectedTemplateId(urlTemplateId);
      setShowUseMode(true);
    }
  }, [router.params, clues, templates]);

  useEffect(() => {
    if (selectedTemplate) {
      const initialValues: Record<string, string> = {};
      selectedTemplate.variables.forEach((v) => {
        initialValues[v] = variableValues[v] || '';
      });
      setVariableValues(initialValues);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    if (selectedClue && selectedTemplate) {
      const autoFill: Record<string, string> = {};
      const lowerDesc = selectedClue.description.toLowerCase();
      if (selectedClue.location) autoFill['location'] = selectedClue.location;
      if (selectedClue.title) autoFill['topic'] = selectedClue.title;
      autoFill['issue'] = selectedClue.title;
      if (selectedClue.eventType) {
        const deptMap: Record<string, string> = {
          dorm: '宿管中心',
          canteen: '餐饮中心',
          exam: '教务处',
          conflict: '学生工作处',
          teaching: '教务处',
          service: '后勤处',
          other: '相关部门'
        };
        autoFill['department'] = deptMap[selectedClue.eventType] || '相关部门';
      }
      autoFill['date'] = formatTime(new Date().toISOString());

      setVariableValues((prev) => ({
        ...autoFill,
        ...prev
      }));
    }
  }, [selectedClue, selectedTemplateId]);

  const handleSelectClue = (clue: Clue) => {
    setSelectedClueId(clue.id);
    setShowCluePicker(false);
    setSelectedTemplateId('');
    setShowUseMode(false);
    console.log('[ReplyPage] 选中线索:', clue.title);
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowUseMode(true);
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCopy = async () => {
    if (!selectedTemplate) return;
    const content = renderTemplate(selectedTemplate.content, variableValues);
    const ok = await copyToClipboard(content);
    if (ok) {
      incrementTemplateUsage(selectedTemplate.id);
      Taro.showToast({ title: '已复制到剪贴板', icon: 'success' });
    }
  };

  const handleCreateTemplate = () => {
    Taro.navigateTo({ url: '/pages/template-edit/index' });
  };

  const handleSwitchAudience = (audience: TargetAudience) => {
    setSelectedAudience(audience);
    setSelectedTemplateId('');
    setShowUseMode(false);
  };

  const renderPreview = () => {
    if (!selectedTemplate) return null;
    const content = renderTemplate(selectedTemplate.content, variableValues);
    return content;
  };

  const allVarsFilled = useMemo(() => {
    if (!selectedTemplate) return true;
    return selectedTemplate.variables.every((v) => variableValues[v]?.trim());
  }, [selectedTemplate, variableValues]);

  useDidShow(() => {
    console.log('[ReplyPage] 页面显示，模板数:', templates.length, '线索数:', clues.length);
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
            选择一条舆情，一键生成面向不同对象的回应文案
          </Text>
        </View>
      </View>

      <View className={styles.clueSelector}>
        <Text className={styles.selectorLabel}>选择回应的舆情事件</Text>
        {selectedClue ? (
          <View className={styles.selectedClueCard} onClick={() => setShowCluePicker(true)}>
            <View className={styles.selectedClueInfo}>
              <View className={styles.selectedClueTags}>
                <StatusBadge type="urgent" value={selectedClue.urgentLevel} size="sm" />
                <TypeTag type="event" value={selectedClue.eventType} size="sm" />
              </View>
              <Text className={styles.selectedClueTitle}>{selectedClue.title}</Text>
              <Text className={styles.selectedClueDesc} numberOfLines={2}>
                {selectedClue.description}
              </Text>
            </View>
            <Text className={styles.changeClueBtn}>切换</Text>
          </View>
        ) : (
          <View className={styles.selectClueBtn} onClick={() => setShowCluePicker(true)}>
            <Text className={styles.selectClueIcon}>📋</Text>
            <Text className={styles.selectClueText}>点击选择要回应的舆情事件</Text>
            <Text className={styles.selectClueHint}>选择后可自动填充变量，生成精准回复</Text>
          </View>
        )}
      </View>

      <View className={styles.audienceTabs}>
        {audienceTabs.map((tab) => (
          <View
            key={tab.key}
            className={classnames(
              styles.audienceTab,
              selectedAudience === tab.key && styles.active
            )}
            onClick={() => handleSwitchAudience(tab.key)}
          >
            <Text className={styles.audienceTabIcon}>{tab.icon}</Text>
            <Text className={styles.audienceTabText}>{tab.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.categorySection}>
        <ScrollView className={styles.categoryScroll} scrollX>
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
        </ScrollView>
      </View>

      {showUseMode && selectedTemplate ? (
        <View className={styles.useModeSection}>
          <View className={styles.useModeHeader}>
            <View>
              <Text className={styles.useModeTitle}>使用模板</Text>
              <Text className={styles.useModeSubtitle}>{selectedTemplate.title}</Text>
            </View>
            <Text className={styles.closeUseMode} onClick={() => setShowUseMode(false)}>
              返回列表
            </Text>
          </View>

          {selectedTemplate.variables.length > 0 && (
            <View className={styles.variablesCard}>
              <Text className={styles.cardTitle}>
                填写变量 <Text style={{ color: '#718096', fontWeight: 'normal', fontSize: '22rpx' }}>
                  （{Object.keys(variableValues).filter((k) => variableValues[k]?.trim()).length}/{selectedTemplate.variables.length} 已填）
                </Text>
              </Text>
              {selectedTemplate.variables.map((v) => (
                <View key={v} className={styles.varItem}>
                  <Text className={styles.varLabel}>{v}</Text>
                  <Input
                    className={styles.varInput}
                    placeholder={`请输入${v}`}
                    value={variableValues[v] || ''}
                    onInput={(e) => handleVariableChange(v, e.detail.value)}
                    maxlength={100}
                  />
                </View>
              ))}
            </View>
          )}

          <View className={styles.previewCard}>
            <View className={styles.previewHeader}>
              <Text className={styles.cardTitle}>回复预览</Text>
              <Text className={styles.copyBtn} onClick={handleCopy}>
                📋 复制
              </Text>
            </View>
            <View className={styles.previewBox}>
              <Text className={styles.previewText}>{renderPreview()}</Text>
            </View>
          </View>

          <Button
            className={classnames(styles.useBtn, !allVarsFilled && styles.useBtnDisabled)}
            onClick={handleCopy}
          >
            复制到剪贴板
          </Button>
        </View>
      ) : (
        <View className={styles.listSection}>
          <View className={styles.listTitleRow}>
            <Text className={styles.listTitle}>
              {AUDIENCE_MAP[selectedAudience].label}模板
            </Text>
            <Text className={styles.listCount}>
              {displayedTemplates.length} 个
            </Text>
          </View>

          {selectedClue && (
            <View className={styles.tipsCard}>
              <Text className={styles.tipsTitle}>💡 智能推荐</Text>
              <Text className={styles.tipsText}>
                根据【{EVENT_TYPE_MAP[selectedClue.eventType]?.label}】事件，已为您优先展示相关模板
              </Text>
            </View>
          )}

          {!selectedClue && (
            <View className={styles.tipsCard}>
              <Text className={styles.tipsTitle}>💡 使用建议</Text>
              <Text className={styles.tipsText}>
                周末夜间突发舆情时，优先选择「情绪安抚」类模板先稳住学生情绪，
                再推动责任部门核实后发布「进展通报」。
              </Text>
            </View>
          )}

          {displayedTemplates.length === 0 ? (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📝</Text>
              <Text className={styles.emptyText}>暂无匹配的模板</Text>
            </View>
          ) : (
            displayedTemplates.map((template) => (
              <View
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
              >
                <TemplateCard
                  template={template}
                  showRecommend={
                    !!selectedClue && template.eventType === selectedClue.eventType
                  }
                />
              </View>
            ))
          )}
        </View>
      )}

      <Button className={styles.createFab} onClick={handleCreateTemplate}>
        <Text className={styles.createFabIcon}>✏️</Text>
        <Text className={styles.createFabText}>新建模板</Text>
      </Button>

      {showCluePicker && (
        <View className={styles.modalMask} onClick={() => setShowCluePicker(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>选择舆情事件</Text>
              <Text className={styles.modalClose} onClick={() => setShowCluePicker(false)}>
                ✕
              </Text>
            </View>
            <ScrollView className={styles.modalBody} scrollY>
              {clues.length === 0 ? (
                <View className={styles.emptyState}>
                  <Text className={styles.emptyIcon}>📋</Text>
                  <Text className={styles.emptyText}>暂无舆情线索</Text>
                </View>
              ) : (
                clues.map((clue) => (
                  <View
                    key={clue.id}
                    className={classnames(
                      styles.cluePickerItem,
                      selectedClueId === clue.id && styles.cluePickerSelected
                    )}
                    onClick={() => handleSelectClue(clue)}
                  >
                    <View className={styles.cluePickerTags}>
                      <StatusBadge type="urgent" value={clue.urgentLevel} size="sm" />
                      <TypeTag type="event" value={clue.eventType} size="sm" />
                      <StatusBadge type="status" value={clue.status} size="sm" />
                    </View>
                    <Text className={styles.cluePickerTitle}>{clue.title}</Text>
                    <Text className={styles.cluePickerDesc} numberOfLines={2}>
                      {clue.description}
                    </Text>
                    <Text className={styles.cluePickerTime}>{formatTime(clue.createdAt)}</Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ReplyPage;
