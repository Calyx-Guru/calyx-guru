import { router } from "expo-router";
import { Animated, StyleSheet, View } from "react-native";

// import { VIDEOS } from "./constants";
import { ElementSelectionModal } from "./ElementSelectionModal";
// import type * as Types from "./type";
import { useElementSelection } from "./useElementSelection";

export default function TabHome() {
  // const player = useVideoPlayer(VIDEOS.hatching.idle, (p) => {
  //   p.loop = true;
  //   p.play();
  // });
  const {
    dateOfBirth,
    dateLabel,
    showDatePicker,
    // setShowDatePicker,
    elementsVisible,
    selectionOverlayVisible,
    selectedElement,
    elementEntrance,
    overlayElementScale,
    overlayBackdropOpacity,
    uiOpacity,
    // handleDateChange,
    // handleBirthDateSubmit,
    handleSelfChoosePress,
    handleSelectElement,
    handleChooseAgain,
    handleConfirmSelection,
  } = useElementSelection();

  const onConfirm = () => {
    handleConfirmSelection(async (element: Types.ElementName) => {
      // Close the modal
      handleChooseAgain();

      // Small delay to let modal close animation complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Hide UI
      Animated.timing(uiOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Play hatching sequence
      try {
        // 1. Play break video
        console.log("🎬 Playing break video");
        player.loop = false;
        await player.replaceAsync(VIDEOS.hatching.break);
        await player.play();
        await new Promise((resolve) => setTimeout(resolve, 5500));

        // 2. Play element video
        console.log("🎬 Playing element video");
        await player.replaceAsync(VIDEOS.hatching[element]);
        await player.play();
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // 3. Navigate
        console.log("✨ Navigating NOW!");
        router.replace("/(tabs)/test");
      } catch (error) {
        console.error("Error in hatching sequence:", error);
        // Reset and show UI again on error
        Animated.timing(uiOpacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  return (
    <View style={styles.root}>
      {/* <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="cover"
        nativeControls={false}
        pointerEvents="none"
        fullscreenOptions={{ enable: false }}
      /> */}

      <ElementSelectionModal
        visible={selectionOverlayVisible}
        selectedElement={selectedElement}
        overlayElementScale={overlayElementScale}
        overlayBackdropOpacity={overlayBackdropOpacity}
        onConfirm={onConfirm}
        onChooseAgain={handleChooseAgain}
      />

      {/* <ElementGrid
        elementsVisible={elementsVisible}
        selectedElement={selectedElement}
        elementEntrance={elementEntrance}
        uiOpacity={uiOpacity}
        onSelectElement={handleSelectElement}
      /> */}

      {/* <SafeAreaView style={styles.foreground} pointerEvents="box-none">
        <Animated.View style={{ opacity: uiOpacity }}>
          {!elementsVisible && (
            <DateCard
              dateLabel={dateLabel}
              showDatePicker={showDatePicker}
              dateOfBirth={dateOfBirth}
              onOpenPicker={() => setShowDatePicker(true)}
              onDateChange={handleDateChange}
              onSubmit={handleBirthDateSubmit}
            />
          )}

          <SelfChooseButton
            elementsVisible={elementsVisible}
            selectionOverlayVisible={selectionOverlayVisible}
            onPress={handleSelfChoosePress}
          />
        </Animated.View>
      </SafeAreaView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  // root: {
  //   flex: 1,
  // },
  // foreground: {
  //   flex: 1,
  //   justifyContent: "space-between",
  //   rowGap: 16,
  //   paddingHorizontal: 16,
  // },
});
