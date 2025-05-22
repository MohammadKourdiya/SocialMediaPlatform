import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Comment = ({ comment }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleReply = () => {
    if (replyText.trim()) {
      // هنا يمكنك إضافة منطق إرسال الرد
      setReplyText("");
      setShowReplyInput(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* التعليق الرئيسي */}{" "}
      <View style={styles.commentContainer}>
        <Image
          source={{
            uri:
              comment.userAvatar ||
              "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
          }}
          style={styles.avatar}
          onError={(e) => {
            e.nativeEvent.source.uri =
              "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";
          }}
        />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.username}>{comment.username}</Text>
            <Text style={styles.timestamp}>{comment.timestamp}</Text>
          </View>
          <Text style={styles.commentText}>{comment.text}</Text>
          <View style={styles.commentActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={16}
                color={isLiked ? "#FF3B30" : "#666"}
              />
              <Text style={styles.actionText}>{comment.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowReplyInput(!showReplyInput)}
            >
              <Ionicons name="arrow-undo-outline" size={16} color="#666" />
              <Text style={styles.actionText}>رد</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* حقل إدخال الرد */}
      {showReplyInput && (
        <View style={styles.replyInputContainer}>
          <TextInput
            style={styles.replyInput}
            placeholder="اكتب ردك..."
            value={replyText}
            onChangeText={setReplyText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleReply}>
            <Ionicons name="send" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      )}
      {/* عرض الردود */}
      {comment.replies && comment.replies.length > 0 && (
        <TouchableOpacity
          style={styles.repliesButton}
          onPress={() => setShowReplies(!showReplies)}
        >
          <Text style={styles.repliesText}>
            {showReplies
              ? "إخفاء الردود"
              : `عرض ${comment.replies.length} ردود`}
          </Text>
        </TouchableOpacity>
      )}
      {/* قائمة الردود */}
      {showReplies && comment.replies && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply, index) => (
            <View key={index} style={styles.replyContainer}>
              <Image source={{ uri: reply.userAvatar }} style={styles.avatar} />
              <View style={styles.replyContent}>
                <View style={styles.replyHeader}>
                  <Text style={styles.username}>{reply.username}</Text>
                  <Text style={styles.timestamp}>{reply.timestamp}</Text>
                </View>
                <Text style={styles.replyText}>{reply.text}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  commentContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentContent: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    padding: 8,
    borderRadius: 12,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
  commentText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    marginTop: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#666",
  },
  replyInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 40,
    marginBottom: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: {
    padding: 8,
  },
  repliesButton: {
    marginLeft: 40,
    marginBottom: 8,
  },
  repliesText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "bold",
  },
  repliesContainer: {
    marginLeft: 40,
  },
  replyContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  replyContent: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    padding: 8,
    borderRadius: 12,
  },
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  replyText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});

export default Comment;
