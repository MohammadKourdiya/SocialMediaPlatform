import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

const LanguageButton = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "ar" ? "tr" : "ar";
    i18n.changeLanguage(newLang);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={toggleLanguage}>
      <Text style={styles.text}>{i18n.language === "ar" ? "TR" : "عربي"}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginRight: 15,
    padding: 8,
    borderRadius: 5,
    backgroundColor: "#f0f0f0",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LanguageButton;
