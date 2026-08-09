import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  type AppStateStatus,
  Linking,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { ROLE_LABEL } from "@/entities/user";
import {
  useFamilyInfoQuery,
  useUpdateMyNicknameMutation,
} from "@/features/family-ops";
import {
  useSignOutMutation,
  useWithdrawAccountMutation,
} from "@/features/guardian-auth";
import {
  ensureNotificationPermission,
  fireAndroidFullScreenTestAlarm,
  getAndroidExactAlarmStatus,
  getAndroidFullScreenIntentStatus,
  getNotificationPermissionGranted,
  openAndroidExactAlarmSettings,
  openAndroidFullScreenIntentSettings,
  resetNotificationPermissionCache,
  scheduleAndroidTestTriggerInSeconds,
  basicNotifSwitchOn,
  fullPageFsiSwitchOn,
  isFullPageSwitchDisabled,
} from "@/features/medication-notifications";
import {
  getCareGlanceOpt,
  isGlanceViewerRole,
  setCareGlanceOpt,
} from "@/features/care-glance-notification";
import {
  getWeeklyDigestOpt,
  setWeeklyDigestOpt,
} from "@/features/care-weekly-digest";
import { medicationAlarmRoute, ROUTES } from "@/shared/config/routes";
import { adsMailTo, SUPPORT, supportMailTo } from "@/shared/config/support";
import { COLORS, LAYOUT, LIMITS } from "@/shared/config/theme";
import { COPY } from "@/shared/copy";
import {
  DEFAULT_START_TAB,
  getStartTab,
  setStartTab,
  type StartTab,
} from "@/shared/lib/startTab";
import {
  Badge,
  BottomSheet,
  Button,
  Card,
  FadeInView,
  Icons,
  InitialAvatar,
  Input,
  Caption,
  TitleXl,
  PressableScale,
  Screen,
  ScreenScrollView,
  SectionHeader,
  SettingsGroup,
  SettingsRow,
  SettingsSwitchRow,
} from "@/shared/ui";

const START_TAB_OPTIONS: { tab: StartTab; label: string }[] = [
  { tab: "home", label: COPY.settings.startScreenHome },
  { tab: "family", label: COPY.settings.startScreenFamily },
];

function startTabLabel(tab: StartTab): string {
  return tab === "family"
    ? COPY.settings.startScreenFamily
    : COPY.settings.startScreenHome;
}

/** 설정 루트 — grouped list만. 무거운 ops는 서브/시트 */
export function SettingsPage() {
  const { profile, refreshProfile } = useAuth();
  const signOut = useSignOutMutation();
  const withdraw = useWithdrawAccountMutation();
  const familyId = profile?.familyId;
  const isLeader = profile?.role === "family_leader";

  const familyQuery = useFamilyInfoQuery(familyId);
  const updateNickname = useUpdateMyNicknameMutation(refreshProfile);

  const [nicknameSheetOpen, setNicknameSheetOpen] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState(profile?.nickname ?? "");
  const [startTab, setStartTabState] = useState<StartTab>(DEFAULT_START_TAB);
  const [startScreenSheetOpen, setStartScreenSheetOpen] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const [fsiAllowed, setFsiAllowed] = useState(false);
  const [careGlanceOn, setCareGlanceOn] = useState(true);
  const [weeklyDigestOn, setWeeklyDigestOn] = useState(true);
  const showCareOpts = isGlanceViewerRole(profile?.role);
  const exactAlarmPromptedRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    setNicknameDraft(profile?.nickname ?? "");
  }, [profile?.nickname]);

  useEffect(() => {
    let cancelled = false;
    void getStartTab().then((tab) => {
      if (!cancelled) setStartTabState(tab);
    });
    void getCareGlanceOpt().then((on) => {
      if (!cancelled) setCareGlanceOn(on);
    });
    void getWeeklyDigestOpt().then((on) => {
      if (!cancelled) setWeeklyDigestOn(on);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  /** OS 권한 → 스위치 동기화 (마운트 + 설정 복귀) */
  const refreshNotifSwitches = async () => {
    const granted = await getNotificationPermissionGranted();
    setNotifGranted(basicNotifSwitchOn(granted));
    if (Platform.OS !== "android") {
      setFsiAllowed(false);
      return;
    }
    const fsiStatus = await getAndroidFullScreenIntentStatus();
    setFsiAllowed(fullPageFsiSwitchOn(fsiStatus));
  };

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      await refreshNotifSwitches();
      if (cancelled) return;
    };
    void sync();
    const onChange = (next: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (next !== "active" || prev === "active") return;
      void refreshNotifSwitches();
    };
    const sub = AppState.addEventListener("change", onChange);
    return () => {
      cancelled = true;
      sub.remove();
    };
    // mount 1회 — refreshNotifSwitches는 setState만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const familyName = familyQuery.data?.name?.trim() || null;
  const roleLabel = profile?.role ? ROLE_LABEL[profile.role] : null;
  const familyLine = familyName
    ? familyName
    : profile?.familyId
      ? "가족에 연결되어 있어요"
      : "가족이 아직 없어요";
  const appVersion =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? "—";

  const openNicknameSheet = () => {
    setNicknameDraft(profile?.nickname ?? "");
    setNicknameSheetOpen(true);
  };

  const onSignOutPress = async () => {
    await signOut.mutateAsync();
    router.replace(ROUTES.welcome);
  };

  const onWithdraw = () => {
    const message = isLeader
      ? "탈퇴하면 가족이 삭제되고 모든 멤버·약·기록이 지워져요. 되돌릴 수 없어요."
      : "탈퇴하면 이 가족에서 나가고, 내 약·기록이 삭제돼요. 되돌릴 수 없어요.";

    Alert.alert("정말 탈퇴할까요?", message, [
      { text: "취소", style: "cancel" },
      {
        text: "탈퇴하기",
        style: "destructive",
        onPress: () => {
          void withdraw.mutateAsync().then(() => {
            router.replace(ROUTES.welcome);
          });
        },
      },
    ]);
  };

  const onNotifSwitchChange = (next: boolean) => {
    void (async () => {
      if (next) {
        resetNotificationPermissionCache();
        const ok = await ensureNotificationPermission();
        await refreshNotifSwitches();
        if (!ok) {
          // 거절·미허용 — 시스템 설정으로
          await Linking.openSettings();
          return;
        }
        // Android exact — 설정 화면 토글 시 세션 1회
        if (Platform.OS === "android" && !exactAlarmPromptedRef.current) {
          const exact = await getAndroidExactAlarmStatus();
          if (exact === "disabled") {
            exactAlarmPromptedRef.current = true;
            Alert.alert(COPY.notif.exactAlarmTitle, COPY.notif.exactAlarmBody, [
              { text: COPY.notif.exactAlarmLater, style: "cancel" },
              {
                text: COPY.notif.exactAlarmOpen,
                onPress: () => void openAndroidExactAlarmSettings(),
              },
            ]);
          }
        }
        return;
      }
      // revoke 불가 — OS 설정 열기, 복귀 시 AppState로 재조회
      await Linking.openSettings();
    })();
  };

  const onFsiSwitchChange = (_next: boolean) => {
    // OS 진실만 — 토글은 시스템 FSI 설정으로 보냄
    void openAndroidFullScreenIntentSettings();
  };

  const onToggleCareGlance = () => {
    const next = !careGlanceOn;
    setCareGlanceOn(next);
    void (async () => {
      if (next) {
        resetNotificationPermissionCache();
        const ok = await ensureNotificationPermission();
        if (!ok) {
          setCareGlanceOn(false);
          await setCareGlanceOpt(false);
          Alert.alert("알림", COPY.glance.permissionHint);
          return;
        }
        await refreshNotifSwitches();
      }
      await setCareGlanceOpt(next);
    })();
  };

  const onToggleWeeklyDigest = () => {
    const next = !weeklyDigestOn;
    setWeeklyDigestOn(next);
    void setWeeklyDigestOpt(next);
  };

  /** 첫 화면 — 이 기기만. 다음 앱 진입 시 적용 */
  const onStartScreenPress = () => setStartScreenSheetOpen(true);

  const onSelectStartTab = (tab: StartTab) => {
    void setStartTab(tab).then(() => {
      setStartTabState(tab);
      setStartScreenSheetOpen(false);
    });
  };

  /** __DEV__: 풀페이지 — 실제 약 있으면 hydrate, 없으면 payload 폴백 */
  const onTestFullPage = () => {
    router.push(medicationAlarmRoute({}) as never);
  };

  /** __DEV__: 다약 리스트 — 실제 다약 슬롯 우선, 없으면 mock */
  const onTestFullPageMulti = () => {
    router.push(
      medicationAlarmRoute({
        previewMulti: true,
      }) as never,
    );
  };

  /** __DEV__ Android: FSI — 60초 · 잠금/꺼짐 */
  const onTestFsi = async () => {
    // 실약/이미 TAKEN과 겹치지 않는 가상 id — 풀페이지 fallback 고정
    const result = await fireAndroidFullScreenTestAlarm({
      medicationId: 900001,
      name: "FSI 테스트",
      scheduledTime: "지금",
      mode: "lock-screen",
      delaySeconds: 60,
    });
    if (result === "ok") {
      Alert.alert(COPY.notif.testFsi, COPY.notif.testFsiOk);
      return;
    }
    if (result === "exact-alarm-disabled") {
      Alert.alert(COPY.notif.exactAlarmTitle, COPY.notif.testDelayExactOff, [
        { text: COPY.notif.exactAlarmLater, style: "cancel" },
        {
          text: COPY.notif.exactAlarmOpen,
          onPress: () => void openAndroidExactAlarmSettings(),
        },
      ]);
      return;
    }
    if (result === "permission-denied") {
      Alert.alert(COPY.notif.fsiTitle, COPY.notif.testFsiDenied, [
        { text: COPY.notif.exactAlarmLater, style: "cancel" },
        {
          text: COPY.notif.exactAlarmOpen,
          onPress: () => void openAndroidFullScreenIntentSettings(),
        },
      ]);
      return;
    }
    Alert.alert(COPY.notif.testFsi, COPY.notif.testFsiUnavailable);
  };

  /** __DEV__ Android: 포그라운드 즉시 (헤드업만 — 진짜 FSI 아님) */
  const onTestFsiImmediate = async () => {
    const result = await fireAndroidFullScreenTestAlarm({
      medicationId: 900001,
      name: "FSI 테스트",
      scheduledTime: "지금",
      mode: "immediate",
    });
    if (result === "ok") {
      Alert.alert(COPY.notif.testFsiImmediate, COPY.notif.testFsiImmediateOk);
      return;
    }
    Alert.alert(COPY.notif.testFsiImmediate, COPY.notif.testFsiUnavailable);
  };

  /** __DEV__ Android: 90초 뒤 FSI */
  const onTestDelay = async () => {
    const delaySec = 90;
    const result = await scheduleAndroidTestTriggerInSeconds(delaySec);
    if (result === "ok") {
      Alert.alert(COPY.notif.testDelay, COPY.notif.testDelayOk(delaySec));
      return;
    }
    if (result === "exact-alarm-disabled") {
      Alert.alert(COPY.notif.exactAlarmTitle, COPY.notif.testDelayExactOff, [
        { text: COPY.notif.exactAlarmLater, style: "cancel" },
        {
          text: COPY.notif.exactAlarmOpen,
          onPress: () => void openAndroidExactAlarmSettings(),
        },
      ]);
      return;
    }
    Alert.alert(COPY.notif.testDelay, COPY.notif.testFsiUnavailable);
  };

  const onSaveNickname = () => {
    const trimmed = nicknameDraft.trim();
    if (!trimmed || trimmed === profile?.nickname) return;
    updateNickname.mutate(trimmed, {
      onSuccess: () => setNicknameSheetOpen(false),
    });
  };

  const openMail = async (url: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) {
        Alert.alert(
          "메일 앱을 열 수 없어요",
          "이메일 앱이 설치돼 있는지 확인해 주세요.",
        );
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("메일 앱을 열 수 없어요", "잠시 후 다시 시도해 주세요.");
    }
  };

  const openLegalStub = (title: string, url: string | null) => {
    if (url) {
      void Linking.openURL(url);
      return;
    }
    Alert.alert(title, "곧 공개할게요.");
  };

  return (
    <Screen fadeTop={LAYOUT.fade.top} fadeBottom={LAYOUT.fade.bottomPlain}>
      <ScreenScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="gap-3 px-5 pb-10 pt-4"
      >
        <FadeInView className="gap-3">
          <TitleXl>설정</TitleXl>

          {/* 프로필 — 아바타 · 닉·역할 · 가족명 · 닉네임 변경 */}
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="닉네임 변경"
            accessibilityHint="탭하면 닉네임을 바꿀 수 있어요"
            onPress={openNicknameSheet}
          >
            <View style={LAYOUT.shadow.sameFill} className="rounded-2xl">
              <Card className="flex-row items-center gap-3 rounded-2xl bg-surface p-4">
                <View className="items-center gap-1">
                  <InitialAvatar
                    nickname={profile?.nickname}
                    size="lg"
                    className="bg-brand-soft"
                  />
                  {roleLabel ? (
                    <Badge
                      label={roleLabel}
                      variant="soft"
                      className="self-center rounded-full px-1.5 py-0"
                      labelClassName="text-[10px] font-semibold leading-4"
                    />
                  ) : null}
                </View>
                <View className="min-w-0 flex-1 gap-0.5">
                  <Text
                    className="text-base font-bold text-text"
                    numberOfLines={1}
                  >
                    {profile?.nickname ?? "이름 없음"}
                  </Text>
                  <Caption numberOfLines={1}>{familyLine}</Caption>
                </View>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-surface-soft">
                  <Icons.ChevronRight
                    size={LAYOUT.icon.sm}
                    color={COLORS.muted}
                  />
                </View>
              </Card>
            </View>
          </PressableScale>

          <SectionHeader title="계정" />
          <SettingsGroup>
            <SettingsRow
              label="로그아웃"
              icon={Icons.LogOut}
              showChevron={false}
              disabled={signOut.isPending}
              onPress={() => void onSignOutPress()}
            />
            <SettingsRow
              label="탈퇴하기"
              icon={Icons.UserX}
              destructive
              showChevron={false}
              disabled={withdraw.isPending}
              onPress={onWithdraw}
            />
          </SettingsGroup>

          <SectionHeader title="알림" />
          <SettingsGroup>
            <SettingsSwitchRow
              label={COPY.notif.basicSwitch}
              value={notifGranted}
              icon={Icons.Bell}
              onValueChange={onNotifSwitchChange}
            />
            {Platform.OS === "android" ? (
              <SettingsSwitchRow
                label={COPY.notif.fullPageSwitch}
                value={fsiAllowed}
                icon={Icons.Radio}
                disabled={isFullPageSwitchDisabled(notifGranted)}
                onValueChange={onFsiSwitchChange}
              />
            ) : null}
            {showCareOpts ? (
              <SettingsRow
                label={COPY.settings.careGlance}
                value={
                  careGlanceOn ? COPY.settings.optOn : COPY.settings.optOff
                }
                icon={Icons.Bell}
                onPress={onToggleCareGlance}
              />
            ) : null}
            {showCareOpts ? (
              <SettingsRow
                label={COPY.settings.weeklyDigest}
                value={
                  weeklyDigestOn ? COPY.settings.optOn : COPY.settings.optOff
                }
                icon={Icons.Home}
                onPress={onToggleWeeklyDigest}
              />
            ) : null}
            {__DEV__ ? (
              <SettingsRow
                label={COPY.notif.testFullPage}
                icon={Icons.Bell}
                onPress={onTestFullPage}
              />
            ) : null}
            {__DEV__ ? (
              <SettingsRow
                label={COPY.notif.testFullPageMulti}
                icon={Icons.Bell}
                onPress={onTestFullPageMulti}
              />
            ) : null}
            {__DEV__ && Platform.OS === "android" ? (
              <SettingsRow
                label={COPY.notif.testFsi}
                icon={Icons.AlarmClock}
                onPress={() => void onTestFsi()}
              />
            ) : null}
            {__DEV__ && Platform.OS === "android" ? (
              <SettingsRow
                label={COPY.notif.testFsiImmediate}
                icon={Icons.Radio}
                onPress={() => void onTestFsiImmediate()}
              />
            ) : null}
            {__DEV__ && Platform.OS === "android" ? (
              <SettingsRow
                label={COPY.notif.testDelay}
                icon={Icons.AlarmClock}
                onPress={() => void onTestDelay()}
              />
            ) : null}
          </SettingsGroup>

          <SectionHeader title="앱" />
          <SettingsGroup>
            <SettingsRow
              label={COPY.settings.startScreen}
              value={startTabLabel(startTab)}
              icon={Icons.Home}
              onPress={onStartScreenPress}
            />
          </SettingsGroup>

          <SectionHeader title="고객지원" />
          <SettingsGroup>
            <SettingsRow
              label="문의하기"
              icon={Icons.Mail}
              onPress={() => void openMail(supportMailTo("[약콕] 문의"))}
            />
            <SettingsRow
              label="광고·제휴 문의"
              icon={Icons.Megaphone}
              onPress={() => void openMail(adsMailTo())}
            />
          </SettingsGroup>

          <SectionHeader title="정보" />
          <SettingsGroup>
            <SettingsRow
              label="앱 버전"
              value={appVersion}
              icon={Icons.Info}
              showChevron={false}
            />
            <SettingsRow
              label="이용약관"
              icon={Icons.FileText}
              onPress={() => openLegalStub("이용약관", SUPPORT.termsUrl)}
            />
            <SettingsRow
              label="개인정보처리방침"
              icon={Icons.FileText}
              onPress={() =>
                openLegalStub("개인정보처리방침", SUPPORT.privacyUrl)
              }
            />
          </SettingsGroup>
        </FadeInView>
      </ScreenScrollView>

      <BottomSheet
        visible={startScreenSheetOpen}
        title={COPY.settings.startScreen}
        onClose={() => setStartScreenSheetOpen(false)}
      >
        {/* 2열 그리드 · 화이트 톤 + sameFill (시트와 동색 구분) */}
        <View className="flex-row gap-2.5">
          {START_TAB_OPTIONS.map((option) => {
            const selected = startTab === option.tab;
            const OptionIcon =
              option.tab === "home" ? Icons.Pill : Icons.Users;
            return (
              <Pressable
                key={option.tab}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => onSelectStartTab(option.tab)}
                style={LAYOUT.shadow.sameFill}
                className="min-h-[96px] flex-1 items-center justify-center gap-2 rounded-xl bg-surface px-3 py-4"
              >
                <OptionIcon
                  size={LAYOUT.icon.lg}
                  color={selected ? COLORS.brand : COLORS.muted}
                />
                <Text
                  className={`text-base font-semibold ${
                    selected ? "text-brand" : "text-text"
                  }`}
                >
                  {option.label}
                </Text>
                {selected ? (
                  <Icons.Check
                    size={LAYOUT.icon.sm}
                    color={COLORS.brand}
                    strokeWidth={2.5}
                  />
                ) : (
                  <View className="h-4" />
                )}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>

      <BottomSheet
        visible={nicknameSheetOpen}
        title="닉네임 변경"
        onClose={() => setNicknameSheetOpen(false)}
        footer={
          <View className="gap-2">
            <Button
              label={updateNickname.isPending ? "저장 중…" : "저장"}
              disabled={
                updateNickname.isPending ||
                !nicknameDraft.trim() ||
                nicknameDraft.trim() === profile?.nickname
              }
              onPress={onSaveNickname}
            />
            <Button
              label="취소"
              variant="outline"
              onPress={() => setNicknameSheetOpen(false)}
            />
          </View>
        }
      >
        <Input
          tone="soft"
          value={nicknameDraft}
          onChangeText={setNicknameDraft}
          placeholder="닉네임"
          maxLength={LIMITS.nicknameMaxLength}
          autoFocus
        />
      </BottomSheet>

    </Screen>
  );
}
