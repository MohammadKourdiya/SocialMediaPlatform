import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Comment from "./Comment";

const PostCard = ({ post, onLike, onComment, onShare }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike && onLike(post.id);
  };

  const handleComment = () => {
    setShowComments(!showComments);
    onComment && onComment(post.id);
  };

  return (
    <View style={styles.container}>
      {/* رأس المنشور */}
      <View style={styles.header}>
        <Image
          source={{
            uri:
              post.author?.profilePicture ||
              "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
          }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{post.author?.username}</Text>
          <Text style={styles.timestamp}>
            {new Date(post.createdAt).toLocaleDateString("ar-SA")}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* محتوى المنشور */}
      <Text style={styles.content}>{post.content}</Text>

      {/* صور المنشور */}
      {post.image && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: post.image }}
            style={styles.postImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* إحصائيات المنشور */}
      <View style={styles.stats}>
        <Text style={styles.statText}>{post.likesCount || 0} إعجاب</Text>
        <Text style={styles.statText}>{post.comments?.length || 0} تعليق</Text>
      </View>

      {/* أزرار التفاعل */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            color={isLiked ? "#FF3B30" : "#666"}
          />
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            إعجاب
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
          <Text style={styles.actionText}>تعليق</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare && onShare(post.id)}
        >
          <Ionicons name="share-outline" size={24} color="#666" />
          <Text style={styles.actionText}>مشاركة</Text>
        </TouchableOpacity>
      </View>

      {/* قسم التعليقات */}
      {showComments && post.comments && post.comments.length > 0 && (
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>التعليقات</Text>
          {post.comments.map((comment, index) => (
            <Comment key={index} comment={comment} />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginVertical: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
  moreButton: {
    padding: 4,
  },
  content: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginBottom: 12,
  },
  imageContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  postImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  statText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#666",
  },
  likedText: {
    color: "#FF3B30",
  },
  commentsSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
});

export default PostCard;
