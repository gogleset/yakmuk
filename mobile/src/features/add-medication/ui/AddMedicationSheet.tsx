import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { searchDrugsByName } from '@/entities/medication/api/search-drugs';
import type { DrugSearchItem } from '@/entities/medication/model/types';
import { useAddMedicationMutation } from '@/features/add-medication/model/useAddMedicationMutation';
import { DrugSearchPreview } from '@/features/add-medication/ui/DrugSearchPreview';
import { COLORS } from '@/shared/config/theme';
import {
  Button,
  Caption,
  Card,
  EmptyHint,
  Icons,
  Input,
  Muted,
  PageSheet,
} from '@/shared/ui';

type Step = 'search' | 'confirm';

type Props = {
  visible: boolean;
  userId: string | undefined;
  onClose: () => void;
  onAdded: () => void | Promise<void>;
};

/** 약 추가: 공공 API 검색 → 선택 → 시간 확인 */
export function AddMedicationSheet({
  visible,
  userId,
  onClose,
  onAdded,
}: Props) {
  const [step, setStep] = useState<Step>('search');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<DrugSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DrugSearchItem | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualName, setManualName] = useState('');
  const [medTime, setMedTime] = useState('08:00');

  // 시트 닫힐 때 상태 초기화
  useEffect(() => {
    if (visible) return;
    setStep('search');
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setSearching(false);
    setSearchError(null);
    setSelected(null);
    setManualMode(false);
    setManualName('');
    setMedTime('08:00');
  }, [visible]);

  // 검색어 디바운스
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  // 공공 API 검색
  useEffect(() => {
    if (!visible || manualMode || step !== 'search') return;
    if (debouncedQuery.length < 2) {
      setResults([]);
      setSearchError(null);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);
    setSearchError(null);

    void searchDrugsByName(debouncedQuery)
      .then((res) => {
        if (cancelled) return;
        setResults(res.items);
      })
      .catch((e) => {
        if (cancelled) return;
        setResults([]);
        setSearchError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, visible, manualMode, step]);

  const pickDrug = (item: DrugSearchItem) => {
    setSelected(item);
    setManualMode(false);
    setStep('confirm');
  };

  const goManualConfirm = () => {
    if (!manualName.trim()) {
      Alert.alert('약 이름', '약 이름을 입력해 주세요');
      return;
    }
    setSelected(null);
    setStep('confirm');
  };

  const addMut = useAddMedicationMutation({
    onSuccess: async () => {
      await onAdded();
      onClose();
    },
  });

  const submitAdd = () => {
    if (!userId) {
      Alert.alert('추가하지 못했어요', '로그인이 필요해요');
      return;
    }
    const name = (selected?.itemName ?? manualName).trim();
    if (!name) {
      Alert.alert('약 이름', '약 이름을 입력해 주세요');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(medTime.trim())) {
      Alert.alert('시간', '시간은 HH:MM 형식으로 입력해 주세요');
      return;
    }
    addMut.mutate({
      userId,
      name,
      scheduledTime: medTime.trim(),
    });
  };

  const title =
    step === 'search'
      ? manualMode
        ? '직접 입력'
        : '약 검색'
      : '먹는 시간';

  return (
    <PageSheet visible={visible} title={title} onClose={onClose}>
      {step === 'search' && !manualMode ? (
        <View className="flex-1 px-5">
          <Input
            placeholder="약 이름 검색 (예: 타이레놀)"
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          <Caption className="mt-2">
            식약처 의약품 정보로 검색해요. 없으면 직접 입력할 수 있어요.
          </Caption>

          {searching ? (
            <View className="mt-6 items-center">
              <ActivityIndicator color={COLORS.brand} />
            </View>
          ) : null}

          {searchError ? (
            <EmptyHint message={searchError} />
          ) : debouncedQuery.length >= 2 && !searching && results.length === 0 ? (
            <EmptyHint message="검색 결과가 없어요. 직접 입력해 보세요." />
          ) : null}

          <FlatList
            className="mt-3 flex-1"
            data={results}
            keyExtractor={(item) => item.itemSeq}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              debouncedQuery.length < 2 ? (
                <Muted className="mt-4">두 글자 이상 입력해 주세요</Muted>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => pickDrug(item)}
                className="mb-2 active:opacity-70"
              >
                <Card>
                  <DrugSearchPreview item={item} variant="compact" />
                </Card>
              </Pressable>
            )}
          />

          <View className="gap-2 pb-2 pt-3">
            <Button
              label="직접 입력"
              variant="outline"
              icon={Icons.Pill}
              onPress={() => {
                setManualMode(true);
                setManualName(query.trim());
              }}
            />
          </View>
        </View>
      ) : null}

      {step === 'search' && manualMode ? (
        <View className="gap-3 px-5">
          <Input
            placeholder="예: 혈압약"
            value={manualName}
            onChangeText={setManualName}
            autoFocus
          />
          <Button label="다음" onPress={goManualConfirm} />
          <Button
            label="검색으로 돌아가기"
            variant="ghost"
            onPress={() => setManualMode(false)}
          />
        </View>
      ) : null}

      {step === 'confirm' ? (
        <View className="gap-3 px-5">
          {selected ? (
            <Card>
              <DrugSearchPreview item={selected} variant="detail" />
            </Card>
          ) : (
            <Card className="gap-1">
              <Text className="font-semibold text-brand">{manualName.trim()}</Text>
            </Card>
          )}
          <Input
            placeholder="먹는 시간 (예: 08:00)"
            value={medTime}
            onChangeText={setMedTime}
            keyboardType="numbers-and-punctuation"
          />
          <Button
            label={addMut.isPending ? '추가 중…' : '추가하기'}
            icon={Icons.Pill}
            disabled={addMut.isPending}
            onPress={submitAdd}
          />
          <Button
            label="다시 고르기"
            variant="ghost"
            onPress={() => setStep('search')}
          />
        </View>
      ) : null}
    </PageSheet>
  );
}
