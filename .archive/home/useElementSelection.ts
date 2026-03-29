// import { Solar } from "lunar-javascript";
// import { useMemo, useState } from "react";
// import { Animated, Easing } from "react-native";
// import { CHINESE_ELEMENT_TO_KEY, ELEMENTS } from "./constants";
// import type * as Types from "./type";

export function useElementSelection() {
  // const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date("1990-01-01"));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [elementsVisible, setElementsVisible] = useState(false);
  const [selectionOverlayVisible, setSelectionOverlayVisible] = useState(false);
  const [selectedElement, setSelectedElement] =
    useState<Types.ElementName | null>(null);
  const [confirmedBirthElement, setConfirmedBirthElement] =
    useState<Types.ElementName | null>(null);

  const elementEntrance = useMemo(
    () => ({
      water: new Animated.Value(0),
      fire: new Animated.Value(0),
      metal: new Animated.Value(0),
      earth: new Animated.Value(0),
      wood: new Animated.Value(0),
    }),
    [],
  );

  const overlayElementScale = useMemo(() => new Animated.Value(0.75), []);
  const overlayBackdropOpacity = useMemo(() => new Animated.Value(0), []);
  const uiOpacity = useMemo(() => new Animated.Value(1), []);

  const dateLabel = useMemo(() => {
    if (confirmedBirthElement) {
      const label = ELEMENTS.find(
        (e) => e.key === confirmedBirthElement,
      )?.label;
      return label ? `Your element: ${label}` : "Your element is ready";
    }
    return dateOfBirth.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [confirmedBirthElement, dateOfBirth]);

  // const resolveElementByBirthDate = (date: Date): Types.ElementName => {
  //   const eightChar = Solar.fromDate(date).getLunar().getEightChar();
  //   const yearNaYin = eightChar.getYearNaYin();
  //   const naYinElementChar = yearNaYin.charAt(yearNaYin.length - 1);
  //   const fromNaYin = CHINESE_ELEMENT_TO_KEY[naYinElementChar];
  //   if (fromNaYin) return fromNaYin;
  //   const dayWuXing = eightChar.getDayWuXing();
  //   return CHINESE_ELEMENT_TO_KEY[dayWuXing.charAt(0)] ?? "earth";
  // };

  const showElements = () => {
    if (elementsVisible) return;
    setElementsVisible(true);
    Animated.stagger(
      90,
      ELEMENTS.map((element) =>
        Animated.timing(elementEntrance[element.key], {
          toValue: 1,
          duration: 340,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    ).start();
  };

  const hideElements = (onHidden?: () => void) => {
    if (!elementsVisible) {
      onHidden?.();
      return;
    }
    Animated.stagger(
      60,
      [...ELEMENTS].reverse().map((element) =>
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

  const openSelectionOverlay = (key: Types.ElementName) => {
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

  const closeSelectionOverlay = (onClosed?: () => void) => {
    Animated.timing(overlayBackdropOpacity, {
      toValue: 0,
      duration: 160,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setSelectionOverlayVisible(false);
      setSelectedElement(null);
      onClosed?.();
    });
  };

  // const handleDateChange = (event: any, selectedDate?: Date) => {
  //   setShowDatePicker(false);
  //   if (event.type === "set" && selectedDate) {
  //     setDateOfBirth(selectedDate);
  //   }
  // };

  // const handleBirthDateSubmit = () => {
  //   const element = resolveElementByBirthDate(dateOfBirth);
  //   setConfirmedBirthElement(null);
  //   setShowDatePicker(false);
  //   hideElements(() => openSelectionOverlay(element));
  // };

  const handleSelfChoosePress = () => {
    if (!elementsVisible) {
      showElements();
    } else {
      hideElements();
    }
  };

  const handleSelectElement = (key: Types.ElementName) => {
    if (elementsVisible) openSelectionOverlay(key);
  };

  const handleChooseAgain = () => {
    closeSelectionOverlay();
  };

  const handleConfirmSelection = (
    onConfirmed: (element: Types.ElementName) => void,
  ) => {
    if (selectedElement) {
      setConfirmedBirthElement(selectedElement);
      onConfirmed(selectedElement);
    }
  };

  return {
    // State
    dateOfBirth,
    dateLabel,
    showDatePicker,
    setShowDatePicker,
    elementsVisible,
    selectionOverlayVisible,
    selectedElement,

    // Animated values
    elementEntrance,
    overlayElementScale,
    overlayBackdropOpacity,
    uiOpacity,

    // Handlers
    handleDateChange,
    handleBirthDateSubmit,
    handleSelfChoosePress,
    handleSelectElement,
    handleChooseAgain,
    handleConfirmSelection,
  };
}
