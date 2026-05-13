import { router } from "expo-router";

import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ConfirmOverlay } from "@/features/element/confirm-overlay";
import { ElementItemFloatingCircle } from "@/features/element/item-floating-circle";

import { ButtonGradient } from "@/components/typography/ButtonGradient";
import { getElementByBirthDate } from "@/utils/element";

import { ButtonPrimary } from "@/components/typography/ButtonPrimary";
import { FramePrimary2 } from "@/components/typography/FramePrimary2";
import { HeadingPrimary } from "@/components/typography/HeadingPrimary";
import { INITIAL_PET_POWER } from "@/constants";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserState } from "@/hooks/useUserState";
import { createDate } from "@/lib/app/time";
import { FIVE_ELEMENTS } from "@/types/UserState";
import { ChooseElementBackgroundVideo } from "./ChooseElementBackgroundVideo";
import * as Types from "./type";

export function RouteChooseElement(properties: Types.Properties) {
  const { dateLabel } = properties;

  const [stage, setStage] = useState<Types.Stage>("choose-element");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [element, setElement] = useState<ElementName | null>(null);
  const { updateProfile } = useUserProfile();
  const { updateUserState } = useUserState();

  function onDateChange(event: Types.DateTimePickerEvent, selectedDate?: Date) {
    setShowDatePicker(false);

    if (event.type === "set" && selectedDate) {
      setDateOfBirth(selectedDate);
    }
  }

  function handleSubmitBirthday() {
    if (!dateOfBirth) {
      return;
    }

    const element = getElementByBirthDate(dateOfBirth);

    setDateOfBirth(null);
    setShowDatePicker(false);
    handleSelectElement(element);
  }

  function getRandomElement(): ElementName {
    const todayElement = getElementByBirthDate(createDate());
    return todayElement;
  }

  function handleSelectElement(elementName: ElementName) {
    setElement(elementName);
    setStage("confirm-element");
  }

  const renderTitle = () => {
    if (stage !== "choose-element") {
      return null;
    }

    return (
      <View
        style={{
          width: 400,
          height: 100,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        <HeadingPrimary>Choose your Element</HeadingPrimary>
      </View>
    );
  };

  const renderChooseBirthday = () => (
    <View style={styles.dateContainer}>
      <FramePrimary2>
        <View style={styles.dateWrapper}>
          <Text style={styles.dateTitle}>Enter your date of birth</Text>
          <Pressable
            style={styles.dateLabelWrapper}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateLabelTitle}>
              {dateOfBirth ? dateOfBirth.toLocaleDateString() : dateLabel}
            </Text>
          </Pressable>
          <ButtonGradient
            color="PRIMARY"
            style={styles.dateConfirmWrapper}
            buttonStyle={styles.dateConfirmButtonWrapper}
            onPress={handleSubmitBirthday}
          >
            <Text style={styles.dateConfirmButton}>Confirm</Text>
          </ButtonGradient>
        </View>
      </FramePrimary2>

      {showDatePicker && (
        <DateTimePicker
          value={createDate()}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={createDate()}
        />
      )}
    </View>
  );

  const renderChooseElement = () => (
    <ElementItemFloatingCircle
      onSelectElement={handleSelectElement}
      //
    />
  );

  const renderToggleButton = () => {
    if (stage !== "choose-birthday" && stage !== "choose-element") {
      return null;
    }

    return (
      <View style={{ marginTop: "auto" }}>
        <ButtonPrimary
          onPress={() =>
            setStage((prev) => {
              switch (prev) {
                case "choose-birthday":
                  return "choose-element";
                case "choose-element":
                  return "choose-birthday";

                default:
                  return prev;
              }
            })
          }
        >
          {stage === "choose-birthday" && "I will choose myself"}
          {stage === "choose-element" && "Help me choose"}
        </ButtonPrimary>
      </View>
    );
  };

  const RandomElementButton = () => {
    return (
      <View
        style={{
          width: 480,
          height: 100,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        <ButtonPrimary
          onPress={() => {
            const element = getRandomElement();
            handleSelectElement(element);
          }}
        >
          Help me choose
        </ButtonPrimary>
      </View>
    );
  };

  const renderConfirmOverlay = () => {
    if (!element) {
      return null;
    }

    return (
      <ConfirmOverlay
        element={element}
        onChooseAgain={() => setStage("choose-element")}
        onConfirm={() => {
          if (element) {
            let elementString = FIVE_ELEMENTS.EARTH;
            switch (element) {
              case "water":
                elementString = FIVE_ELEMENTS.WATER;
                break;
              case "fire":
                elementString = FIVE_ELEMENTS.FIRE;
                break;
              case "metal":
                elementString = FIVE_ELEMENTS.METAL;
                break;
              case "earth":
                elementString = FIVE_ELEMENTS.EARTH;
                break;
              case "wood":
                elementString = FIVE_ELEMENTS.WOOD;
                break;
            }
            updateProfile({ element: elementString });
            updateUserState({
              petPower: INITIAL_PET_POWER,
            });
          }
          setStage("hatching-sequence");
        }}
      />
    );
  };

  return (
    <View style={styles.root}>
      <ChooseElementBackgroundVideo
        isIdle={stage === "choose-element" || stage === "confirm-element"}
        element={element}
        onHatchingEnd={() => router.replace("/main-menu")}
      />

      <View style={styles.toolWrapper}>
        {renderTitle()}

        {stage === "choose-birthday" && renderChooseBirthday()}
        {stage === "choose-element" && renderChooseElement()}
        {stage === "confirm-element" && renderConfirmOverlay()}

        {stage === "choose-element" && <RandomElementButton />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toolWrapper: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  dateContainer: {
    //
  },
  dateWrapper: {
    rowGap: 8,
    width: "85%",
  },
  dateTitle: {
    color: "#f2f5f8",
    fontSize: 21,
    fontWeight: "700",
    textAlign: "center",
  },
  dateLabelWrapper: {
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 4,
  },
  dateLabelTitle: {
    color: "#f6f9ff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  dateConfirmWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  dateConfirmButtonWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    width: "40%",
    borderRadius: 4,
    overflow: "hidden",
  },
  dateConfirmButton: {
    paddingVertical: 8,
    color: "#f5feff",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
