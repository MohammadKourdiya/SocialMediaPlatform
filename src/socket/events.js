// أحداث الرسائل
const MESSAGE_EVENTS = {
  SEND_MESSAGE: "sendMessage",
  NEW_MESSAGE: "newMessage",
  MESSAGE_SENT: "messageSent",
  MESSAGE_READ: "messageRead",
  TYPING: "typing",
  USER_TYPING: "userTyping",
};

// أحداث المستخدمين
const USER_EVENTS = {
  USERS_ONLINE: "usersOnline",
  USER_CONNECTED: "userConnected",
  USER_DISCONNECTED: "userDisconnected",
};

// أحداث الإشعارات
const NOTIFICATION_EVENTS = {
  NEW_NOTIFICATION: "newNotification",
  NOTIFICATION_READ: "notificationRead",
};

// أحداث المنشورات
const POST_EVENTS = {
  NEW_POST: "newPost",
  POST_LIKED: "postLiked",
  POST_COMMENTED: "postCommented",
  POST_DELETED: "postDeleted",
};

module.exports = {
  MESSAGE_EVENTS,
  USER_EVENTS,
  NOTIFICATION_EVENTS,
  POST_EVENTS,
};
