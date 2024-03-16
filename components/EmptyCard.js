import React from "react";
import { withNavigation } from "@react-navigation/compat";
import PropTypes from "prop-types";
import {
  StyleSheet,
  Dimensions,
  Image,
  TouchableWithoutFeedback
} from "react-native";
import { Block, Text, theme } from "galio-framework";

import { argonTheme } from "../constants";

class EmptyCard extends React.Component {
  render() {
    const { navigation, item, horizontal, full, style, ctaColor, imageStyle } =
      this.props;

    const imageStyles = [
      full ? styles.fullImage : styles.horizontalImage,
      imageStyle
    ];
    const cardContainer = [styles.card, styles.shadow, style];
    const imgContainer = [
      styles.imageContainer,
      horizontal ? styles.horizontalStyles : styles.verticalStyles,
      styles.shadow
    ];

    return (
      <Block row={horizontal} card flex style={cardContainer}>
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate("MealPlanner")}
        >
          <Block flex style={imgContainer}>
            <Image source={{ uri: item.image }} style={imageStyles} />
          </Block>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() => navigation.navigate("MealPlanner")}
        >
          <Block flex space="between" style={styles.cardDescription}>
            <Text size={14} style={styles.cardTitle}>
              {item.title}
            </Text>
            <Text
              size={12}
              muted={!ctaColor}
              color={ctaColor || argonTheme.COLORS.ACTIVE}
              bold
            >
              {item.cta}
            </Text>
          </Block>
        </TouchableWithoutFeedback>
      </Block>
    );
  }
}
