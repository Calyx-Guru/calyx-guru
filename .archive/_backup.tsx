import {
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Solar } from "lunar-javascript";
import { useMemo, useState } from "react";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

// type ElementKey = "water" | "fire" | "metal" | "earth" | "wood";

// type ElementConfig = {
//   key: ElementKey;
//   label: string;
//   source: ImageSourcePropType;
//   positionStyleKey:
//     | "elementTop"
//     | "elementLeft"
//     | "elementRight"
//     | "elementBottomLeft"
//     | "elementBottomRight";
// };

// const ELEMENT_CONFIGS: ElementConfig[] = [
//   {
//     key: "water",
//     label: "Water",
//     source: elements.water,
//     positionStyleKey: "elementTop",
//   },
//   {
//     key: "fire",
//     label: "Fire",
//     source: elements.fire,
//     positionStyleKey: "elementLeft",
//   },
//   {
//     key: "metal",
//     label: "Metal",
//     source: elements.metal,
//     positionStyleKey: "elementRight",
//   },
//   {
//     key: "earth",
//     label: "Earth",
//     source: elements.earth,
//     positionStyleKey: "elementBottomLeft",
//   },
//   {
//     key: "wood",
//     label: "Wood",
//     source: elements.wood,
//     positionStyleKey: "elementBottomRight",
//   },
// ];

const CHINESE_ELEMENT_TO_KEY: Record<string, ElementKey> = {
  木: "wood",
  火: "fire",
  土: "earth",
  金: "metal",
  水: "water",
};

function TabHome() {
  const theme = {
    colors: {
      primary: {
        main: "#4a38a5",
        linear: "#6548c3",
      },
      secondary: {
        main: "#226f76",
        linear: "#3eacb2",
      },
    },
  };

  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date("1990-01-01"));
  const [showDatePicker, setShowDatePicker] = useState(false);
  // const [elementsVisible, setElementsVisible] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementKey | null>(
    null,
  );
  const [selectionOverlayVisible, setSelectionOverlayVisible] = useState(false);
  const [confirmedBirthElement, setConfirmedBirthElement] =
    useState<ElementKey | null>(null);

  // const elementEntrance = useMemo(
  //   () => ({
  //     water: new Animated.Value(0),
  //     fire: new Animated.Value(0),
  //     metal: new Animated.Value(0),
  //     earth: new Animated.Value(0),
  //     wood: new Animated.Value(0),
  //   }),
  //   [],
  // );

  const overlayElementScale = useMemo(() => new Animated.Value(0.75), []);
  const overlayBackdropOpacity = useMemo(() => new Animated.Value(0), []);

  // const player = useVideoPlayer(stageEgg, (videoPlayer) => {
  //   videoPlayer.loop = true;
  //   videoPlayer.play();
  // });

  const dateLabel = useMemo(() => {
    if (confirmedBirthElement) {
      const confirmedLabel = ELEMENT_CONFIGS.find(
        (element) => element.key === confirmedBirthElement,
      )?.label;
      return confirmedLabel
        ? `Your element: ${confirmedLabel}`
        : "Your element is ready";
    }

    return dateOfBirth.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [confirmedBirthElement, dateOfBirth]);

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "set" && selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  // const showElements = () => {
  //   if (elementsVisible) {
  //     return;
  //   }

  //   setElementsVisible(true);
  //   Animated.stagger(
  //     90,
  //     ELEMENT_CONFIGS.map((element) =>
  //       Animated.timing(elementEntrance[element.key], {
  //         toValue: 1,
  //         duration: 340,
  //         easing: Easing.out(Easing.cubic),
  //         useNativeDriver: true,
  //       }),
  //     ),
  //   ).start();
  // };

  const resolveElementByBirthDate = (date: Date): ElementKey => {
    const eightChar = Solar.fromDate(date).getLunar().getEightChar();
    const yearNaYin = eightChar.getYearNaYin();
    const naYinElementChar = yearNaYin.charAt(yearNaYin.length - 1);
    const fromNaYin = CHINESE_ELEMENT_TO_KEY[naYinElementChar];

    if (fromNaYin) {
      return fromNaYin;
    }

    const dayWuXing = eightChar.getDayWuXing();
    const fallbackChar = dayWuXing.charAt(0);
    return CHINESE_ELEMENT_TO_KEY[fallbackChar] ?? "earth";
  };

  const hideElements = (onHidden?: () => void) => {
    if (!elementsVisible) {
      onHidden?.();
      return;
    }

    Animated.stagger(
      60,
      [...ELEMENT_CONFIGS].reverse().map((element) =>
        Animated.timing(elementEntrance[element.key], {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    ).start(() => {
      setElementsVisible(false);
      onHidden?.();
    });
  };

  const openSelectionOverlay = (key: ElementKey) => {
    setSelectedElement(key);
    setSelectionOverlayVisible(true);
    overlayElementScale.setValue(0.75);
    overlayBackdropOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(overlayElementScale, {
        toValue: 1,
        speed: 16,
        bounciness: 9,
        useNativeDriver: true,
      }),
      Animated.timing(overlayBackdropOpacity, {
        toValue: 0.5,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSelectElement = (key: ElementKey) => {
    if (!elementsVisible) {
      return;
    }

    openSelectionOverlay(key);
  };

  const handleSelfChoosePress = () => {
    if (!elementsVisible) {
      showElements();
      return;
    }

    hideElements();
  };

  const handleBirthDateSubmit = () => {
    const elementByDate = resolveElementByBirthDate(dateOfBirth);
    setConfirmedBirthElement(null);
    setShowDatePicker(false);

    hideElements(() => {
      openSelectionOverlay(elementByDate);
    });
  };

  const handleChooseAgain = () => {
    Animated.timing(overlayBackdropOpacity, {
      toValue: 0,
      duration: 160,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setSelectionOverlayVisible(false);
      setSelectedElement(null);
    });
  };

  const handleConfirmSelection = () => {
    if (selectedElement) {
      setConfirmedBirthElement(selectedElement);
    }

    Animated.timing(overlayBackdropOpacity, {
      toValue: 0,
      duration: 160,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setSelectionOverlayVisible(false);
    });
  };

  const selectedElementLabel = selectedElement
    ? ELEMENT_CONFIGS.find(
        (element) => element.key === selectedElement,
      )?.label.toUpperCase()
    : "";

  return (
    <View style={styles.root}>
      {/* <VideoView
        style={styles.backgroundVideo}
        player={player}
        contentFit="cover"
        nativeControls={false}
        pointerEvents="none"
        fullscreenOptions={{
          enable: false,
        }}
      /> */}

      {/* <View
        style={styles.starContainer}
        pointerEvents={elementsVisible ? "auto" : "none"}
      > */}
        {/* {ELEMENT_CONFIGS.map((element) => { */}
          // const isSelected = selectedElement === element.key;
          // const animatedStyle = {
          //   opacity: elementEntrance[element.key],
          //   transform: [
          //     {
          //       translateY: elementEntrance[element.key].interpolate({
          //         inputRange: [0, 1],
          //         outputRange: [18, 0],
          //       }),
          //     },
          //     {
          //       scale: elementEntrance[element.key].interpolate({
          //         inputRange: [0, 1],
          //         outputRange: [0.65, 1],
          //       }),
          //     },
          //     {
          //       scale: isSelected ? 1.04 : 1,
          //     },
          //   ],
          // };
          // return (
          //   <Animated.View
          //     key={element.key}
          //     style={[
          //       styles.starElement,
          //       styles[element.positionStyleKey],
          //       animatedStyle,
          //       isSelected ? styles.selectedElement : null,
          //     ]}
          //   >
          //     <Pressable
          //       onPress={() => handleSelectElement(element.key)}
          //       disabled={!elementsVisible}
          //       style={styles.elementPressable}
          //     >
          //       <Image source={element.source} style={styles.elementImage} />
          //     </Pressable>
          //   </Animated.View>
          // );
        // })}
      // </View>

      <SafeAreaView style={styles.foreground} pointerEvents="box-none">
        {/* <LinearGradient
          colors={[
            theme.colors.primary.main,
            theme.colors.primary.linear,
            theme.colors.primary.main,
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          locations={[0.1, 0.5, 0.9]}
          style={styles.header}
        >
          <Pressable style={styles.fingerprintButton}>
            <MaterialCommunityIcons
              name="fingerprint"
              size={26}
              color="#4e39a9"
            />
          </Pressable>
        </LinearGradient> */}

        {!elementsVisible && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Enter your date of birth</Text>
            <Pressable
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateInputText}>{dateLabel}</Text>
            </Pressable>
            <View style={styles.buttonRow}>
              <Pressable
                style={styles.confirmButton}
                onPress={handleBirthDateSubmit}
              >
                <LinearGradient
                  colors={[
                    theme.colors.secondary.main,
                    theme.colors.secondary.linear,
                    theme.colors.secondary.main,
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  locations={[0.1, 0.5, 0.9]}
                  style={styles.confirmGradient}
                >
                  <Text style={styles.confirmText}>OK</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        )}

        <Pressable
          style={[
            styles.selfChooseButton,
            elementsVisible ? styles.selfChooseButtonActive : null,
          ]}
          onPress={() => !selectionOverlayVisible && handleSelfChoosePress()}
        >
          {!selectionOverlayVisible && (
            <LinearGradient
              colors={["#261c23", "#372c31", "#261c23"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              locations={[0.1, 0.5, 0.9]}
              style={styles.selfChooseGradient}
            >
              <Text style={styles.selfChooseText}>
                {elementsVisible ? "Help me find out" : "I will choose myself"}
              </Text>
            </LinearGradient>
          )}
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth ?? new Date(2000, 0, 1)}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </SafeAreaView>

      <Modal
        animationType="fade"
        transparent
        visible={selectionOverlayVisible}
        onRequestClose={handleChooseAgain}
      >
        <View style={styles.selectionOverlay}>
          <Animated.View
            style={[
              styles.selectionOverlayBackdrop,
              { opacity: overlayBackdropOpacity },
            ]}
          />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Confirm Your Element Selection
            </Text>
            <Text style={styles.modalDescription}>
              You have selected the &nbsp;
              <Text style={styles.modalTitleElement}>
                {selectedElementLabel}
              </Text>
              . This element determines your unique cosmic connections and
              luck.&nbsp;
              <Text style={styles.modalTitleBold}>
                Once confimmed, you cannot change it later
              </Text>
              . But you can &nbsp;
              <Text style={styles.modalTitleBold}>
                reset as another element
              </Text>
              &nbsp; from your settingsmenu to start over
            </Text>
          </View>

          <Animated.View
            style={[
              styles.selectionPreview,
              {
                transform: [{ scale: overlayElementScale }],
              },
            ]}
          >
            {selectedElement && (
              <Image
                source={
                  ELEMENT_CONFIGS.find(
                    (element) => element.key === selectedElement,
                  )?.source
                }
                style={styles.selectionPreviewImage}
              />
            )}
          </Animated.View>
          <View style={styles.selectionActions}>
            <Pressable
              onPress={handleConfirmSelection}
              style={styles.selectionConfirmButton}
            >
              <Text
                style={styles.selectionConfirmText}
              >{`Confirm '${selectedElementLabel}'`}</Text>
            </Pressable>
            <Pressable onPress={handleChooseAgain}>
              <Text style={styles.chooseAgainText}>Choose Again</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // root: {
  //   flex: 1,
  // },
  backgroundVideo: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: -50,
  },
  foreground: {
    flex: 1,
    justifyContent: "space-between",
    rowGap: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 8,
    borderTopStartRadius: 8,
    borderTopEndRadius: 8,
    overflow: "hidden",
    elevation: 14,
  },
  fingerprintButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    backgroundColor: "#1e1e37",
    borderRadius: 4,
    elevation: 8,
  },
  card: {
    position: "relative",
    rowGap: 8,
    padding: 8,
    backgroundColor: "#161a1e",
    borderWidth: 1,
    borderColor: "#63717e",
    overflow: "hidden",
  },
  cardTitle: {
    color: "#f2f5f8",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  dateInput: {
    position: "relative",
    justifyContent: "center",
    padding: 8,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 4,
    overflow: "hidden",
    elevation: 6,
  },
  dateInputText: {
    color: "#f6f9ff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  buttonRow: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  confirmButton: {
    position: "relative",
    width: "40%",
    overflow: "hidden",
  },
  confirmGradient: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  confirmText: {
    paddingVertical: 8,
    color: "#f5feff",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  selfChooseButton: {
    position: "relative",
    marginTop: "auto",
    marginHorizontal: "auto",
    width: "60%",
    overflow: "hidden",
  },
  selfChooseButtonDisabled: {
    opacity: 0.75,
  },
  selfChooseButtonActive: {
    opacity: 1,
  },
  selfChooseGradient: {
    justifyContent: "center",
    alignItems: "center",
  },
  selfChooseText: {
    paddingVertical: 18,
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  // starContainer: {
  //   position: "absolute",
  //   top: "50%",
  //   left: "50%",
  //   width: 300,
  //   height: 300,
  //   marginLeft: -150,
  //   marginTop: -150,
  // },
  // starElement: {
  //   position: "absolute",
  //   width: 100,
  //   height: 100,
  // },
  elementPressable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  // elementImage: {
  //   width: "100%",
  //   height: "100%",
  // },
  selectedElement: {
    zIndex: 4,
  },
  // elementTop: {
  //   top: -50,
  //   left: "50%",
  //   marginLeft: -50,
  // },
  // elementLeft: {
  //   top: 50,
  //   left: -25,
  // },
  // elementRight: {
  //   top: 50,
  //   right: -25,
  // },
  // elementBottomRight: {
  //   bottom: -50,
  //   right: 0,
  // },
  // elementBottomLeft: {
  //   bottom: -50,
  //   left: 0,
  // },
  selectionOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  selectionOverlayBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#ffffff",
  },
  selectionPreview: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  selectionPreviewImage: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -100,
    marginTop: -150,
    width: 200,
    height: 200,
  },
  selectionActions: {
    alignItems: "center",
    rowGap: 12,
    marginBottom: 48,
    width: "100%",
    zIndex: 1,
  },
  selectionConfirmButton: {
    alignItems: "center",
    paddingVertical: 16,
    width: "80%",
    borderRadius: 8,
    backgroundColor: "#262b33",
  },
  selectionConfirmText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  chooseAgainText: {
    color: "#000000",
    fontSize: 15,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  modalHeader: {
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#ced4da",
    paddingVertical: 42,
    paddingHorizontal: 24,
    marginTop: 48,
    alignItems: "center",
    zIndex: 2,
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  modalTitleElement: {
    color: "#f0e68c",
    fontSize: 20,
    fontWeight: "800",
  },
  modalTitleBold: {
    color: "#ffffff",
    fontWeight: "900",
  },
  modalDescription: {
    color: "#b0b8c0",
    fontSize: 14,
    fontWeight: "400",
  },
});

export default TabHome;
