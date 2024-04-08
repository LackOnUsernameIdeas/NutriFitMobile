import React from "react";
import * as Font from "expo-font";
import { createIconSetFromIcoMoon } from "@expo/vector-icons";
import { Icon } from "galio-framework";

import nutriConfig from "../assets/config/nutri.json";
const NutriExtra = require("../assets/font/nutri.ttf");
const IconNutriExtra = createIconSetFromIcoMoon(nutriConfig, "NutriExtra");

class IconExtra extends React.Component {
  state = {
    fontLoaded: false
  };

  async componentDidMount() {
    await Font.loadAsync({ NutriExtra: NutriExtra });
    this.setState({ fontLoaded: true });
  }

  render() {
    const { name, family, ...rest } = this.props;

    if (name && family && this.state.fontLoaded) {
      if (family === "NutriExtra") {
        return <IconNutriExtra name={name} family={family} {...rest} />;
      }
      return <Icon name={name} family={family} {...rest} />;
    }

    return null;
  }
}

export default IconExtra;
