import { AppAppearanceContext } from "@/contexts/AppAppearanceContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { router } from "expo-router";
import { useContext, useEffect } from "react";
import { View } from "react-native";

export default function Index() {
  const { colors } = useContext(AppAppearanceContext);
  const { profile, isLoading: isLoadingProfile } = useUserProfile();

  useEffect(() => {
    if (!isLoadingProfile) {
      if (profile?.element) {
        router.replace("/main-menu");        
      } else {        
        router.replace("/choose-element");
      }
    }
  }, [isLoadingProfile]);

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: colors.background,
      }}
    />
  );
}
