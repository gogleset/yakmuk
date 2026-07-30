import { useRef } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { COLORS, LIMITS } from '@/shared/config/theme';
import { cn } from '@/shared/lib/cn';

type Props = {
  value: string;
  onChangeText: (next: string) => void;
  length?: number;
  autoFocus?: boolean;
  className?: string;
  /** TextInput accessibility */
  accessibilityLabel?: string;
};

/** 초대코드 6칸 — 숨은 Input 1개 + 칸 표시 (붙여넣기·백스페이스) */
export function InviteCodeInput({
  value,
  onChangeText,
  length = LIMITS.inviteCodeLength,
  autoFocus = false,
  className,
  accessibilityLabel = '초대코드',
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const chars = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, length);
  const focusedIndex = Math.min(chars.length, length - 1);

  const handleChange: TextInputProps['onChangeText'] = (raw) => {
    const next = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, length);
    onChangeText(next);
  };

  return (
    <Pressable
      accessibilityRole="none"
      onPress={() => inputRef.current?.focus()}
      className={cn('w-full', className)}
    >
      <View className="flex-row justify-between gap-2">
        {Array.from({ length }, (_, i) => {
          const filled = i < chars.length;
          const isActive = i === focusedIndex;
          return (
            <View
              key={i}
              className="h-14 flex-1 items-center justify-center rounded-[10px] bg-surface"
              style={{
                borderWidth: 1,
                borderColor: isActive ? COLORS.brand : COLORS.line,
              }}
            >
              <Text className="text-2xl font-semibold text-text">
                {chars[i] ?? ''}
              </Text>
              {!filled && isActive ? (
                <View className="absolute bottom-3 h-0.5 w-4 rounded-full bg-brand" />
              ) : null}
            </View>
          );
        })}
      </View>

      {/* 실제 입력 — 화면 밖 */}
      <TextInput
        ref={inputRef}
        value={chars}
        onChangeText={handleChange}
        autoCapitalize="characters"
        autoCorrect={false}
        autoFocus={autoFocus}
        maxLength={length}
        caretHidden
        accessibilityLabel={accessibilityLabel}
        keyboardType="default"
        textContentType="oneTimeCode"
        importantForAutofill="yes"
        style={{
          position: 'absolute',
          opacity: 0.02,
          height: 1,
          width: 1,
        }}
      />
    </Pressable>
  );
}
