import { Block } from "galio-framework";
import React, { Component } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

class CuisineDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedCuisines: [] // Changed to an array to store multiple selections
    };
  }

  handleCuisineSelect = (cuisine) => {
    this.setState((prevState) => {
      const updatedCuisines = [...prevState.selectedCuisines];
      const index = updatedCuisines.indexOf(cuisine);

      if (index === -1) {
        // If cuisine is not selected, add it to the selectedCuisines array
        updatedCuisines.push(cuisine);
      } else {
        // If cuisine is already selected, remove it from the selectedCuisines array
        updatedCuisines.splice(index, 1);
      }

      // Invoke onCuisineSelect callback with updated selected cuisines
      this.props.onCuisineSelect(updatedCuisines);

      return { selectedCuisines: updatedCuisines };
    });
  };

  render() {
    const { selectedCuisines } = this.state;

    return (
      <View style={styles.container}>
        {/* Top card */}
        <View style={styles.topCard}>
          <Block style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>Изберете кухня: </Text>
          </Block>
        </View>

        {/* Bottom card */}
        <View style={styles.bottomCard}>
          <View style={styles.cardContent}>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.option}
                onPress={() => this.handleCuisineSelect("Bulgarian")}
              >
                {selectedCuisines.includes("Bulgarian") && (
                  <Text
                    style={[styles.selectedIndicator, { color: "#9a99ff" }]}
                  >
                    ✓
                  </Text>
                )}
                <Text style={styles.optionText}>🇧🇬 Българска</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.option}
                onPress={() => this.handleCuisineSelect("Spanish")}
              >
                {selectedCuisines.includes("Spanish") && (
                  <Text
                    style={[styles.selectedIndicator, { color: "#9a99ff" }]}
                  >
                    ✓
                  </Text>
                )}
                <Text style={styles.optionText}>🇪🇸 Испанска</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.option}
                onPress={() => this.handleCuisineSelect("Italian")}
              >
                {selectedCuisines.includes("Italian") && (
                  <Text
                    style={[styles.selectedIndicator, { color: "#9a99ff" }]}
                  >
                    ✓
                  </Text>
                )}
                <Text style={styles.optionText}>🇮🇹 Италианска</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.option}
                onPress={() => this.handleCuisineSelect("French")}
              >
                {selectedCuisines.includes("French") && (
                  <Text
                    style={[styles.selectedIndicator, { color: "#9a99ff" }]}
                  >
                    ✓
                  </Text>
                )}
                <Text style={styles.optionText}>🇫🇷 Френска</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20
  },
  topCard: {
    zIndex: 1, // Ensure the top card is above the bottom card
    minHeight: 60
  },
  bottomCard: {
    backgroundColor: "#e5e6e9",
    marginTop: -45, // Adjust the overlap as needed
    borderRadius: 15,
    overflow: "hidden",
    position: "relative" // Make the bottom card relative to its container
  },
  dropdownButton: {
    backgroundColor: "#9a99ff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15
  },
  dropdownButtonText: {
    color: "#fff",
    fontSize: 18
  },
  cardContent: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 30
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  optionText: {
    fontSize: 16,
    marginLeft: 10
  },
  selectedIndicator: {
    marginLeft: "auto",
    fontSize: 20
  }
});

export default CuisineDropdown;
