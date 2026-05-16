import { AppAppearanceContext } from "@/contexts/AppAppearanceContext";
import { useUserProfileStore } from "@/store/userProfileStore";
import { router } from "expo-router";
import { useContext, useEffect } from "react";
import { View } from "react-native";

export default function Index() {
  const { colors } = useContext(AppAppearanceContext);
  const isLoadingProfile = useUserProfileStore((state) => state.isLoading);
  const profile = useUserProfileStore((state) => state.profile);

  useEffect(() => {
    if (!isLoadingProfile && profile) {
      if (profile?.element) {
        router.replace("/main-menu");
      } else {
        router.replace("/choose-element");
      }
    }
  }, [isLoadingProfile, profile]);

  return (
    <View
      style={{
        flex: 1,
        padding: 0,
        margin: 0,
        backgroundColor: colors.background,
      }}
    />
  );
}
