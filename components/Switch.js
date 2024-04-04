import React from "react";
import { Switch, Platform } from "react-native";

import nutriTheme from "../constants/Theme";

class MkSwitch extends React.Component {
  render() {
    const { value, ...props } = this.props;
    const thumbColor =
      Platform.OS === "ios"
        ? null
        : Platform.OS === "android" && value
        ? nutriTheme.COLORS.SWITCH_ON
        : nutriTheme.COLORS.SWITCH_OFF;

    return (
      <Switch
        value={value}
        thumbColor={thumbColor}
        ios_backgroundColor={nutriTheme.COLORS.SWITCH_OFF}
        trackColor={{
          false: nutriTheme.COLORS.SWITCH_ON,
          true: nutriTheme.COLORS.SWITCH_ON
        }}
        {...props}
      />
    );
  }
}

export default MkSwitch;
