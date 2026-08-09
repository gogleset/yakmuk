import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  View,
} from 'react-native';
import { searchDrugsByName } from '@/entities/medication/api/search-drugs';
import {
  expandScheduleDraft,
  isSameScheduleDraft,
  medsToScheduleDraft,
} from '@/entities/medication/lib/scheduleDraft';
import {
  scheduleValidationMessage,
  validatePerWeekdaySchedule,
  validateSameSchedule,
} from '@/entities/medication/lib/daysMask';
import {
  clampMedMetaText,
  parseDoseAmount,
  validateMedicationMetaForm,
} from '@/entities/medication/lib/medicationMeta';
import type {
  DrugSearchItem,
  Medication,
} from '@/entities/medication/model/types';
import {
  emptyMedicationMetaForm,
  MedicationMetaFields,
  type MedicationMetaFormState,
} from '@/entities/medication';
import { useAddMedicationMutation } from '@/features/add-medication/model/useAddMedicationMutation';
import { useReplaceMedicationScheduleMutation } from '@/features/edit-medication/model/useReplaceMedicationScheduleMutation';
import { DrugSearchPreview } from '@/features/medication-sheet/ui/DrugSearchPreview';
import {
  collapseOnNameCleared,
  MedicationScheduleFields,
  useMedicationScheduleDraftState,
} from '@/features/medication-schedule-form';
import { MED_COLOR_DEFAULT } from '@/shared/constants/medColors';
import type { MedDoseUnitId } from '@/shared/constants/medDoseUnits';
import { LIMITS } from '@/shared/constants/limits';
import { ACTIONS, COPY, ERRORS } from '@/shared/copy';
import { COLORS, LAYOUT } from '@/shared/config/theme';
import {
  BottomSheet,
  Button,
  Card,
  FadeInView,
  Fallback,
  Input,
  KokiIllustration,
  LabelMd,
  LabelSm,
  MarqueeTitle,
} from '@/shared/ui';

export type MedicationSheetMode = 'create' | 'edit' | 'view';

type Props = {
  mode: MedicationSheetMode;
  userId: string | undefined;
  /** edit | view — 같은 이름 sibling 슬롯 */
  medications?: Medication[];
  onClose: () => void;
  /** create/edit 저장 성공 후 */
  onSaved?: () => void | Promise<void>;
  /** view → 수정 라우트 */
  onEditPress?: () => void;
};

function metaFromMedications(meds: Medication[]): MedicationMetaFormState {
  const first = meds[0];
  if (!first) return emptyMedicationMetaForm(MED_COLOR_DEFAULT);
  return {
    efficacy: clampMedMetaText(first.efficacy ?? ''),
    useMethod: clampMedMetaText(first.useMethod ?? ''),
    storage: clampMedMetaText(first.storage ?? ''),
    warning: clampMedMetaText(first.warning ?? ''),
    doseAmount:
      first.doseAmount == null ? '' : String(first.doseAmount),
    doseUnit: (first.doseUnit as MedDoseUnitId | null) ?? null,
    color: first.color || MED_COLOR_DEFAULT,
    unitPickerOpen: false,
  };
}

/** 약 등록 · 수정 · 상세(readonly) — mode로 분기 */
export function MedicationSheet({
  mode,
  userId,
  medications = [],
  onClose,
  onSaved,
  onEditPress,
}: Props) {
  const isCreate = mode === 'create';
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const readOnly = isView;

  const initialDraft = useMemo(
    () => (isCreate ? undefined : medsToScheduleDraft(medications)),
    [isCreate, medications],
  );
  const initialName = isCreate ? '' : (medications[0]?.name ?? '');
  const initialMeta = useMemo(
    () =>
      isCreate
        ? emptyMedicationMetaForm(MED_COLOR_DEFAULT)
        : metaFromMedications(medications),
    [isCreate, medications],
  );
  const initialItemSeq = isCreate
    ? null
    : (medications[0]?.itemSeq ?? null);

  const [visible, setVisible] = useState(true);

  // --- create: 검색 · progressive ---
  const [nameConfirmed, setNameConfirmed] = useState(!isCreate);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DrugSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selected, setSelected] = useState<DrugSearchItem | null>(null);
  const [typedName, setTypedName] = useState('');
  const [itemSeq, setItemSeq] = useState<string | null>(initialItemSeq);
  const [detailItem, setDetailItem] = useState<DrugSearchItem | null>(null);
  const [formStep, setFormStep] = useState<'meta' | 'schedule'>(
    isCreate ? 'meta' : 'schedule',
  );

  // --- edit/view: 이름 편집 ---
  const [name, setName] = useState(initialName);
  const [meta, setMeta] = useState<MedicationMetaFormState>(initialMeta);

  const {
    draft,
    setDraft,
    handleScheduleModeChange,
    handleWeekdaysChange,
    handleDaysModeChange,
  } = useMedicationScheduleDraftState(initialDraft);

  const createMedName = (selected?.itemName ?? typedName).trim();
  const editMedName = name.trim();
  const medName = isCreate ? createMedName : editMedName;
  const scheduleStep =
    isCreate && nameConfirmed && formStep === 'schedule';

  const addMut = useAddMedicationMutation({
    onSuccess: async () => {
      // dismiss 먼저 — invalidate로 id가 바뀌어도 페이지가 에러 화면으로 덮지 않게
      setVisible(false);
      await onSaved?.();
    },
  });

  const replaceMut = useReplaceMedicationScheduleMutation({
    onSuccess: async () => {
      setVisible(false);
      await onSaved?.();
    },
  });

  const createDirty =
    !!query ||
    !!typedName ||
    !!selected ||
    !!meta.efficacy ||
    !!meta.useMethod ||
    !!meta.storage ||
    !!meta.warning ||
    !!meta.doseAmount ||
    !!meta.doseUnit ||
    meta.color !== MED_COLOR_DEFAULT ||
    draft.slotTimes.length > 1 ||
    draft.weekdays.length > 0;

  const editDirty =
    !!initialDraft &&
    (medName !== initialName ||
      !isSameScheduleDraft(draft, initialDraft) ||
      meta.efficacy !== initialMeta.efficacy ||
      meta.useMethod !== initialMeta.useMethod ||
      meta.storage !== initialMeta.storage ||
      meta.warning !== initialMeta.warning ||
      meta.doseAmount !== initialMeta.doseAmount ||
      meta.doseUnit !== initialMeta.doseUnit ||
      meta.color !== initialMeta.color);

  const dirty = isCreate ? createDirty : isEdit ? editDirty : false;

  const scheduleValid = (() => {
    if (!medName) return false;
    if (isCreate && !nameConfirmed) return false;
    if (draft.scheduleMode === 'same') {
      return !validateSameSchedule(
        draft.slotTimes,
        draft.daysMode,
        draft.weekdays,
      );
    }
    return !validatePerWeekdaySchedule(draft.weekdays, draft.timesByDay);
  })();

  const requestClose = () => {
    if (isView || !dirty) {
      setVisible(false);
      return;
    }
    Alert.alert('작성을 그만둘까요?', '입력한 내용이 사라져요.', [
      { text: '계속 작성', style: 'cancel' },
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => setVisible(false),
      },
    ]);
  };

  const runSearch = () => {
    const q = query.trim();
    if (q.length < LIMITS.drugSearchMinQueryLength) {
      Alert.alert(
        COPY.med.nameAlertTitle,
        `${LIMITS.drugSearchMinQueryLength}글자 이상 입력해 주세요`,
      );
      return;
    }
    setSearching(true);
    setSearchError(null);
    setHasSearched(true);
    void searchDrugsByName(q)
      .then((res) => setResults(res.items))
      .catch((e) => {
        setResults([]);
        setSearchError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => setSearching(false));
  };

  const confirmNameFromSearch = (item: DrugSearchItem) => {
    setSelected(item);
    setTypedName('');
    setItemSeq(item.itemSeq);
    setMeta((prev) => ({
      ...prev,
      efficacy: clampMedMetaText(item.efficacy ?? ''),
      useMethod: clampMedMetaText(item.useMethod ?? ''),
      storage: clampMedMetaText(item.storage ?? ''),
      warning: clampMedMetaText(item.warning ?? ''),
      unitPickerOpen: false,
    }));
    setNameConfirmed(true);
    setFormStep('meta');
    setDetailItem(null);
    setResults([]);
    setHasSearched(false);
  };

  const confirmNameFromQuery = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSelected(null);
    setTypedName(trimmed);
    setItemSeq(null);
    setNameConfirmed(true);
    setFormStep('meta');
    setResults([]);
    setHasSearched(false);
  };

  const clearName = () => {
    setNameConfirmed(false);
    setFormStep('meta');
    setSelected(null);
    setTypedName('');
    setQuery(medName);
    setItemSeq(null);
    setResults([]);
    setHasSearched(false);
  };

  const goNextToSchedule = () => {
    const metaErr = validateMedicationMetaForm(meta);
    if (metaErr) {
      Alert.alert(COPY.med.scheduleAlertTitle, metaErr);
      return;
    }
    setFormStep('schedule');
  };

  const resetCreate = () => {
    Alert.alert(COPY.med.resetConfirmTitle, COPY.med.resetConfirmBody, [
      { text: ACTIONS.cancel, style: 'cancel' },
      {
        text: ACTIONS.reset,
        style: 'destructive',
        onPress: () => {
          const collapsed = collapseOnNameCleared(draft);
          setNameConfirmed(false);
          setFormStep('meta');
          setDraft(collapsed.draft);
          setSelected(null);
          setTypedName('');
          setQuery('');
          setItemSeq(null);
          setResults([]);
          setHasSearched(false);
          setSearchError(null);
          setMeta(emptyMedicationMetaForm(MED_COLOR_DEFAULT));
          setDetailItem(null);
        },
      },
    ]);
  };

  const resetEdit = () => {
    if (!initialDraft) return;
    Alert.alert(COPY.med.resetConfirmTitle, COPY.med.resetConfirmBody, [
      { text: ACTIONS.cancel, style: 'cancel' },
      {
        text: ACTIONS.reset,
        style: 'destructive',
        onPress: () => {
          setName(initialName);
          setMeta(initialMeta);
          setDraft(initialDraft);
        },
      },
    ]);
  };

  const validateAndBuildSlots = () => {
    if (!medName) {
      Alert.alert(COPY.med.nameAlertTitle, ERRORS.med.nameRequired);
      return null;
    }
    const metaErr = validateMedicationMetaForm(meta);
    if (metaErr) {
      Alert.alert(COPY.med.scheduleAlertTitle, metaErr);
      return null;
    }
    const doseAmount = parseDoseAmount(meta.doseAmount);
    if (draft.scheduleMode === 'same') {
      const err = validateSameSchedule(
        draft.slotTimes,
        draft.daysMode,
        draft.weekdays,
      );
      if (err) {
        Alert.alert(COPY.med.scheduleAlertTitle, scheduleValidationMessage(err));
        return null;
      }
    } else {
      const err = validatePerWeekdaySchedule(draft.weekdays, draft.timesByDay);
      if (err) {
        Alert.alert(COPY.med.scheduleAlertTitle, scheduleValidationMessage(err));
        return null;
      }
    }
    const slots = expandScheduleDraft(draft);
    if (slots.length === 0) {
      Alert.alert(COPY.med.scheduleAlertTitle, COPY.med.noScheduleToSave);
      return null;
    }
    return { slots, doseAmount };
  };

  const submitCreate = () => {
    if (!userId) {
      Alert.alert(ERRORS.med.addFailed, ERRORS.auth.required);
      return;
    }
    const built = validateAndBuildSlots();
    if (!built) return;
    addMut.mutate({
      userId,
      name: medName,
      slots: built.slots,
      itemSeq,
      color: meta.color,
      efficacy: meta.efficacy || null,
      useMethod: meta.useMethod || null,
      storage: meta.storage || null,
      warning: meta.warning || null,
      doseAmount: built.doseAmount,
      doseUnit: meta.doseUnit,
    });
  };

  const submitEdit = () => {
    if (!userId) {
      Alert.alert(ERRORS.med.updateFailed, ERRORS.auth.required);
      return;
    }
    const built = validateAndBuildSlots();
    if (!built) return;
    replaceMut.mutate({
      userId,
      replaceMedicationIds: medications.map((med) => med.id),
      name: medName,
      slots: built.slots,
      itemSeq,
      color: meta.color,
      efficacy: meta.efficacy || null,
      useMethod: meta.useMethod || null,
      storage: meta.storage || null,
      warning: meta.warning || null,
      doseAmount: built.doseAmount,
      doseUnit: meta.doseUnit,
    });
  };

  const searchingName = isCreate && !nameConfirmed;

  const sheetTitle = (() => {
    if (isView) return medName || '약 상세';
    if (isEdit) return '약 수정';
    if (nameConfirmed && formStep === 'schedule' && medName) {
      return <MarqueeTitle text={`${medName} 등록`} />;
    }
    return '약 등록';
  })();

  const footer = (() => {
    if (isView) {
      return (
        <View className="flex-row gap-2">
          <Button
            label={ACTIONS.close}
            variant="outline"
            className="flex-1"
            onPress={requestClose}
          />
          <Button
            label={ACTIONS.edit}
            shape="round"
            className="flex-[1.4]"
            onPress={() => onEditPress?.()}
          />
        </View>
      );
    }
    if (searchingName) {
      return (
        <Button
          label={COPY.med.nextStep}
          shape="round"
          disabled={!query.trim()}
          onPress={confirmNameFromQuery}
        />
      );
    }
    if (isCreate && formStep === 'meta') {
      return (
        <View className="flex-row gap-2">
          <Button
            label={COPY.med.resetForm}
            variant="outline"
            className="flex-1"
            onPress={resetCreate}
          />
          <Button
            label={COPY.med.nextStep}
            shape="round"
            className="flex-[1.4]"
            onPress={goNextToSchedule}
          />
        </View>
      );
    }
    if (isCreate) {
      return (
        <View className="flex-row gap-2">
          <Button
            label={COPY.med.prevStep}
            variant="outline"
            className="flex-1"
            onPress={() => setFormStep('meta')}
          />
          <Button
            label={addMut.isPending ? '추가 중…' : '등록하기'}
            shape="round"
            className="flex-[1.4]"
            disabled={!scheduleValid || addMut.isPending}
            onPress={submitCreate}
          />
        </View>
      );
    }
    // edit
    return (
      <View className="flex-row gap-2">
        <Button
          label={COPY.med.resetForm}
          variant="outline"
          className="flex-1"
          onPress={resetEdit}
        />
        <Button
          label={replaceMut.isPending ? '저장 중…' : ACTIONS.save}
          shape="round"
          className="flex-[1.4]"
          disabled={!editDirty || !scheduleValid || replaceMut.isPending}
          onPress={submitEdit}
        />
      </View>
    );
  })();

  const noopMeta = (_next: MedicationMetaFormState) => {};

  return (
    <>
      <BottomSheet
        visible={visible}
        title={sheetTitle}
        presentation="overlay"
        onClose={requestClose}
        onClosed={onClose}
        header={
          searchingName ? (
            <View className="flex-row gap-2">
              <View className="min-w-0 flex-1">
                <Input
                  tone="soft"
                  placeholder="어떤 약인가요?"
                  value={query}
                  onChangeText={setQuery}
                  autoFocus
                  returnKeyType="search"
                  onSubmitEditing={runSearch}
                />
              </View>
              <Button
                label={COPY.med.search}
                size="sm"
                className="self-stretch"
                disabled={searching}
                onPress={runSearch}
              />
            </View>
          ) : undefined
        }
        footer={footer}
      >
        {searchingName ? (
          <View className="gap-2">
            {searching ? (
              <View className="items-center py-2">
                <ActivityIndicator color={COLORS.brand} />
              </View>
            ) : null}
            {searchError ? (
              <Fallback
                image={<KokiIllustration variant="worried" size={72} />}
                message={searchError}
              />
            ) : null}
            {!searching &&
            !searchError &&
            hasSearched &&
            results.length === 0 ? (
              <Fallback
                image={<KokiIllustration variant="thinking" size={72} />}
                message={COPY.med.searchEmpty}
              />
            ) : null}
            {results.length > 0 ? (
              <FadeInView duration="fast" className="gap-2">
                {results.map((item) => (
                  <Card
                    key={item.itemSeq}
                    className="gap-2 border border-line bg-surface"
                    style={LAYOUT.shadow.sameFill}
                  >
                    <Pressable
                      onPress={() => confirmNameFromSearch(item)}
                      className="active:opacity-70"
                    >
                      <DrugSearchPreview item={item} variant="compact" />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setDetailItem(item)}
                      className="self-end rounded-xl bg-brand-soft px-3 py-1.5 active:opacity-70"
                    >
                      <LabelSm>{COPY.med.detailView}</LabelSm>
                    </Pressable>
                  </Card>
                ))}
              </FadeInView>
            ) : null}
          </View>
        ) : isCreate && formStep === 'meta' ? (
          <View className="gap-4">
            <View className="flex-row items-center justify-between gap-2">
              <LabelMd className="flex-1" numberOfLines={2}>
                {medName}
              </LabelMd>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="약 이름 다시 선택"
                onPress={clearName}
                className="rounded-xl bg-surface-soft px-3 py-2 active:opacity-70"
              >
                <LabelSm>{COPY.med.changeName}</LabelSm>
              </Pressable>
            </View>
            <FadeInView duration="fast">
              <MedicationMetaFields value={meta} onChange={setMeta} />
            </FadeInView>
          </View>
        ) : isCreate ? (
          <FadeInView duration="fast">
            <MedicationScheduleFields
              mode="create"
              nameConfirmed={scheduleStep}
              draft={draft}
              onDraftChange={setDraft}
              onScheduleModeChange={handleScheduleModeChange}
              onWeekdaysChange={handleWeekdaysChange}
              onDaysModeChange={handleDaysModeChange}
            />
          </FadeInView>
        ) : (
          <View className="gap-4">
            <Input
              tone="soft"
              placeholder="예: 혈압약"
              value={name}
              onChangeText={setName}
              editable={!readOnly}
            />
            <FadeInView duration="fast">
              <MedicationMetaFields
                value={meta}
                onChange={readOnly ? noopMeta : setMeta}
                readOnly={readOnly}
              />
            </FadeInView>
            <FadeInView step={1} duration="fast">
              <MedicationScheduleFields
                mode="edit"
                nameConfirmed
                draft={draft}
                onDraftChange={setDraft}
                onScheduleModeChange={handleScheduleModeChange}
                onWeekdaysChange={handleWeekdaysChange}
                onDaysModeChange={handleDaysModeChange}
                readOnly={readOnly}
              />
            </FadeInView>
          </View>
        )}
      </BottomSheet>

      {detailItem ? (
        <BottomSheet
          visible
          title={COPY.med.detailView}
          presentation="overlay"
          onClose={() => setDetailItem(null)}
          onClosed={() => setDetailItem(null)}
          footer={
            <View className="flex-row gap-2">
              <Button
                label={ACTIONS.close}
                variant="outline"
                className="flex-1"
                onPress={() => setDetailItem(null)}
              />
              <Button
                label={COPY.med.selectThisDrug}
                shape="round"
                className="flex-[1.4]"
                onPress={() => confirmNameFromSearch(detailItem)}
              />
            </View>
          }
        >
          <FadeInView duration="fast">
            <DrugSearchPreview item={detailItem} variant="detail" />
          </FadeInView>
        </BottomSheet>
      ) : null}
    </>
  );
}
