import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import "./app/i18n"; // استيراد نظام الترجمة
import LanguageButton from "./app/components/LanguageButton";

import AppNavigator from "./src/navigation/AppNavigator";

const Stack = createStackNavigator();

export default function App() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerRight: () => <LanguageButton />,
      }}
    >
      {/* سيتم إضافة الشاشات هنا */}
    </Stack.Navigator>
  );
}
