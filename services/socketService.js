import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token, userId) {
    if (this.socket && this.socket.connected) {
      console.log('Socket zaten bağlı');
      return this.socket;
    }

    console.log('Global socket bağlantısı kuruluyor...');
    console.log('User ID:', userId);

    this.socket = io('https://studentmindtracker-server-1.onrender.com', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 30000, // 30 saniye timeout
      transports: ['websocket', 'polling'], // Önce websocket, sonra polling dene
      forceNew: false,
      autoConnect: true,
      query: {
        userId: userId
      }
    });

    this.socket.on('connect', () => {
      console.log('✅ Global socket bağlandı - ID:', this.socket.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Global socket bağlantısı kesildi - Sebep:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket bağlantı hatası:', error.message || error);
      this.isConnected = false;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Socket yeniden bağlanma denemesi: ${attemptNumber}`);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Socket yeniden bağlandı (${attemptNumber} denemeden sonra)`);
      this.isConnected = true;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Socket yeniden bağlanma başarısız - Tüm denemeler tükendi');
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket genel hatası:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('Global socket bağlantısı kapatılıyor...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
