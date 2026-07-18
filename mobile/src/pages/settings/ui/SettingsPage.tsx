import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, Text, View } from "react-native";
import { useAuth } from "@/providers/AuthProvider";
import { relationSubtitle, ROLE_LABEL } from "@/entities/user";
import { useFamilyMembersQuery } from "@/entities/family/model/queries";
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
  Body,
  BottomSheet,
  Button,
  Card,
  FadeInView,
  Icons,
  Input,
  Muted,
  PageTitle,
  PressableScale,
  Screen,
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
  const membersQuery = useFamilyMembersQuery(familyId);
  const updateNickname = useUpdateMyNicknameMutation(refreshProfile);

  const [nicknameSheetOpen, setNicknameSheetOpen] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState(profile?.nickname ?? "");

  useEffect(() => {
    setNicknameDraft(profile?.nickname ?? "");
  }, [profile?.nickname]);

  const leaderNickname =
    (membersQuery.data ?? []).find((m) => m.role === "family_leader")
      ?.nickname ?? profile?.nickname;
  const mySubtitle = relationSubtitle(profile?.invitedAs, leaderNickname);
  const familyName = familyQuery.data?.name;
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
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerClassName="gap-3 px-5 pb-10 pt-4"
      >
        <FadeInView className="gap-3">
          <PageTitle>설정</PageTitle>

          {/* 프로필 탭 → 닉네임 변경 시트 */}
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="닉네임 변경"
            accessibilityHint="탭하면 닉네임을 바꿀 수 있어요"
            onPress={openNicknameSheet}
          >
            <Card className="gap-1.5">
              <View className="flex-row items-center gap-2">
                <Icons.Shield size={LAYOUT.icon.md} color={COLORS.brand} />
                <Text className="flex-1 text-base font-bold text-brand">
                  {profile?.nickname ?? "이름 없음"}
                </Text>
                <Icons.ChevronRight
                  size={LAYOUT.icon.sm}
                  color={COLORS.muted}
                />
              </View>
              <Body>
                {profile?.role ? ROLE_LABEL[profile.role] : "역할 없음"}
              </Body>
              {mySubtitle ? (
                <Muted className="text-xs">{mySubtitle}</Muted>
              ) : null}
              <Muted className="text-xs">
                {familyName
                  ? `가족 · ${familyName}`
                  : profile?.familyId
                    ? "가족에 연결되어 있어요"
                    : "가족이 아직 없어요"}
              </Muted>
            </Card>
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

          <SectionHeader title="가족" />
          <SettingsGroup>
            <SettingsRow
              label={isLeader ? "가족 관리" : "우리 가족"}
              value={familyName ?? undefined}
              icon={Icons.Users}
              onPress={() => router.push(ROUTES.settingsFamily)}
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
      </ScrollView>

      <BottomSheet
        visible={nicknameSheetOpen}
        title="닉네임 변경"
        onClose={() => setNicknameSheetOpen(false)}
      >
        <View className="gap-3">
          <Input
            value={nicknameDraft}
            onChangeText={setNicknameDraft}
            placeholder="닉네임"
            maxLength={LIMITS.nicknameMaxLength}
            autoFocus
          />
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
      </BottomSheet>
    </Screen>
  );
}
