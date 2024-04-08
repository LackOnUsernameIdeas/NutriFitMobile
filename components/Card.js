import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View } from "react-native";
import { theme } from "galio-framework";

const Card = ({ children, style }) => {
  return <View style={[styles.card, styles.shadow, style]}>{children}</View>;
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.COLORS.WHITE,
    marginHorizontal: 15,
    borderWidth: 0,
    marginTop: 16,
    borderRadius: 10,
    elevation: 2,
    shadowColor: theme.COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.1
  }
});

export default Card;
