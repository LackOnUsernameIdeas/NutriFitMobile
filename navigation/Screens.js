import { Animated, Dimensions, Easing } from "react-native";
// header for screens
import { Header, Icon } from "../components";
import React, { useEffect, useState } from "react"; // Add this line
// drawer
import MealPlanner from "../screens/MealPlanner";
import Onboarding from "../screens/Onboarding";
import Register from "../screens/Register";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import LogIn from "../screens/LogIn";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import UserMeasurements from "../screens/UserMeasurements";
import { fetchAdditionalUserData } from "../database/getFunctions";

const { width } = Dimensions.get("screen");

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

function MealPlannerStack(props) {
  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: "screen"
      }}
    >
      <Stack.Screen
        name="MealPlanner"
        component={MealPlanner}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="MealPlanner"
              search
              options
              navigation={navigation}
              scene={scene}
            />
          ),
          cardStyle: { backgroundColor: "#F8F9FE" }
        }}
      />
    </Stack.Navigator>
  );
}

export default function OnboardingStack(props) {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [hasMeasurementsForToday, setHasMeasurementsForToday] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const subscriber = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userData = await fetchAdditionalUserData(user.uid);
        const userDocKey = new Date().toISOString().slice(0, 10);
        if (userData[userDocKey]) {
          setHasMeasurementsForToday(true);
        }
      }
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, [initializing]);

  if (initializing) return null;

  return (
    <Stack.Navigator
      screenOptions={{
        mode: "card",
        headerShown: false
      }}
    >
      {!user ? (
        <>
          <Stack.Screen
            name="Onboarding"
            component={Onboarding}
            option={{
              headerTransparent: true
            }}
          />
          <Stack.Screen
            name="Register"
            component={Register}
            options={{
              headerShown: false
            }}
            initialParams={{ navigation: props.navigation }}
          />
          <Stack.Screen
            name="LogIn"
            component={LogIn}
            options={{
              headerShown: false
            }}
            initialParams={{ navigation: props.navigation }}
          />
        </>
      ) : (
        <>
          {!hasMeasurementsForToday ? (
            <Stack.Screen
              name="UserMeasurements"
              component={UserMeasurements}
              options={{
                headerShown: false
              }}
              initialParams={{ navigation: props.navigation }}
            />
          ) : (
            <Stack.Screen name="App" component={AppStack} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

function AppStack(props) {
  return (
    <Drawer.Navigator
      style={{ flex: 1 }}
      drawerStyle={{
        backgroundColor: "white",
        width: width * 0.8
      }}
      drawerContentOptions={{
        activeTintcolor: "white",
        inactiveTintColor: "#000",
        activeBackgroundColor: "transparent",
        itemStyle: {
          width: width * 0.75,
          backgroundColor: "transparent",
          paddingVertical: 16,
          paddingHorizonal: 12,
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
          overflow: "hidden"
        },
        labelStyle: {
          fontSize: 18,
          marginLeft: 12,
          fontWeight: "normal"
        }
      }}
      initialRouteName="MealPlanner"
    >
      <Drawer.Screen
        name="MealPlanner"
        component={MealPlannerStack}
        options={{
          headerShown: false
        }}
      />
    </Drawer.Navigator>
  );
}
