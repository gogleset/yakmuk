import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Linking, Text, View } from "react-native";
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
import { ensureNotificationPermission } from "@/features/medication-notifications";
import { ROUTES } from "@/shared/config/routes";
import { adsMailTo, SUPPORT, supportMailTo } from "@/shared/config/support";
import { COLORS, LAYOUT, LIMITS } from "@/shared/config/theme";
import {
  Badge,
  BottomSheet,
  Button,
  Card,
  FadeInView,
  Icons,
  InitialAvatar,
  Input,
  Muted,
  PageTitle,
  PressableScale,
  Screen,
  ScreenScrollView,
  SectionHeader,
  SettingsGroup,
  SettingsRow,
} from "@/shared/ui";

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

  useEffect(() => {
    setNicknameDraft(profile?.nickname ?? "");
  }, [profile?.nickname]);

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

  const onSignOut = async () => {
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

  const onNotifPermission = async () => {
    const ok = await ensureNotificationPermission();
    Alert.alert(
      "알림",
      ok
        ? "약 먹을 시간에 알려드릴 수 있어요"
        : "Expo Go에서는 알림이 제한돼요. 개발 빌드에서 확인해 주세요.",
    );
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
          <PageTitle className="text-xl">설정</PageTitle>

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
                <Muted className="text-xs" numberOfLines={1}>
                  {familyLine}
                </Muted>
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
              onPress={() => void onSignOut()}
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

          <SectionHeader title="앱" />
          <SettingsGroup>
            <SettingsRow
              label="약 알림"
              icon={Icons.Radio}
              onPress={() => void onNotifPermission()}
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
