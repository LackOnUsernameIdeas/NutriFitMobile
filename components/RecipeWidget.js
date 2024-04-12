import React from "react";
import { Image, StyleSheet, Alert, TouchableOpacity, View } from "react-native"; // Import Alert from react-native
import { Block, Text, theme } from "galio-framework";
import PropTypes from "prop-types";
import { nutriTheme } from "../constants";
import CustomAlert from "./Modal";

class RecipeWidget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAlert: false
    };
  }

  handleIngredientsPress = () => {
    const { item } = this.props;
    this.setState({ showAlert: true });
  };

  render() {
    const { image, item, style, imageStyle } = this.props;
    const { showAlert } = this.state;

    if (!image) {
      return null;
    }

    const imageStyles = [styles.fullImage, imageStyle];
    const cardContainer = [styles.card, styles.shadow, style];
    const imgContainer = [styles.imageContainer, styles.shadow];

    return (
      <Block card flex style={cardContainer}>
        <Block flex style={imgContainer}>
          <Image source={{ uri: image }} style={imageStyles} />
        </Block>
        <Block flex space="between" style={styles.cardDescription}>
          <Text size={20} style={styles.cardTitle}>
            {item.name}
          </Text>
          <Text size={15} style={styles.cardTitle} bold>
            {`Грамаж: ${item.totals.grams}г.`}
          </Text>
          <Block>
            <Block
              style={{
                flexDirection: "row",
                marginTop: 10,
                gap: 33
              }}
            >
              <Text size={12} color={"#8c8bfc"} bold>
                {`Калории: ${item.totals.calories} `}
              </Text>
              <Text size={12} color={"#8c8bfc"} bold>
                {`Протеин: ${item.totals.protein}г.`}
              </Text>
            </Block>
            <Block
              style={{
                flexDirection: "row",
                marginTop: 5,
                gap: 30
              }}
            >
              <Text size={12} color={"#8c8bfc"} bold>
                {`Мазнини: ${item.totals.fat}г. `}
              </Text>
              <Text size={12} color={"#8c8bfc"} bold>
                {`Въглехидрати: ${item.totals.carbohydrates}г.`}
              </Text>
            </Block>
          </Block>
          <TouchableOpacity onPress={this.handleIngredientsPress}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>Покажи рецепта</Text>
            </View>
          </TouchableOpacity>
          <CustomAlert
            visible={showAlert}
            onClose={() => this.setState({ showAlert: false })}
            title="Рецепта"
            ingredients={item.ingredients.join(", ")}
            instructions={item.instructions}
            grams={item.recipeQuantity}
          />
        </Block>
      </Block>
    );
  }
}

RecipeWidget.propTypes = {
  image: PropTypes.string,
  item: PropTypes.object.isRequired,
  style: PropTypes.object,
  imageStyle: PropTypes.object
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.COLORS.WHITE,
    borderWidth: 0,
    borderRadius: 15,
    minHeight: 114,
    marginTop: 5
  },
  imageContainer: {
    borderRadius: 15,
    elevation: 1,
    overflow: "hidden"
  },
  fullImage: {
    height: 150
  },
  shadow: {
    shadowColor: nutriTheme.COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 4,
    shadowOpacity: 0.1,
    elevation: 2
  },
  cardDescription: {
    padding: theme.SIZES.BASE / 2,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  cardTitle: {
    textAlign: "center",
    flex: 1,
    flexWrap: "wrap",
    paddingBottom: 6
  },
  button: {
    backgroundColor: "#8c8bfc",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: {
    color: theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: "bold"
  }
});

export default RecipeWidget;
