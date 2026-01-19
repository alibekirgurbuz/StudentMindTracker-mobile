import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import socketService from '../services/socketService';

const ChatScreen = ({ navigation, route }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isUserOnline, setIsUserOnline] = useState(false);
  const scrollViewRef = useRef(null);
  const textInputRef = useRef(null);
  const statusCheckIntervalRef = useRef(null);

  // Route parametrelerini al
  const { studentId, studentName, roomType, studentInfo } = route?.params || {};

  // Redux store'dan kullanıcı bilgilerini al
  const { currentUser, token, isAuthenticated } = useSelector(state => state.user);

  useEffect(() => {
    if (isAuthenticated && currentUser && token) {
      setupSocketListeners();
    }

    // Klavye event listener'ları
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 200);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 400);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => { }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();

      // Socket event listeners cleanup
      const socket = socketService.getSocket();
      if (socket) {
        socket.off('previous_messages');
        socket.off('new_message');
        socket.off('message_error');
        socket.off('user_status');
      }

      // Periyodik kontrolü durdur
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }

      setIsUserOnline(false);
    };
  }, [isAuthenticated, currentUser, token]);

  const setupSocketListeners = async () => {
    try {
      const socket = socketService.getSocket();

      if (!socket) {
        console.error('Socket bulunamadı');
        Alert.alert('Hata', 'Bağlantı kurulamadı', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
        return;
      }

      setIsConnected(socket.connected);

      socket.on('previous_messages', (msgs) => {
        setMessages(msgs);
        setTimeout(() => scrollToBottom(), 100);
      });

      socket.on('new_message', (msg) => {
        setMessages(prev => {
          // Duplicate mesajları önle
          const exists = prev.find(m => m._id === msg._id);
          if (exists) return prev;
          return [...prev, msg];
        });
        setTimeout(() => scrollToBottom(), 100);
      });

      socket.on('message_error', (error) => {
        console.error('Mesaj hatası:', error);
        Alert.alert('Hata', error.error || 'Mesaj gönderilemedi');
      });

      // Kullanıcı online/offline durumunu dinle
      socket.on('user_status', (data) => {
        if (data.userId?.toString() === studentId?.toString()) {
          setIsUserOnline(data.isOnline);
        }
      });

      // Oda bilgilerini yükle
      loadRoomUsersWithSocket(socket);

      // Socket bağlantı durumunu güncelle
      if (!socket.connected) {
        socket.once('connect', () => {
          setIsConnected(true);
        });
      }
    } catch (error) {
      console.error('Socket bağlantı hatası:', error);
      Alert.alert('Hata', 'Bağlantı kurulamadı');
      setIsConnected(false);
    }
  };

  const loadRoomUsersWithSocket = async (socketInstance) => {
    try {
      if (!token || !currentUser) {
        console.error('Token veya kullanıcı verisi bulunamadı');
        Alert.alert('Hata', 'Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
        return;
      }

      if (!currentUser.role) {
        console.error('Kullanıcı rolü bulunamadı');
        Alert.alert('Hata', 'Kullanıcı rolü bulunamadı.', [
          { text: 'Tamam', onPress: () => navigation.goBack() }
        ]);
        return;
      }

      // Bireysel sohbet için özel oda oluştur
      if (roomType === 'individual' && studentId) {
        // studentId validasyonu
        if (!studentId || studentId === 'unknown' || studentId === '') {
          console.error('Geçersiz studentId');
          Alert.alert('Hata', 'Kullanıcı bilgisi geçersiz.', [
            { text: 'Tamam', onPress: () => navigation.goBack() }
          ]);
          return;
        }

        // studentInfo validasyonu
        if (!studentInfo || !studentInfo.ad || !studentInfo.soyad) {
          const defaultStudentInfo = {
            id: studentId,
            ad: studentName?.split(' ')[0] || 'Kullanıcı',
            soyad: studentName?.split(' ')[1] || '',
            role: 'Unknown'
          };
          setRoomUsers([defaultStudentInfo]);
        } else {
          setRoomUsers([studentInfo]);
        }

        // Room ID'yi bidirectional yap
        const userId1 = currentUser.id;
        const userId2 = studentId;
        const sortedIds = [userId1, userId2].sort();
        const individualRoomId = `individual_${sortedIds[0]}_${sortedIds[1]}`;

        setCurrentRoom(individualRoomId);

        // Odaya katıl
        if (socketInstance && socketInstance.connected) {
          socketInstance.emit('join_room', individualRoomId);
          socketInstance.emit('check_user_status', studentId);
        } else {
          socketInstance.once('connect', () => {
            socketInstance.emit('join_room', individualRoomId);
            socketInstance.emit('check_user_status', studentId);
          });
        }

        // Periyodik kontrol - her 30 saniyede bir
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current);
        }

        statusCheckIntervalRef.current = setInterval(() => {
          if (socketInstance && socketInstance.connected) {
            socketInstance.emit('check_user_status', studentId);
          }
        }, 30000);

        return;
      }

      let response;
      if (currentUser.role === 'Öğrenci') {
        response = await fetch('https://studentmindtracker-server-1.onrender.com/api/chat/classroom-users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else if (currentUser.role === 'Rehber') {
        response = await fetch('https://studentmindtracker-server-1.onrender.com/api/chat/students', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        console.error('Geçersiz kullanıcı rolü');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (currentUser.role === 'Öğrenci') {
        setRoomUsers([...data.classmates, data.rehber]);
        setCurrentRoom(data.roomId);
        if (socketInstance) {
          socketInstance.emit('join_room', data.roomId);
        }
      } else if (currentUser.role === 'Rehber') {
        setRoomUsers(data.students);
        setCurrentRoom(data.roomId);
        if (socketInstance) {
          socketInstance.emit('join_room', data.roomId);
        }
      }
    } catch (error) {
      console.error('Oda kullanıcıları yüklenirken hata:', error);
      Alert.alert('Hata', 'Kullanıcı bilgileri yüklenemedi');
    }
  };

  const handleSendMessage = () => {
    const socket = socketService.getSocket();

    // Mesaj boş kontrolü
    if (!message.trim()) return;

    // Socket kontrolü
    if (!socket || !socket.connected) {
      Alert.alert('Bağlantı Hatası', 'Sunucu ile bağlantı kurulamadı. Lütfen tekrar deneyin.');
      return;
    }

    // Room kontrolü
    if (!currentRoom) {
      Alert.alert('Hata', 'Sohbet odası bulunamadı.');
      return;
    }

    // Bireysel sohbet için receiverId kontrolü
    if (roomType === 'individual' && (!studentId || studentId === 'unknown' || studentId === '')) {
      Alert.alert('Hata', 'Alıcı bilgisi geçersiz.');
      return;
    }

    try {
      socket.emit('send_message', {
        content: message.trim(),
        roomId: currentRoom,
        receiverId: roomType === 'individual' ? studentId : null
      });
      setMessage('');
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      Alert.alert('Hata', 'Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    }
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const MessageBubble = ({ message }) => {
    // Mesaj kontrolü
    if (!message || !message.sender || !message.sender._id || !message.content) {
      return null;
    }

    // Test User mesajlarını gösterme
    const ad = (message.sender.ad || '').toLowerCase().trim();
    const soyad = (message.sender.soyad || '').toLowerCase().trim();
    const senderFullName = `${ad} ${soyad}`.trim();

    const isTestUser =
      ad === 'test' ||
      soyad === 'user' ||
      senderFullName === 'test user' ||
      ad.includes('test') ||
      soyad.includes('user');

    if (isTestUser) {
      return null;
    }

    // Content kontrolü
    if (message.content.trim() === '') {
      return null;
    }

    // CurrentUser kontrolü
    if (!currentUser || !currentUser.id) {
      return null;
    }

    const isMyMessage = message.sender._id === currentUser.id;

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        {!isMyMessage && message.sender && (
          <Text style={styles.senderName}>
            {message.sender.ad || 'Kullanıcı'} {message.sender.soyad || ''}
          </Text>
        )}
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.otherMessage
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {message.content}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.otherMessageTime
            ]}>
              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit'
              }) : '--:--'}
            </Text>
            {isMyMessage && (
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
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <LinearGradient
        colors={['#49b66f', '#1db4e2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.title}>
                {roomType === 'individual' && studentName ? studentName : 'Sınıf Sohbeti'}
              </Text>
              {roomType === 'individual' && (
                <View style={styles.connectionStatus}>
                  <View style={[styles.statusDot, isUserOnline ? styles.statusOnline : styles.statusOffline]} />
                  <Text style={styles.statusText}>
                    {isUserOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={'padding'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 85}
          enabled
        >
          {/* Mesaj Listesi */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollToBottom()}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 ? (
              <View style={styles.emptyMessages}>
                <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
                <Text style={styles.emptyMessagesText}>
                  {isConnected ? 'Henüz mesaj yok' : 'Bağlantı kuruluyor...'}
                </Text>
                <Text style={styles.emptyMessagesSubtext}>
                  İlk mesajı gönderin!
                </Text>
              </View>
            ) : (
              messages.map((msg, index) => (
                <MessageBubble key={msg._id || index} message={msg} />
              ))
            )}
          </ScrollView>

          {/* Mesaj Gönderme Alanı */}
          <View style={styles.messageInputContainer}>
            <View style={styles.inputShadow}>
              <View style={styles.inputWrapper}>
                <View style={styles.textInputContainer}>
                  <TextInput
                    ref={textInputRef}
                    style={styles.messageInput}
                    placeholder="Mesajınızı yazın..."
                    placeholderTextColor="#999"
                    value={message}
                    onChangeText={setMessage}
                    onFocus={() => {
                      // Focus olduğunda scroll'u birkaç kez yap
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                      }, 100);
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: false });
                      }, 300);
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: false });
                      }, 500);
                    }}
                    multiline
                    maxLength={500}
                  />
                </View>
                {message.trim() ? (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendMessage}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['#49b66f', '#1db4e2']}
                      style={styles.sendButtonGradient}
                    >
                      <Ionicons name="send" size={22} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.emojiButton} activeOpacity={0.7}>
                    <Ionicons name="happy-outline" size={24} color="#49b66f" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Ana container - Tüm ekranı kapsar
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },

  // SafeArea container - Güvenli alan içinde içerik gösterir (notch, status bar vb. için)
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },

  // Header bölümü - Üst kısımdaki gradient başlık alanı
  header: {
    paddingHorizontal: 20,
    paddingTop: 50, // Status bar için boşluk
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Header içeriği - Geri butonu, başlık ve menü butonunu yan yana yerleştirir
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Header sol tarafı - Geri butonu ve başlık container'ı
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  // Başlık container'ı - Kullanıcı adı ve online durumu içerir
  headerTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },

  // Başlık metni - Kullanıcı adını gösterir
  title: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },

  // Bağlantı durumu container'ı - Online/offline göstergesi ve metni
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  // Durum noktası - Online/offline durumunu gösteren küçük daire
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  // Online durumu - Yeşil renk ve glow efekti
  statusOnline: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },

  // Offline durumu - Kırmızı renk ve hafif glow efekti
  statusOffline: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },

  // Durum metni - "Çevrimiçi" veya "Çevrimdışı" yazısı
  statusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Menü butonu - Sağ üstteki üç nokta menü butonu
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Chat container - Mesajlar ve input alanını içeren ana bölüm
  chatContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },

  // Mesajlar container'ı - ScrollView için container
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 1,
    marginTop: -1,
  },

  // Mesajlar içeriği - ScrollView'in contentContainerStyle'ı
  messagesContent: {
    paddingBottom: 8,
    flexGrow: 1, // İçerik az olsa bile tam yüksekliği kapla
  },

  // Boş mesaj durumu - Henüz mesaj yokken gösterilen alan
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  // Boş mesaj ana metni - "Henüz mesaj yok" yazısı
  emptyMessagesText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },

  // Boş mesaj alt metni - "İlk mesajı gönderin!" yazısı
  emptyMessagesSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },

  // Mesaj container'ı - Her bir mesaj baloncuğunu sarar
  messageContainer: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  // Kendi mesajım container'ı - Sağa hizalanmış
  myMessageContainer: {
    alignItems: 'flex-end',
  },

  // Diğer kullanıcı mesajı container'ı - Sola hizalanmış
  otherMessageContainer: {
    alignItems: 'flex-start',
  },

  // Gönderen adı - Diğer kullanıcıların mesajlarında gösterilen isim
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Mesaj baloncuğu - Mesaj içeriğini saran balon
  messageBubble: {
    maxWidth: '85%', // Ekranın %85'inden fazla genişlemesin
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Kendi mesaj balonum - Mor/mavi gradient renk
  myMessage: {
    backgroundColor: '#49b66f',
    borderBottomRightRadius: 4, // Sağ alt köşe keskin (WhatsApp tarzı)
  },

  // Diğer kullanıcı mesaj balonu - Beyaz renk
  otherMessage: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4, // Sol alt köşe keskin (WhatsApp tarzı)
  },

  // Mesaj metni - Genel mesaj yazı stili
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },

  // Kendi mesaj metnin rengi - Beyaz
  myMessageText: {
    color: '#fff',
  },

  // Diğer kullanıcı mesaj metninin rengi - Koyu gri
  otherMessageText: {
    color: '#333',
  },

  // Mesaj footer'ı - Saat ve okundu işareti için container
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },

  // Mesaj saati - Genel saat stili
  messageTime: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.4)',
  },

  // Kendi mesajımın saati - Beyaz renk
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Diğer kullanıcı mesajının saati - Gri renk
  otherMessageTime: {
    color: 'rgba(0, 0, 0, 0.4)',
  },

  // Okundu işareti ikonu - Çift tik için margin
  readIcon: {
    marginLeft: 4,
  },

  // Mesaj input container'ı - Alt kısımdaki input alanı için dış container
  messageInputContainer: {
    paddingHorizontal: 15,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4, // Platform bazlı alt boşluk
  },

  // Input gölge efekti - Input alanına yukarıdan gölge verir
  inputShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2, // Yukarı doğru gölge
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  // Input wrapper - TextInput ve butonları yan yana tutan container
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Alt hizalama
    backgroundColor: '#f8f9fa',
    borderRadius: 28, // Yuvarlak köşeler
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  // Text input container'ı - TextInput'u sarar
  textInputContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100, // Maksimum yükseklik (çok satırlı mesajlar için)
    justifyContent: 'center',
  },

  // Mesaj input alanı - Kullanıcının mesaj yazdığı TextInput
  messageInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    minHeight: 22,
    marginBottom: 0,
  },

  // Gönder butonu - Mesaj gönderme butonu container'ı
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22, // Tam yuvarlak
    overflow: 'hidden', // Gradient için gerekli
    marginLeft: 4,
    marginBottom: 7,
  },

  // Gönder butonu gradient - LinearGradient için stil
  sendButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Emoji butonu - Mesaj yokken gösterilen emoji butonu
  emojiButton: {
    width: 44,
    height: 44,
    borderRadius: 22, // Tam yuvarlak
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    marginBottom: 7,
  },
});

export default ChatScreen;
