import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const ChatScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');

  

  // Örnek mesajlar
  const messages = [
    {
      id: 1,
      text: "Merhaba! Bugün nasıl hissediyorsun?",
      sender: "İlhan Tarımer",
      time: "10:30",
      isMe: false,
      timestamp: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      text: "Merhaba hocam, bugün kendimi iyi hissediyorum. Matematik dersinde başarılı oldum.",
      sender: "Sen",
      time: "10:32",
      isMe: true,
      timestamp: "2024-01-15T10:32:00Z"
    },
    {
      id: 3,
      text: "Harika! Bu başarını sürdürmek için ne yapmayı planlıyorsun?",
      sender: "Rehber Nur Taluy",
      time: "10:35",
      isMe: false,
      timestamp: "2024-01-15T10:35:00Z"
    },
    {
      id: 4,
      text: "Daha fazla pratik yapmayı ve düzenli çalışmayı planlıyorum.",
      sender: "Sen",
      time: "10:37",
      isMe: true,
      timestamp: "2024-01-15T10:37:00Z"
    },
    {
      id: 5,
      text: "Çok güzel bir plan! Her zaman yanındayım. Başarılar! 🎉",
      sender: "Rehber Nur Taluy",
      time: "10:40",
      isMe: false,
      timestamp: "2024-01-15T10:40:00Z"
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      Alert.alert('Mesaj Gönderildi', `"${message}" mesajı gönderildi.`);
      setMessage('');
    }
  };

  const MessageBubble = ({ message }) => (
    <View style={[
      styles.messageContainer,
      message.isMe ? styles.myMessageContainer : styles.otherMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        message.isMe ? styles.myMessage : styles.otherMessage
      ]}>
        <Text style={[
          styles.messageText,
          message.isMe ? styles.myMessageText : styles.otherMessageText
        ]}>
          {message.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[
            styles.messageTime,
            message.isMe ? styles.myMessageTime : styles.otherMessageTime
          ]}>
            {message.time}
          </Text>
          {message.isMe && (
            <Ionicons 
              name="checkmark-done" 
              size={16} 
              color="rgba(255, 255, 255, 0.7)" 
              style={styles.readIcon}
            />
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            {/*Headerin Tam Ortasına Rehber adı eklenecek */}
            <Text style={styles.title}>İlhan Tarımer</Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.chatContainer}>
          {/* Mesaj Listesi */}
          <ScrollView 
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </ScrollView>

          {/* Mesaj Gönderme Alanı */}
          <View style={styles.messageInputContainer}>
            <View style={styles.inputWrapper}>
              <TouchableOpacity style={styles.attachButton}>
                <Ionicons name="add" size={24} color="#667eea" />
              </TouchableOpacity>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Mesajınızı yazın..."
                  placeholderTextColor="#999"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  maxLength={500}
                />
              </View>
              {message.trim() ? (
                <TouchableOpacity 
                  style={styles.sendButton}
                  onPress={handleSendMessage}
                >
                  <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.voiceButton}>
                  <Ionicons name="mic" size={20} color="#667eea" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 100,
    marginTop: -26,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessage: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: 'rgba(0, 0, 0, 0.4)',
  },
  readIcon: {
    marginLeft: 4,
  },
  messageInputContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f0f2f5',
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  messageInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
    minHeight: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default ChatScreen;
