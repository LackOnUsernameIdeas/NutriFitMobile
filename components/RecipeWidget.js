import React from "react";
import { Image, StyleSheet } from "react-native";
import { Block, Text, theme } from "galio-framework";
import PropTypes from "prop-types";
import { nutriTheme } from "../constants";

class RecipeWidget extends React.Component {
  render() {
    const { image, item, style, imageStyle } = this.props;

    if (!image) {
      return null; // Handle case where image is missing
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
            {`Grams: ${item.totals.grams}`}
          </Text>
          <Text size={12} color={nutriTheme.COLORS.ACTIVE} bold>
            {`Calories: ${item.totals.calories}, Protein: ${item.totals.protein}, Fat: ${item.totals.fat}, Carbs: ${item.totals.carbohydrates}`}
          </Text>
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
    marginVertical: theme.SIZES.BASE,
    borderWidth: 0,
    borderRadius: 15,
    minHeight: 114,
    marginBottom: 16
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
    flex: 1,
    flexWrap: "wrap",
    paddingBottom: 6
  }
});

export default RecipeWidget;
