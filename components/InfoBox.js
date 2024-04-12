import React from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Block } from "galio-framework";

class InfoBox extends React.Component {
  state = {
    showModal: false
  };

  toggleModal = () => {
    this.setState((prevState) => ({
      showModal: !prevState.showModal
    }));
  };

  render() {
    const { title, text, isForMacroNutrients } = this.props;
    const { showModal } = this.state;

    // Function to render bold text
    const renderBoldText = (text) => {
      const boldRegex = /<b>(.*?)<\/b>/g;
      const parts = text.split(boldRegex);
      return (
        <Text style={styles.info}>
          {parts.map((part, index) => {
            if (part.match(boldRegex)) {
              return (
                <Text key={index} style={styles.bold}>
                  {part.replace(/<\/?b>/g, "")}
                </Text>
              );
            } else {
              return part;
            }
          })}
        </Text>
      );
    };

    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.toggleModal}>
          <Ionicons
            name="information-circle"
            size={24}
            color="#8c8bfc"
            style={isForMacroNutrients && { marginBottom: 8 }}
          />
        </TouchableOpacity>
        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={this.toggleModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modal}>
              <Text style={styles.title}>{title}</Text>
              <ScrollView style={styles.scrollView}>
                <Block>
                  {text.map((paragraph, index) => (
                    <View key={index} style={styles.paragraph}>
                      {renderBoldText(paragraph)}
                    </View>
                  ))}
                </Block>
              </ScrollView>
              <TouchableOpacity onPress={this.toggleModal}>
                <View style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Затвори</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center"
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    width: "80%"
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
  },
  scrollView: {
    maxHeight: 250 // Adjust the maxHeight as needed
  },
  info: {
    fontSize: 16,
    marginBottom: 10
  },
  paragraph: {
    marginBottom: 10
  },
  bold: {
    fontWeight: "bold"
  },
  closeButton: {
    backgroundColor: "#8c8bfc",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold"
  }
});

export default InfoBox;
