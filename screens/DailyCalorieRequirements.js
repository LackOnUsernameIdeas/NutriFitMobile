import React, { Component } from "react";
import { Text, StyleSheet, View, TouchableOpacity } from "react-native";

class DailyCalorieRequirements extends Component {
  constructor(props) {
    super(props);
  }

  // Function to handle button click and update state with clicked calories
  handleCaloriesButtonClick = (calories, goal) => {
    this.props.onCaloriesSelect(calories);
    this.props.onGoalSelect(goal);
  };

  render() {
    const { dailyCaloryRequirementsArray, activityLevel } = this.props;
    const selectedLevelData = dailyCaloryRequirementsArray[activityLevel - 1];

    return (
      <View style={styles.container}>
        <TouchableOpacity style={[styles.button, styles.bmrButton]}>
          <Text style={styles.buttonText}>
            Базов метаболизъм{"\n"}
            {selectedLevelData?.BMR.toFixed(2) + " kcal"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.weightLossButton]}
          onPress={() =>
            this.handleCaloriesButtonClick(
              selectedLevelData?.goals["Mild weight loss"].calory.toFixed(2),
              "mildlose"
            )
          }
        >
          <Text style={styles.buttonText}>
            Леко сваляне на тегло{"\n"}
            {selectedLevelData?.goals["Mild weight loss"].calory.toFixed(2) +
              " kcal"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.weightLossButton]}
          onPress={() =>
            this.handleCaloriesButtonClick(
              selectedLevelData?.goals["Weight loss"].calory.toFixed(2),
              "weightlose"
            )
          }
        >
          <Text style={styles.buttonText}>
            Сваляне на тегло{"\n"}
            {selectedLevelData?.goals["Weight loss"].calory.toFixed(2) +
              " kcal"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.weightLossButton]}
          onPress={() =>
            this.handleCaloriesButtonClick(
              selectedLevelData?.goals["Extreme weight loss"].calory.toFixed(2),
              "extremelose"
            )
          }
        >
          <Text style={styles.buttonText}>
            Екстремно сваляне на тегло{"\n"}
            {selectedLevelData?.goals["Extreme weight loss"].calory.toFixed(2) +
              " kcal"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.weightMaintainButton]}
          onPress={() =>
            this.handleCaloriesButtonClick(
              selectedLevelData?.goals["maintain weight"].toFixed(2),
              "maintain"
            )
          }
        >
          <Text style={styles.buttonText}>
            Запазване на тегло{"\n"}
            {selectedLevelData?.goals["maintain weight"].toFixed(2) + " kcal"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.weightGainButton]}
          onPress={() =>
            this.handleCaloriesButtonClick(
              selectedLevelData?.goals["Mild weight gain"].calory.toFixed(2),
              "mildgain"
            )
          }
        >
          <Text style={styles.buttonText}>
            Леко качване на тегло{"\n"}
            {selectedLevelData?.goals["Mild weight gain"].calory.toFixed(2) +
              " kcal"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.weightGainButton]}
          onPress={() =>
            this.handleCaloriesButtonClick(
              selectedLevelData?.goals["Weight gain"].calory.toFixed(2),
              "weightgain"
            )
          }
        >
          <Text style={styles.buttonText}>
            Качване на тегло{"\n"}
            {selectedLevelData?.goals["Weight gain"].calory.toFixed(2) +
              " kcal"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.weightGainButton]}
          onPress={() =>
            this.handleCaloriesButtonClick(
              selectedLevelData?.goals["Extreme weight gain"].calory.toFixed(2),
              "extremegain"
            )
          }
        >
          <Text style={styles.buttonText}>
            Екстремно качване на тегло{"\n"}
            {selectedLevelData?.goals["Extreme weight gain"].calory.toFixed(2) +
              " kcal"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center"
  },
  button: {
    width: "45%",
    height: "20%",
    margin: "2.5%",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "gray",
    alignItems: "center"
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center"
  },
  bmrButton: {
    backgroundColor: "#4CAF50"
  },
  weightLossButton: {
    backgroundColor: "#FF9800"
  },
  weightMaintainButton: {
    backgroundColor: "#2196F3"
  },
  weightGainButton: {
    backgroundColor: "#F44336"
  }
});

export default DailyCalorieRequirements;
