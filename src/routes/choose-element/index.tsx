import { Fragment, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

import { NormalVideo } from "@/components/video/NormalVideo";

import { GradientButton } from "@/components/typography/GradientButton";
import { getElementByBirthDate } from "@/utils/element";
import { VIDEOS } from "./constants";
import * as Types from "./type";

export function RouteChooseElement(properties: Types.Properties) {
  const { dateLabel } = properties;

  const [method, setMethod] = useState<"birthday" | "element">("element");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);

  function onDateChange(event: Types.DateEvent, selectedDate?: Date) {
    setShowDatePicker(false);

    if (event.type === "set" && selectedDate) {
      setDateOfBirth(selectedDate);
    }
  }

  const handleSubmit = () => {
    if (!dateOfBirth) {
      return;
    }

    const element = getElementByBirthDate(dateOfBirth);

    setDateOfBirth(null);
    setShowDatePicker(false);

    console.log(element);
    // hideElements(() => openSelectionOverlay(element));
  };

  const renderChooseBirthday = () => {
    if (method === "element") {
      return null;
    }

    return (
      <Fragment>
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
          <Pressable style={styles.dateConfirmWrapper} onPress={handleSubmit}>
            <GradientButton
              color="SECONDARY"
              style={styles.dateConfirmButtonWrapper}
            >
              <Text style={styles.dateConfirmButton}>Confirm</Text>
            </GradientButton>
          </Pressable>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}
      </Fragment>
    );
  };

  const renderToggleButton = () => {
    return (
      <Pressable
        style={styles.chooseMyselfWrapper}
        onPress={() =>
          setMethod((prev) => (prev === "element" ? "birthday" : "element"))
        }
      >
        <GradientButton
          color="SECONDARY"
          style={styles.chooseMyselfButtonWrapper}
        >
          <Text style={styles.chooseMyselfButtonTitle}>
            {method === "element" ? "Help me choose" : "I will choose myself"}
          </Text>
        </GradientButton>
      </Pressable>
    );
  };

  return (
    <View style={styles.root}>
      <NormalVideo url={VIDEOS.hatching.idle} />

      <View style={styles.toolWrapper}>
        {renderChooseBirthday()}
        {renderToggleButton()}
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
    padding: 8,
  },
  dateWrapper: {
    rowGap: 8,
    padding: 8,
    backgroundColor: "#161a1e",
    borderWidth: 1,
    borderColor: "#63717e",
  },
  dateTitle: {
    color: "#f2f5f8",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  dateLabelWrapper: {
    justifyContent: "center",
    padding: 8,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 4,
    elevation: 6,
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
    width: "40%",
    borderRadius: 4,
    overflow: "hidden",
  },
  dateConfirmButton: {
    paddingVertical: 8,
    color: "#f5feff",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  chooseMyselfWrapper: {
    marginTop: "auto",
    marginHorizontal: "auto",
    width: "60%",
    overflow: "hidden",
  },
  chooseMyselfWrapperActive: {
    opacity: 1,
  },
  chooseMyselfButtonWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  chooseMyselfButtonTitle: {
    paddingVertical: 18,
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
