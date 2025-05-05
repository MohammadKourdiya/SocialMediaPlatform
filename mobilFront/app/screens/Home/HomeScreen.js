import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Header from "../../components/Header";
import PostCard from "../../components/PostCard";

const HomeScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState("ar");

  const toggleLanguage = () => {
    const newLang = currentLang === "ar" ? "tr" : "ar";
    i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
  };

  // بيانات تجريبية للمشاركات
  const posts = [
    {
      id: "1",
      user: {
        name: currentLang === "ar" ? "أحمد محمد" : "Ahmet Mehmet",
        avatar: require("../../../assets/avatar1.png"),
      },
      content:
        currentLang === "ar"
          ? "هذه مشاركة تجريبية للتطبيق"
          : "Bu bir test gönderisidir",
      image: require("../../../assets/post1.jpg"),
      likes: 120,
      comments: 15,
      time: currentLang === "ar" ? "منذ ساعتين" : "2 saat önce",
    },
    {
      id: "2",
      user: {
        name: currentLang === "ar" ? "سارة أحمد" : "Sara Ahmet",
        avatar: require("../../../assets/avatar2.png"),
      },
      content: currentLang === "ar" ? "تجربة جديدة للتطبيق" : "Yeni bir deneme",
      image: require("../../../assets/post2.jpg"),
      likes: 85,
      comments: 8,
      time: currentLang === "ar" ? "منذ 4 ساعات" : "4 saat önce",
    },
  ];

  const handleLogout = () => {
    navigation.navigate("Login");
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Image source={item.user.avatar} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      {item.image && (
        <Image
          source={item.image}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={24} color="#333" />
          <Text style={styles.actionText}>
            {t("likes_count", { count: item.likes })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color="#333" />
          <Text style={styles.actionText}>
            {t("comments_count", { count: item.comments })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color="#333" />
          <Text style={styles.actionText}>{t("share")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header />
        <TouchableOpacity
          style={styles.languageButton}
          onPress={toggleLanguage}
        >
          <Text style={styles.languageText}>
            {currentLang === "ar" ? "TR" : "عربي"}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#666"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={t("search")}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.storiesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3, 4, 5].map((item) => (
              <TouchableOpacity key={item} style={styles.storyItem}>
                <Image
                  source={require("../../../assets/avatar1.png")}
                  style={styles.storyImage}
                />
                <Text style={styles.storyText}>
                  {t("story")} {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="home" size={24} color="#007AFF" />
          <Text style={styles.navText}>{t("home")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="search" size={24} color="#666" />
          <Text style={styles.navText}>{t("explore")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="add-circle-outline" size={24} color="#666" />
          <Text style={styles.navText}>{t("post")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="heart-outline" size={24} color="#666" />
          <Text style={styles.navText}>{t("likes")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#666" />
          <Text style={styles.navText}>{t("logout")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  languageButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageText: {
    color: "#fff",
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  storiesContainer: {
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  storyItem: {
    alignItems: "center",
    marginRight: 15,
  },
  storyImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  storyText: {
    marginTop: 5,
    fontSize: 12,
  },
  postContainer: {
    backgroundColor: "#fff",
    marginBottom: 10,
    padding: 15,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    marginLeft: 10,
  },
  userName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  postTime: {
    color: "#666",
    fontSize: 12,
  },
  postContent: {
    fontSize: 16,
    marginBottom: 10,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 5,
    color: "#333",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  navButton: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 5,
  },
});

export default HomeScreen;
