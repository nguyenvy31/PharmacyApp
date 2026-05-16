// src/chatBotscreen.js

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  Linking,
} from "react-native";

import { authFetch } from "../../services/authFetch";
import { initDB, saveMessages, loadMessages, clearMessages } from "../../services/ChatStorage";
import API from "../../config/api";

import MedicineCard from "../../components/MedicineCard";
import { useCart } from "../../context/CartContext";

export default function ChatBotScreen({ navigation }) {

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [mode, setMode] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const { addToCart } = useCart();

  const flatListRef = useRef(null);


  // tạo message option
  const createOptions = () => ({
    _id: Math.random().toString(),
    type: "options",
    createdAt: new Date(),
    user: { _id: 2 },
  });

  const resetChat = async () => {

    await clearMessages();

    const newChat = [
      createOptions(),
      {
        _id: "welcome",
        text: "Xin chào! Tôi là PharmaBot. Tôi có thể giúp bạn tìm thuốc.",
        createdAt: new Date(),
        user: { _id: 2, name: "PharmaBot" },
      },
    ];

    setMessages(newChat);
    saveMessages(newChat);

  };

  // load chat
  useEffect(() => {

    initDB();

    (async () => {

      const loaded = await loadMessages();

      if (loaded && loaded.length) {

        setMessages(loaded);

      } else {

        setMessages([
          createOptions(),
          {
            _id: "welcome",
            text: "Xin chào! Tôi là PharmaBot. Tôi có thể giúp bạn tìm thuốc.",
            createdAt: new Date(),
            user: { _id: 2, name: "PharmaBot" },
          },
        ]);

      }

    })();

  }, []);


  // user chọn option
  const handleOption = (type) => {
    if (type === "advisor") {

      const botMsg = {
        _id: Math.random().toString(),
        text: "Bạn sẽ được chuyển sang Zalo để chat với dược sĩ.",
        createdAt: new Date(),
        user: { _id: 2 },
      };

      setMessages((prev) => [botMsg, ...prev]);

      setTimeout(() => {
        Linking.openURL("https://zalo.me/0912516002");
      }, 800);

      return;
    }
    setMode(type);

    let msg = "";

    if (type === "name")
      msg = "Vui lòng nhập tên thuốc bạn muốn tìm.";

    if (type === "usage")
      msg = "Vui lòng nhập triệu chứng hoặc công dụng.";

    const botMsg = {
      _id: Math.random().toString(),
      text: msg,
      createdAt: new Date(),
      user: { _id: 2 },
    };

    setMessages((prev) => [botMsg, ...prev]);

  };

  // gửi tin nhắn
  const onSend = useCallback(async () => {

    if (!text.trim()) return;
    if (!mode) return;

    const userMsg = {
      _id: Math.random().toString(),
      text: text,
      createdAt: new Date(),
      user: { _id: 1 },
    };

    const updated = [userMsg, ...messages];

    setMessages(updated);
    saveMessages(updated);

    setText("");
    Keyboard.dismiss();
    setIsTyping(true);

    try {
      let botReply = "";
      let medicines = [];

      let column = "";

      if (mode === "name") column = "name";
      if (mode === "usage") column = "usage_text";

      if (!column) return;

      const res = await fetch(API.CHAT_SEARCH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          column: column,
        }),
      });

      // check lỗi HTTP
      if (!res.ok) {
        const errText = await res.text();
        console.log("API ERROR:", errText);
        throw new Error("Request failed: " + res.status);
      }

      // parse JSON
      const data = await res.json();

      botReply = data?.reply || "Không có phản hồi";
      medicines = data?.fromDb || [];

      const botMsg = {
        _id: Math.random().toString(),
        text: botReply,
        createdAt: new Date(),
        user: { _id: 2 },
      };

      const medicineCards = {
        _id: Math.random().toString(),
        type: "medicine_card",
        medicines: medicines,
        createdAt: new Date(),
        user: { _id: 2 },
      };

      const followUp = {
        _id: Math.random().toString(),
        text: "Bạn đã tìm được thuốc mong muốn chưa?",
        createdAt: new Date(),
        user: { _id: 2 },
      };

      const options = createOptions();

      const finalMessages = [
        options,
        followUp,
        medicineCards,
        botMsg,
        ...updated,
      ];

      setMessages(finalMessages);
      saveMessages(finalMessages);

      setMode(null);

    } catch (err) {

      const errMsg = {
        _id: Math.random().toString(),
        text: "Xin lỗi, có lỗi khi kết nối hệ thống.",
        createdAt: new Date(),
        user: { _id: 2 },
      };

      setMessages([errMsg, ...messages]);

    } finally {

      setIsTyping(false);

    }

  }, [text, mode, messages]);

  // render message
  const renderMessage = ({ item }) => {

    // OPTION BUTTONS
    if (item.type === "options") {

      return (
        <View style={styles.optionContainer}>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleOption("name")}
          >
            <Text style={styles.optionText}>🔎 Tìm theo tên</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleOption("usage")}
          >
            <Text style={styles.optionText}>💊 Tìm theo công dụng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => handleOption("advisor")}
          >
            <Text style={styles.optionText}>👩‍⚕️ Tư vấn viên</Text>
          </TouchableOpacity>

        </View>
      );

    }

    // MEDICINE CARD
     if (item.type === "medicine_card") {

          return (
            <FlatList
              data={item.medicines}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(m) => m.id.toString()}
              contentContainerStyle={{ paddingHorizontal: 10 }}
              renderItem={({ item }) => (

                <View style={{ width: 180, marginRight: 12 }}>
                  <MedicineCard
                    item={item}
                    onPress={() =>
                      navigation.navigate("ProductDetail", {
                        medicineId: item.id,
                      })
                    }
                    onAddToCart={() => addToCart(item)}
                  />
                </View>

              )}
            />
          );

     }

    const isUser = item.user._id === 1;

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.botMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.botText,
          ]}
        >
          {item.text}
        </Text>
      </View>
    );

  };

  return (

    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableOpacity
        style={styles.resetBtn}
        onPress={resetChat}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
          Bắt đầu cuộc trò chuyện mới
        </Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        inverted
      />

      {isTyping && (
        <Text style={styles.typing}>PharmaBot đang trả lời...</Text>
      )}

      <View style={styles.inputContainer}>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Nhập tin nhắn..."
        />

        <TouchableOpacity
          style={styles.sendBtn}
          onPress={onSend}
        >
          <Text style={{ color: "#fff" }}>Gửi</Text>
        </TouchableOpacity>

      </View>

    </KeyboardAvoidingView>

  );

}

const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: "#f3f4f6" },

  messageContainer: {
    margin: 8,
    padding: 12,
    borderRadius: 16,
    maxWidth: "80%",
  },

  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4f46e5",
  },

  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
  },

  messageText: { fontSize: 16 },

  userText: { color: "#fff" },

  botText: { color: "#111827" },

  typing: {
    padding: 10,
    color: "#6b7280",
  },

  inputContainer: {
    flexDirection: "row",
    padding: 10,
  },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
  },

  sendBtn: {
    backgroundColor: "#4f46e5",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 20,
    marginLeft: 8,
  },

  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },

  optionButton: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  optionText: {
    fontWeight: "600",
  },

  resetBtn: {
    backgroundColor: "#3b82f6",
    padding: 10,
    alignItems: "center",
  },

});