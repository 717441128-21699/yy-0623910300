import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Input, Textarea, Button } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import {
  EVENT_TYPE_MAP,
  TEMPLATE_CATEGORY_MAP,
  AUDIENCE_MAP
} from '@/types';
import type {
  EventType,
  TemplateCategory,
  TargetAudience
} from '@/types';
import { useClueStore } from '@/store/useClueStore';
import { renderTemplate, copyToClipboard } from '@/utils';
import styles from './index.module.scss';
import classnames from 'classnames';

const TemplateEditPage: React.FC = () => {
  const router = useRouter();
  const templateId = router.params?.id;
  const isEdit = !!templateId;

  const getTemplateById = useClueStore((s) => s.getTemplateById);
  const addTemplate = useClueStore((s) => s.addTemplate);
  const updateTemplate = useClueStore((s) => s.updateTemplate);
  const deleteTemplate = useClueStore((s) => s.deleteTemplate);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('explanation');
  const [eventType, setEventType] = useState<EventType | ''>('');
  const [audience, setAudience] = useState<TargetAudience>('students');
  const [showPreview, setShowPreview] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && templateId) {
      const tpl = getTemplateById(templateId);
      if (tpl) {
        setTitle(tpl.title);
        setContent(tpl.content);
        setCategory(tpl.category);
        setEventType(tpl.eventType || '');
        setAudience(tpl.audience);
      }
    }
  }, [templateId, isEdit, getTemplateById]);

  const extractedVariables = useMemo(() => {
    const matches = content.match(/\{\{(\w+)\}\}/g) || [];
    const vars = Array.from(new Set(matches.map((m) => m.slice(2, -2))));
    return vars;
  }, [content]);

  useEffect(() => {
    setVariableValues((prev) => {
      const next: Record<string, string> = {};
      extractedVariables.forEach((v) => {
        next[v] = prev[v] || '';
      });
      return next;
    });
  }, [extractedVariables]);

  const categoryOptions = Object.entries(TEMPLATE_CATEGORY_MAP).map(([k, v]) => ({
    key: k as TemplateCategory,
    label: v.label,
    color: v.color
  }));

  const audienceOptions = Object.entries(AUDIENCE_MAP).map(([k, v]) => ({
    key: k as TargetAudience,
    label: v.label,
    color: v.color
  }));

  const eventTypeOptions = [
    { key: '', label: '通用', color: '#78909C' },
    ...Object.entries(EVENT_TYPE_MAP).map(([k, v]) => ({
      key: k as EventType,
      label: v.label,
      color: v.color
    }))
  ];

  const handleCancel = () => {
    Taro.navigateBack();
  };

  const handleDelete = () => {
    if (!isEdit || !templateId) return;
    Taro.showModal({
      title: '确认删除',
      content: '删除后模板将无法恢复，确定要删除吗？',
      confirmColor: '#E5484D',
      success: (res) => {
        if (res.confirm) {
          deleteTemplate(templateId);
          Taro.showToast({ title: '已删除', icon: 'success' });
          setTimeout(() => Taro.navigateBack(), 800);
        }
      }
    });
  };

  const handleSave = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入模板标题', icon: 'none' });
      return;
    }
    if (!content.trim()) {
      Taro.showToast({ title: '请输入模板内容', icon: 'none' });
      return;
    }

    const templateData = {
      title: title.trim(),
      content: content.trim(),
      category,
      audience,
      eventType: eventType || undefined,
      variables: extractedVariables
    };

    if (isEdit && templateId) {
      updateTemplate(templateId, templateData);
      Taro.showToast({ title: '修改成功', icon: 'success' });
    } else {
      addTemplate(templateData);
      Taro.showToast({ title: '创建成功', icon: 'success' });
    }
    console.log('[TemplateEditPage] 保存模板:', title, '变量:', extractedVariables);
    setTimeout(() => Taro.navigateBack(), 1000);
  };

  const handleCopyPreview = async () => {
    const previewText = renderTemplate(content, variableValues);
    const ok = await copyToClipboard(previewText);
    if (ok) {
      Taro.showToast({ title: '已复制预览内容', icon: 'success' });
    }
  };

  useDidShow(() => {
    console.log('[TemplateEditPage] 页面显示', isEdit ? '编辑模式' : '新建模式');
  });

  const previewText = useMemo(() => {
    return renderTemplate(content, variableValues);
  }, [content, variableValues]);

  return (
    <View className={styles.page}>
      <View className={styles.content}>
        <View className={styles.tipsCard}>
          <Text className={styles.tipsTitle}>✨ {isEdit ? '编辑回复模板' : '创建回复模板'}</Text>
          <Text className={styles.tipsText}>
            使用 {'{{变量名}}'} 格式定义占位符，如 {'{{location}}'}、{'{{department}}'}。
            保存时系统会自动提取所有变量，使用时可以一键替换。
          </Text>
        </View>

        <View className={styles.formCard}>
          <Text className={styles.sectionTitle}>基本属性</Text>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>
              模板标题<Text className={styles.required}>*</Text>
            </Text>
            <Input
              className={styles.formInput}
              placeholder="如：夜间问题情绪安抚（学生群版）"
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
              maxlength={50}
            />
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>
              模板分类<Text className={styles.required}>*</Text>
            </Text>
            <View className={styles.tagRow}>
              {categoryOptions.map((opt) => (
                <View
                  key={opt.key}
                  className={classnames(styles.tagItem, category === opt.key && styles.active)}
                  onClick={() => setCategory(opt.key)}
                >
                  <Text className={styles.tagText}>
                    <Text className={styles.colorDot} style={{ backgroundColor: opt.color }} />
                    {opt.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>
              适用场景<Text className={styles.required}>*</Text>
            </Text>
            <View className={styles.tagRow}>
              {audienceOptions.map((opt) => (
                <View
                  key={opt.key}
                  className={classnames(styles.tagItem, audience === opt.key && styles.active)}
                  onClick={() => setAudience(opt.key)}
                >
                  <Text className={styles.tagText}>
                    <Text className={styles.colorDot} style={{ backgroundColor: opt.color }} />
                    {opt.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>关联事件类型（选填）</Text>
            <View className={styles.tagRow}>
              {eventTypeOptions.map((opt) => (
                <View
                  key={opt.key}
                  className={classnames(styles.tagItem, eventType === opt.key && styles.active)}
                  onClick={() => setEventType(opt.key)}
                >
                  <Text className={styles.tagText}>
                    <Text className={styles.colorDot} style={{ backgroundColor: opt.color }} />
                    {opt.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.formCard}>
          <Text className={styles.sectionTitle}>模板内容</Text>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>
              回复文案<Text className={styles.required}>*</Text>
            </Text>
            <Textarea
              className={styles.formTextarea}
              placeholder={`在此输入回复模板内容...\n\n变量示例：\n各位同学好～\n关于 {{location}} 的 {{issue}} 问题，我们已收到反馈！\n{{department}} 正在紧急处理中...`}
              value={content}
              onInput={(e) => setContent(e.detail.value)}
              maxlength={2000}
              autoHeight={false}
            />
            <Text className={styles.hint}>
              💡 用 {'{{变量名}}'} 标记需要替换的部分，建议使用有语义的英文命名，避免空格和特殊字符
            </Text>
          </View>

          <View className={styles.variablesSection}>
            <Text className={styles.variablesTitle}>
              📋 已识别变量（{extractedVariables.length}个）
            </Text>
            {extractedVariables.length > 0 ? (
              <View className={styles.variablesList}>
                {extractedVariables.map((v) => (
                  <Text key={v} className={styles.variableChip}>
                    {'{{' + v + '}}'}
                  </Text>
                ))}
              </View>
            ) : (
              <Text className={styles.noVariables}>
                暂未识别到变量，在内容中使用 {'{{变量名}}'} 格式添加
              </Text>
            )}
          </View>
        </View>

        <View className={styles.formCard}>
          <View className={styles.sectionTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>实时预览</Text>
            <Text
              className={styles.previewToggle}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? '收起' : '展开'}
            </Text>
          </View>

          {showPreview && (
            <View className={styles.previewSection}>
              {extractedVariables.length > 0 && (
                <View style={{ marginBottom: '16rpx' }}>
                  {extractedVariables.map((v) => (
                    <View key={v} className={styles.variableInputRow}>
                      <Text className={styles.variableInputLabel}>{v}</Text>
                      <Input
                        className={styles.variableInput}
                        placeholder={`输入 ${v} 的值`}
                        value={variableValues[v] || ''}
                        onInput={(e) => setVariableValues((prev) => ({
                          ...prev,
                          [v]: e.detail.value
                        }))}
                      />
                    </View>
                  ))}
                </View>
              )}

              <View className={styles.previewHeader}>
                <Text className={styles.previewTitle}>渲染效果：</Text>
                <Text className={styles.previewToggle} onClick={handleCopyPreview}>
                  📋 复制
                </Text>
              </View>
              <View className={styles.previewBox}>
                <Text className={styles.previewText}>{previewText}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View className={styles.bottomBar}>
        {isEdit && (
          <Button className={`${styles.btn} ${styles.btnTertiary}`} onClick={handleDelete}>
            删除
          </Button>
        )}
        <Button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleCancel}>
          取消
        </Button>
        <Button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>
          保存模板
        </Button>
      </View>
    </View>
  );
};

export default TemplateEditPage;
