import React, { Component } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";

class DailyCalorieRequirements extends Component {
  render() {
    const { dailyCaloryRequirementsArray, activityLevel } = this.props;
    const selectedLevelData = dailyCaloryRequirementsArray[activityLevel - 1];

    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => console.log("Базов метаболизъм")}
        >
          <Text style={styles.buttonText}>
            Базов метаболизъм {selectedLevelData?.BMR.toFixed(2) + " kcal"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => console.log("Леко сваляне на тегло")}
        >
          <Text style={styles.buttonText}>
            Леко сваляне на тегло{" "}
            {selectedLevelData?.goals["Mild weight loss"].calory.toFixed(2) +
              " kcal"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => console.log("Сваляне на тегло")}
        >
          <Text style={styles.buttonText}>
            Сваляне на тегло{" "}
            {selectedLevelData?.goals["Weight loss"].calory.toFixed(2) +
              " kcal"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => console.log("Екстремно сваляне на тегло")}
        >
          <Text style={styles.buttonText}>
            Екстремно сваляне на тегло{" "}
            {selectedLevelData?.goals["Extreme weight loss"].calory.toFixed(2) +
              " kcal"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => console.log("Запазване на тегло")}
        >
          <Text style={styles.buttonText}>
            Запазване на тегло{" "}
            {selectedLevelData?.goals["maintain weight"].toFixed(2) + " kcal"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => console.log("Леко качване на тегло")}
        >
          <Text style={styles.buttonText}>
            Леко качване на тегло{" "}
            {selectedLevelData?.goals["Mild weight gain"].calory.toFixed(2) +
              " kcal"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => console.log("Качване на тегло")}
        >
          <Text style={styles.buttonText}>
            Качване на тегло{" "}
            {selectedLevelData?.goals["Weight gain"].calory.toFixed(2) +
              " kcal"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button]}
          onPress={() => console.log("Екстремно качване на тегло")}
        >
          <Text style={styles.buttonText}>
            Екстремно качване на тегло{" "}
            {selectedLevelData?.goals["Extreme weight gain"].calory.toFixed(2) +
              " kcal"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "gray"
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold"
  },
  activeButton: {
    backgroundColor: "blue",
    borderColor: "blue"
  }
});

export default DailyCalorieRequirements;
