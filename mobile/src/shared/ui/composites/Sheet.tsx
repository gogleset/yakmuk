import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, LAYOUT, OVERLAY } from '@/shared/config/theme';
import { MOTION } from '@/shared/constants';
import {
  sheetKeyboardLayout,
  subscribeKeyboardBottomInset,
} from '@/shared/lib/keyboardBottomInset';
import { scrollYToRevealField } from '@/shared/lib/scrollToRevealField';
import { Icons } from '@/shared/ui/primitives/Icon';

type SheetProps = {
  visible: boolean;
  title: ReactNode;
  /** 닫기 요청 (× / 스크림) — visible=false로 바꾸는 쪽 */
  onClose: () => void;
  /** 퇴장 애니 끝난 뒤 (router.back 등) */
  onClosed?: () => void;
  children: ReactNode;
  /** 타이틀 아래·스크롤 위 고정 (검색 인풋 등) */
  header?: ReactNode;
  footer?: ReactNode;
  /**
   * modal = RN Modal (설정 등)
   * overlay = 투명 스택 absolute (약 등록 — nested Modal 애니 깨짐 방지)
   */
  presentation?: 'modal' | 'overlay';
};

/** 하단 시트 — 시트 슬라이드 + 배경 페이드 (MOTION 토큰) */
export function BottomSheet({
  visible,
  title,
  onClose,
  onClosed,
  children,
  header,
  footer,
  presentation = 'modal',
}: SheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const screenHeight = Dimensions.get('screen').height;
  const [mounted, setMounted] = useState(visible);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const sheetTranslateY = useRef(new Animated.Value(windowHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const onClosedRef = useRef(onClosed);
  onClosedRef.current = onClosed;

  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const viewportHeightRef = useRef(0);
  const keyboardHeightRef = useRef(0);

  useEffect(() => {
    return subscribeKeyboardBottomInset((h) => {
      keyboardHeightRef.current = h;
      setKeyboardHeight(h);
    });
  }, []);

  const { lift, availableHeight } = useMemo(
    () =>
      sheetKeyboardLayout({
        keyboardHeight,
        windowHeight,
        screenHeight,
      }),
    [keyboardHeight, windowHeight, screenHeight],
  );

  const maxHeight = availableHeight * LAYOUT.sheet.maxHeightRatio;
  const sheetBottomPad =
    keyboardHeight > 0
      ? LAYOUT.sheet.contentGap
      : insets.bottom + LAYOUT.sheet.paddingBottomExtra;
  // 맨 아래 필드(용량 등)가 키보드 위로 스크롤될 여유
  const scrollContentPad =
    keyboardHeight > 0
      ? Math.max(120, Math.round(keyboardHeight * 0.3))
      : 0;

  const revealFocusedField = useCallback(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;

    const focused =
      typeof TextInput.State?.currentlyFocusedInput === 'function'
        ? TextInput.State.currentlyFocusedInput()
        : null;
    if (!focused) return;

    type Measurable = {
      measureInWindow: (
        callback: (x: number, y: number, w: number, h: number) => void,
      ) => void;
    };

    const scrollMeasurable = scroll as unknown as Measurable;
    const focusedMeasurable = focused as unknown as Measurable;
    if (typeof focusedMeasurable.measureInWindow !== 'function') return;

    const kb = keyboardHeightRef.current;
    const screenH = Dimensions.get('screen').height;

    scrollMeasurable.measureInWindow((_sx, sy, _sw, sh) => {
      focusedMeasurable.measureInWindow((_ix, iy, _iw, ih) => {
        // 헤더 검색 등 ScrollView 밖 포커스는 스크롤 스킵
        if (iy + ih <= sy) return;

        viewportHeightRef.current = sh;
        const keyboardTop = screenH - kb;
        // ScrollView 하단이 키보드에 얼마나 가려지는지
        const coveredByKeyboard =
          kb > 0 ? Math.max(0, Math.round(sy + sh - keyboardTop)) : 0;

        const fieldY = scrollYRef.current + (iy - sy);
        const target = scrollYToRevealField({
          fieldY,
          fieldHeight: ih,
          viewportHeight: sh,
          keyboardInset: coveredByKeyboard,
          footerHeight: 0,
          currentScrollY: scrollYRef.current,
          gap: LAYOUT.sheet.contentGap,
        });

        if (target != null) {
          scroll.scrollTo({ y: target, animated: true });
          return;
        }

        // 이미 '레이아웃상' 보이는데 키보드에 가리면 끝까지 스크롤
        if (kb > 0 && iy + ih > keyboardTop - LAYOUT.sheet.contentGap) {
          scroll.scrollToEnd({ animated: true });
        }
      });
    });
  }, []);

  useEffect(() => {
    if (keyboardHeight <= 0) return;
    // 레이아웃·패딩 반영 후 재측정
    const t1 = setTimeout(() => revealFocusedField(), 80);
    const t2 = setTimeout(() => revealFocusedField(), 220);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [keyboardHeight, scrollContentPad, revealFocusedField]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      sheetTranslateY.setValue(windowHeight);
      backdropOpacity.setValue(0);

      let openAnim: Animated.CompositeAnimation | null = null;
      const frame = requestAnimationFrame(() => {
        openAnim = Animated.parallel([
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: MOTION.duration.normal,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(sheetTranslateY, {
            toValue: 0,
            duration: MOTION.duration.normal,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]);
        openAnim.start();
      });

      return () => {
        cancelAnimationFrame(frame);
        openAnim?.stop();
      };
    }

    if (!mounted) return;

    const closeAnim = Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: MOTION.duration.fast,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: windowHeight,
        duration: MOTION.duration.normal,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    closeAnim.start(({ finished }) => {
      if (!finished) return;
      setMounted(false);
      onClosedRef.current?.();
    });

    return () => closeAnim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, windowHeight, sheetTranslateY, backdropOpacity]);

  if (!mounted) return null;

  const body = (
    <View style={styles.root} pointerEvents="box-none">
      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <Pressable
          style={styles.backdropPress}
          accessibilityRole="button"
          accessibilityLabel="닫기"
          onPress={onClose}
        />
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.sheetHost}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight,
              marginBottom: lift,
              paddingBottom: sheetBottomPad,
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}
        >
          <View className="mb-1 flex-row items-center justify-between gap-2">
            {typeof title === 'string' ? (
              <Text
                className="min-w-0 flex-1 text-lg font-bold text-brand"
                numberOfLines={1}
              >
                {title}
              </Text>
            ) : (
              title
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="닫기"
              onPress={onClose}
              className="h-10 w-10 shrink-0 items-center justify-center"
            >
              <Icons.X size={LAYOUT.icon.lg} color={COLORS.brand} />
            </Pressable>
          </View>

          {header ? <View className="pb-2">{header}</View> : null}

          <ScrollView
            ref={scrollRef}
            style={styles.sheetScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
            onLayout={(e) => {
              viewportHeightRef.current = e.nativeEvent.layout.height;
            }}
            onScroll={(e) => {
              scrollYRef.current = e.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            onContentSizeChange={() => {
              if (keyboardHeight > 0) revealFocusedField();
            }}
            contentContainerStyle={{
              gap: LAYOUT.sheet.contentGap,
              paddingBottom: scrollContentPad,
            }}
          >
            <View
              onStartShouldSetResponderCapture={() => {
                requestAnimationFrame(() => {
                  setTimeout(revealFocusedField, 100);
                });
                return false;
              }}
            >
              {children}
            </View>
          </ScrollView>

          {/* 키보드 열리면 CTA(다음 등) 숨겨 입력 영역 확보 */}
          {footer && keyboardHeight <= 0 ? (
            <View className="pt-2">{footer}</View>
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );

  if (presentation === 'overlay') {
    return <View style={styles.overlayRoot}>{body}</View>;
  }

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {body}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
  },
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: OVERLAY.scrim,
  },
  backdropPress: {
    flex: 1,
  },
  sheetHost: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    gap: LAYOUT.sheet.contentGap,
    borderTopLeftRadius: LAYOUT.sheet.borderRadius,
    borderTopRightRadius: LAYOUT.sheet.borderRadius,
    backgroundColor: COLORS.surface,
    paddingHorizontal: LAYOUT.sheet.horizontalPadding,
    paddingTop: LAYOUT.sheet.headerPaddingTop,
  },
  sheetScroll: {
    flexShrink: 1,
  },
});

type PageSheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  headerIcon?: ReactNode;
};

/** iOS pageSheet 스타일 전체 모달 */
export function PageSheet({
  visible,
  title,
  onClose,
  children,
  headerIcon,
}: PageSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 bg-canvas"
        style={{
          paddingTop:
            Platform.OS === 'ios'
              ? LAYOUT.sheet.pagePaddingTopIos
              : insets.top + LAYOUT.sheet.pagePaddingTopIos,
          paddingBottom: insets.bottom + LAYOUT.sheet.pagePaddingBottomExtra,
        }}
      >
        <View className="mb-1 flex-row items-center justify-between px-5">
          <View className="flex-row items-center gap-2">
            {headerIcon}
            <Text className="text-xl font-bold text-brand">{title}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="닫기"
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-60"
          >
            <Icons.X size={LAYOUT.icon.lg} color={COLORS.brand} />
          </Pressable>
        </View>
        {children}
      </View>
    </Modal>
  );
}
