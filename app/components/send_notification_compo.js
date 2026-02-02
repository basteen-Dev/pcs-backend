const messaging = require("../../firebaseConfig");
const db = require("../models");

const user = db.user;

exports.sendNotification = async (deviceId, body, title) => {
  const message = {
    token: deviceId,
    notification: {
      body: body,
      title: title,
    },
    android: {
      priority: "high",
    },
  };

  try {
    await messaging.send(message);
  } catch (error) {
    if (
      error.code === "messaging/registration-token-not-registered" ||
      error.code === "messaging/invalid-argument"
    ) {
      await user.update(
        { device_id: null },
        {
          where: {
            device_id: deviceId,
          },
        }
      );
    }
  }
};
