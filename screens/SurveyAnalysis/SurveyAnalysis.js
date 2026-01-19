import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { analyzeStudentSurveys, getAnalysisHistory, isAppError } from '../../services/analysisService';

const { width } = Dimensions.get('window');

const SurveyAnalysis = ({ navigation }) => {
  const { currentUser } = useSelector(state => state.user || {});
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [viewMode, setViewMode] = useState('students'); // 'students', 'surveys', 'analysis'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSurveyAnalysis, setSelectedSurveyAnalysis] = useState(null);
  const [uniqueStudents, setUniqueStudents] = useState([]);
  const [isGeneralEvaluationExpanded, setIsGeneralEvaluationExpanded] = useState(false);
  const [expandedAnketler, setExpandedAnketler] = useState({}); // anketId -> true/false

  // Animasyon için ref'ler
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;
  const [gradientColors, setGradientColors] = useState(['#49b66f', '#1db4e2']);

  // Analiz geçmişini yükle
  useEffect(() => {
    loadAnalysisHistory();
  }, []);

  // Analiz animasyonu
  useEffect(() => {
    if (analyzing) {
      // Pulse animasyonu
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      // Renk animasyonu (mor tonları arasında)
      const colorAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(colorAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(colorAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      );

      // Renk listener'ı
      const colorListener = colorAnim.addListener(({ value }) => {
        // Mor tonları arasında interpolasyon
        const r1 = Math.round(102 + (139 - 102) * value); // 102 -> 139
        const g1 = Math.round(126 + (158 - 126) * value); // 126 -> 158
        const b1 = Math.round(234 + (255 - 234) * value); // 234 -> 255

        const r2 = Math.round(118 + (154 - 118) * value); // 118 -> 154
        const g2 = Math.round(75 + (123 - 75) * value); // 75 -> 123
        const b2 = Math.round(162 + (196 - 162) * value); // 162 -> 196

        // RGB'yi hex'e çevir
        const toHex = (n) => {
          const hex = n.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        };

        const color1 = `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
        const color2 = `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;

        setGradientColors([color1, color2]);
      });

      pulseAnimation.start();
      colorAnimation.start();

      return () => {
        pulseAnimation.stop();
        colorAnimation.stop();
        colorAnim.removeListener(colorListener);
      };
    } else {
      pulseAnim.setValue(1);
      colorAnim.setValue(0);
      setGradientColors(['#49b66f', '#1db4e2']);
    }
  }, [analyzing]);

  const loadAnalysisHistory = async () => {
    try {
      setLoading(true);
      const result = await getAnalysisHistory(currentUser?.id);
      if (result.success) {
        const history = result.data || [];
        setAnalysisHistory(history);

        // Benzersiz öğrencileri çıkar ve risk seviyelerini hesapla
        // Not: history, en yeni analiz en başta olacak şekilde varsayılıyor.
        const studentsMap = new Map();
        history.forEach(analysis => {
          if (analysis.analizSonucu?.ogrenciler) {
            analysis.analizSonucu.ogrenciler.forEach(student => {
              const key = student.ogrenciID?.toString();
              if (!key) return;

              // Bu analizde öğrenci için risk seviyesi hesabı (fuzzySkor üzerinden)
              let riskLevel = null;
              try {
                const ogrenciIdStr = student.ogrenciID?.toString();
                const detayMap = analysis.ogrenciAnketPuaniDetaylari || {};
                const detaylar = detayMap[ogrenciIdStr] || [];
                if (Array.isArray(detaylar) && detaylar.length > 0) {
                  let maxFuzzy = null;
                  detaylar.forEach(detay => {
                    if (typeof detay.fuzzySkor === 'number') {
                      if (maxFuzzy === null || detay.fuzzySkor > maxFuzzy) {
                        maxFuzzy = detay.fuzzySkor;
                      }
                    }
                  });
                  if (maxFuzzy !== null) {
                    if (maxFuzzy < 40) riskLevel = 'low';
                    else if (maxFuzzy <= 60) riskLevel = 'medium';
                    else riskLevel = 'high';
                  }
                }
              } catch (e) {
                console.log('Öğrenci risk seviyesi hesaplanırken hata:', e);
              }

              if (!studentsMap.has(key)) {
                // İlk gördüğümüz analiz en güncel olduğu için riskLevel'ı buradan alıyoruz
                studentsMap.set(key, {
                  ogrenciID: student.ogrenciID,
                  ad: student.ad,
                  soyad: student.soyad,
                  analizSayisi: 1,
                  riskLevel: riskLevel
                });
              } else {
                const existing = studentsMap.get(key);
                existing.analizSayisi += 1;
                // Daha önce riskLevel atanmadıysa, bu analizden al
                if (!existing.riskLevel && riskLevel) {
                  existing.riskLevel = riskLevel;
                }
              }
            });
          }
        });

        setUniqueStudents(Array.from(studentsMap.values()));
      }
    } catch (error) {
      console.error('Analiz geçmişi yüklenemedi:', error);
      Alert.alert('Hata', 'Analiz geçmişi yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalysisHistory();
    setRefreshing(false);
  };

  const handleCreateAnalysis = async () => {
    Alert.alert(
      'Yeni Analiz',
      'Öğrencilerinizin anket sonuçları OpenAI ile analiz edilecek. Bu işlem 30-60 saniye sürebilir. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Analiz Et',
          onPress: async () => {
            try {
              setAnalyzing(true);
              const result = await analyzeStudentSurveys(currentUser?.id);

              if (result.success) {
                // Sade başarı mesajı göster (sayı bilgisi olmadan)
                Alert.alert('Başarılı', 'Analizler başarıyla tamamlandı.');
                await loadAnalysisHistory();
              }
            } catch (error) {
              // Hata yönetimi service katmanında yapılıyor (alert gösteriliyor)
              // Sadece beklenmeyen hatalar için log tutuyoruz
              if (!isAppError(error)) {
                console.error('Analiz hatası (beklenmeyen):', error);
              }
              // Service katmanında alert gösterildi, burada sadece state'i güncelle
            } finally {
              setAnalyzing(false);
            }
          },
        },
      ]
    );
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setViewMode('surveys');
  };

  const handleSelectSurvey = (analysis, studentData) => {
    setSelectedSurveyAnalysis({
      analysis: analysis,
      studentData: studentData
    });
    setViewMode('analysis');
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setSelectedSurveyAnalysis(null);
    setViewMode('students');
  };

  const handleBackToSurveys = () => {
    setSelectedSurveyAnalysis(null);
    setViewMode('surveys');
  };

  // Genel sınıf değerlendirmesini ekranda göstermek için metne çevir
  const formatGenelDegerlendirme = (genelDegerlendirme) => {
    if (!genelDegerlendirme) return '';

    // Eski analizlerde düz string olabilir
    if (typeof genelDegerlendirme === 'string') {
      return genelDegerlendirme;
    }

    // Yeni yapıda nesne bekleniyor
    if (typeof genelDegerlendirme === 'object') {
      // Yeni format alanları (backend'deki güncel prompt'tan)
      const {
        durum_ozeti,
        baskin_risk_alanlari,
        kritik_grup_degerlendirmesi,
        koruyucu_ve_guclu_yonler,
        onerilen_mudahaleler,
        yorum_siniri,
        // Eski format alanları (geriye dönük uyumluluk)
        sinif_ozeti,
        yaygin_tema_ve_riskler,
        sinifin_guclu_yonleri,
        onerilen_mudahale_ve_calismalar,
      } = genelDegerlendirme || {};

      // Önce yeni formatı dene, yoksa eski formatı kullan
      const sections = [];

      // Durum özeti
      if (durum_ozeti) {
        sections.push(`📊 Durum Özeti:\n${durum_ozeti}`);
      } else if (sinif_ozeti) {
        sections.push(`📊 Sınıf Özeti:\n${sinif_ozeti}`);
      }

      // Risk alanları
      if (baskin_risk_alanlari) {
        sections.push(`⚠️ Baskın Risk Alanları:\n${baskin_risk_alanlari}`);
      } else if (yaygin_tema_ve_riskler) {
        sections.push(`⚠️ Yaygın Tema ve Riskler:\n${yaygin_tema_ve_riskler}`);
      }

      // Kritik grup değerlendirmesi (yeni format)
      if (kritik_grup_degerlendirmesi) {
        sections.push(`🔴 Kritik Grup Değerlendirmesi:\n${kritik_grup_degerlendirmesi}`);
      }

      // Güçlü yönler
      if (koruyucu_ve_guclu_yonler) {
        sections.push(`💪 Koruyucu ve Güçlü Yönler:\n${koruyucu_ve_guclu_yonler}`);
      } else if (sinifin_guclu_yonleri) {
        sections.push(`💪 Sınıfın Güçlü Yönleri:\n${sinifin_guclu_yonleri}`);
      }

      // Önerilen müdahaleler
      if (onerilen_mudahaleler) {
        sections.push(`📝 Önerilen Müdahaleler:\n${onerilen_mudahaleler}`);
      } else if (onerilen_mudahale_ve_calismalar) {
        sections.push(`📝 Önerilen Müdahale ve Çalışmalar:\n${onerilen_mudahale_ve_calismalar}`);
      }

      // Yorum sınırı (yeni format)
      if (yorum_siniri) {
        sections.push(`ℹ️ Yorum Sınırı:\n${yorum_siniri}`);
      }

      return sections.join('\n\n');
    }

    // Beklenmedik bir tipse yine de string'e çevir
    try {
      return JSON.stringify(genelDegerlendirme, null, 2);
    } catch {
      return String(genelDegerlendirme);
    }
  };

  // Anket analiz metnini oluştur
  // riskScore: risk değerlendirmesi için kullanılan skor (tercihen fuzzySkor, yoksa puan)
  const getAnketAnalizMetni = (anketPuan, riskScore, ogrenciAdi) => {
    const anketAdi = anketPuan.anketBaslik || 'Anket';

    // Tüm anketlerde aynı mantık: skor arttıkça risk artsın
    if (riskScore < 40) {
      return `${ogrenciAdi}, ${anketAdi} sonuçlarına göre düşük bir puan elde etmiştir. Bu durum, öğrencinin bu anket kapsamındaki alanlarda olumlu bir durum sergilediğini göstermektedir. Düşük puan, öğrencinin bu konularda daha az sorun yaşadığını ve daha iyi bir durumda olduğunu işaret etmektedir.`;
    } else if (riskScore >= 40 && riskScore <= 60) {
      return `${ogrenciAdi}, ${anketAdi} sonuçlarına göre orta düzeyde bir puan elde etmiştir. Bu sonuç, öğrencinin bu alanda dikkat edilmesi gereken bazı noktalar olduğunu göstermektedir. Orta düzeydeki performans, öğrencinin bu konularda destek ve rehberlik alabileceğini düşündürmektedir.`;
    } else {
      return `${ogrenciAdi}, ${anketAdi} sonuçlarına göre yüksek bir puan elde etmiştir. Bu durum, öğrencinin bu anket kapsamındaki alanlarda dikkat edilmesi ve desteklenmesi gereken durumlar olduğunu göstermektedir. Yüksek puan, öğrencinin bu konularda ek rehberlik ve müdahaleye ihtiyaç duyduğunu işaret etmektedir.`;
    }
  };

  const renderHeader = () => (
    <LinearGradient colors={['#49b66f', '#1db4e2']} style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Anket Analizi</Text>
          <Text style={styles.headerSubtitle}>AI Destekli Raporlama</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderAnalysisButton = () => {
    // Öğrenci seçildiğinde butonu gizle
    if (viewMode !== 'students') {
      return null;
    }

    return (
      <View style={styles.actionContainer}>
        <Animated.View
          style={[
            styles.analyzeButton,
            analyzing && {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleCreateAnalysis}
            disabled={analyzing}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={gradientColors}
              style={styles.analyzeButtonGradient}
            >
              <View style={styles.analyzeButtonContent}>
                {analyzing ? (
                  <>
                    <ActivityIndicator color="#fff" size="small" style={{ marginRight: 10 }} />
                    <Text style={styles.analyzeButtonText}>Analiz Yapılıyor...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="analytics" size={24} color="#fff" style={{ marginRight: 10 }} />
                    <Text style={styles.analyzeButtonText}>Yeni Analiz Oluştur</Text>
                  </>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  // Öğrenci listesi ekranı
  const renderStudentsList = () => {
    // En son analiz sonucundan genel değerlendirmeyi al
    const latestAnalysis = analysisHistory.length > 0 ? analysisHistory[0] : null;
    const genelDegerlendirmeRaw = latestAnalysis?.analizSonucu?.genel_degerlendirme;
    const genelDegerlendirmeText = formatGenelDegerlendirme(genelDegerlendirmeRaw);

    return (
      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#49b66f" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        ) : uniqueStudents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Henüz öğrenci analizi yok</Text>
            <Text style={styles.emptySubtext}>
              Yukarıdaki butona tıklayarak ilk analizinizi oluşturun
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#49b66f" />
            }
          >
            {/* Genel Sınıf Değerlendirmesi - Accordion */}
            {genelDegerlendirmeText && (
              <View style={styles.generalEvaluationCard}>
                <TouchableOpacity
                  style={styles.generalEvaluationHeader}
                  onPress={() => setIsGeneralEvaluationExpanded(!isGeneralEvaluationExpanded)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.cardHeader, { marginBottom: 0 }]}>
                    <Ionicons name="analytics" size={24} color="#49b66f" />
                    <Text style={styles.cardTitle}>Genel Sınıf Değerlendirmesi</Text>
                  </View>
                  <Ionicons
                    name={isGeneralEvaluationExpanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color="#49b66f"
                  />
                </TouchableOpacity>
                {isGeneralEvaluationExpanded && (
                  <View style={styles.generalEvaluationContent}>
                    <Text style={styles.evaluationText}>{genelDegerlendirmeText}</Text>
                    <View style={styles.evaluationFooter}>
                      <Ionicons name="calendar-outline" size={14} color="#999" />
                      <Text style={styles.evaluationDate}>
                        {new Date(latestAnalysis.tarih).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            <Text style={styles.sectionTitle}>Öğrenciler</Text>
            {uniqueStudents.map((student) => {
              // Risk seviyesine göre renk belirle
              let riskColor = '#BDBDBD'; // Varsayılan: gri (bilinmiyor)
              if (student.riskLevel === 'low') {
                riskColor = '#4CAF50'; // Yeşil - düşük risk
              } else if (student.riskLevel === 'medium') {
                riskColor = '#FF8F00'; // Turuncu - orta risk
              } else if (student.riskLevel === 'high') {
                riskColor = '#F44336'; // Kırmızı - yüksek risk
              }

              return (
                <TouchableOpacity
                  key={student.ogrenciID}
                  style={styles.studentCard}
                  onPress={() => handleSelectStudent(student)}
                >
                  <View style={styles.studentCardHeader}>
                    <View style={styles.studentAvatar}>
                      <Text style={styles.studentAvatarText}>
                        {student.ad?.charAt(0)}{student.soyad?.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>
                        {student.ad} {student.soyad}
                      </Text>
                      <View style={styles.studentMetaRow}>
                        <View style={[styles.riskDot, { backgroundColor: riskColor }]} />
                        <Ionicons name="document-text" size={14} color="#49b66f" />
                        <Text style={styles.studentMetaText}>
                          {student.analizSayisi} analiz mevcut
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  // Anket seçim ekranı (öğrenci seçildikten sonra)
  const renderSurveySelection = () => {
    // Seçili öğrencinin tüm analizlerini bul
    const studentAnalyses = analysisHistory
      .map(analysis => {
        const studentData = analysis.analizSonucu?.ogrenciler?.find(
          s => s.ogrenciID === selectedStudent?.ogrenciID
        );
        if (studentData) {
          return {
            analysisId: analysis.id,
            tarih: analysis.tarih,
            anketSayisi: analysis.anketSayisi,
            kullanilanAnketler: analysis.kullanilanAnketler || [],
            ogrenciAnketPuaniDetaylari: analysis.ogrenciAnketPuaniDetaylari || {},
            studentData: studentData,
            genelDegerlendirme: analysis.analizSonucu?.genel_degerlendirme
          };
        }
        return null;
      })
      .filter(a => a !== null);

    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={handleBackToStudents} style={styles.backToListButton}>
            <Ionicons name="arrow-back" size={20} color="#49b66f" />
            <Text style={styles.backToListText}>Öğrencilere Dön</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Öğrenci Bilgisi */}
          <View style={styles.studentHeaderCard}>
            <View style={styles.studentAvatarLarge}>
              <Text style={styles.studentAvatarLargeText}>
                {selectedStudent?.ad?.charAt(0)}{selectedStudent?.soyad?.charAt(0)}
              </Text>
            </View>
            <Text style={styles.studentDetailName}>
              {selectedStudent?.ad} {selectedStudent?.soyad}
            </Text>
            <Text style={styles.studentSubtext}>Anket seçin ve detaylı analizi görüntüleyin</Text>
          </View>

          {/* Anket Listesi */}
          <View style={styles.surveysSection}>
            <Text style={styles.sectionTitle}>Anket Analizleri</Text>
            {studentAnalyses.map((analysisItem, index) => {
              // Bu analiz için öğrencinin anket bazlı puanlarını al
              const ogrenciId = selectedStudent?.ogrenciID?.toString();
              const anketPuaniDetaylari = analysisItem.ogrenciAnketPuaniDetaylari?.[ogrenciId] || [];

              return (
                <TouchableOpacity
                  key={`${analysisItem.analysisId}-${index}`}
                  style={styles.surveyCard}
                  onPress={() => handleSelectSurvey(analysisItem, analysisItem.studentData)}
                >
                  <View style={styles.surveyCardContent}>
                    <View style={styles.surveyIconContainer}>
                      <Ionicons name="clipboard-outline" size={28} color="#49b66f" />
                    </View>
                    <View style={styles.surveyInfo}>
                      <Text style={styles.surveyDate}>
                        {new Date(analysisItem.tarih).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                      {analysisItem.kullanilanAnketler && analysisItem.kullanilanAnketler.length > 0 && (
                        <View style={styles.surveyAnketlerContainer}>
                          <Ionicons name="document-text-outline" size={12} color="#999" />
                          <Text style={styles.surveyAnketlerText} numberOfLines={1}>
                            {analysisItem.kullanilanAnketler.map(a => a.baslik).join(', ')}
                          </Text>
                        </View>
                      )}
                      {anketPuaniDetaylari.length > 0 && (
                        <View style={styles.surveyAnketPuaniContainer}>
                          {anketPuaniDetaylari.map((anketPuan, idx) => {
                            // Puan ve risk skoru
                            const minPuan = anketPuan.soruSayisi || 0;
                            const maxPuan = (anketPuan.soruSayisi || 0) * (anketPuan.secenekSayisi || 0);
                            const puan = anketPuan.puan || 0;
                            const riskScore = typeof anketPuan.fuzzySkor === 'number' ? anketPuan.fuzzySkor : puan;

                            // Renk belirleme (tüm anketlerde aynı mantık: risk skoru arttıkça risk artsın)
                            let puanRengi = '#4CAF50'; // Yeşil (düşük risk)
                            let badgeRengi = '#E8F5E9';

                            if (riskScore >= 40 && riskScore <= 60) {
                              puanRengi = '#FF8F00'; // Turuncu (orta risk)
                              badgeRengi = '#FFF8E1';
                            } else if (riskScore > 60) {
                              puanRengi = '#F44336'; // Kırmızı (yüksek risk)
                              badgeRengi = '#FFEBEE';
                            }

                            return (
                              <View key={anketPuan.anketId || idx} style={[styles.surveyAnketPuanBadge, { backgroundColor: badgeRengi }]}>
                                <Ionicons name="trophy" size={12} color={puanRengi} />
                                <Text style={[styles.surveyAnketPuanText, { color: puanRengi }]}>
                                  {anketPuan.anketBaslik}: {anketPuan.puan}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      )}

                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#ccc" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Seçilen anketin analiz detayı
  const renderAnalysisDetail = () => {
    const studentData = selectedSurveyAnalysis?.studentData;
    const analysis = selectedSurveyAnalysis?.analysis;

    // Öğrencinin anket bazlı puanlarını al
    const ogrenciId = studentData?.ogrenciID?.toString();
    const anketPuaniDetaylari = analysis?.ogrenciAnketPuaniDetaylari?.[ogrenciId] || [];

    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={handleBackToSurveys} style={styles.backToListButton}>
            <Ionicons name="arrow-back" size={20} color="#49b66f" />
            <Text style={styles.backToListText}>Anketlere Dön</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Öğrenci ve Anket Bilgisi */}
          <View style={styles.analysisHeaderCard}>
            <View style={styles.analysisHeaderTop}>
              <View style={styles.studentAvatarMedium}>
                <Text style={styles.studentAvatarMediumText}>
                  {studentData?.ad?.charAt(0)}{studentData?.soyad?.charAt(0)}
                </Text>
              </View>
              <View style={styles.analysisHeaderInfo}>
                <Text style={styles.analysisHeaderName}>
                  {studentData?.ad} {studentData?.soyad}
                </Text>
                <Text style={styles.analysisHeaderDate}>
                  {new Date(analysis?.tarih).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Kullanılan Anketler ve Puanlar */}
          {anketPuaniDetaylari.length > 0 && (
            <View style={styles.anketPuaniCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="clipboard" size={24} color="#49b66f" />
                <Text style={styles.cardTitle}>Anket Puanları</Text>
              </View>
              {anketPuaniDetaylari.map((anketPuan, index) => {
                // Puan ve risk skoru
                const minPuan = anketPuan.soruSayisi || 0;
                const maxPuan = (anketPuan.soruSayisi || 0) * (anketPuan.secenekSayisi || 0);
                const puan = anketPuan.puan || 0;
                const riskScore = typeof anketPuan.fuzzySkor === 'number' ? anketPuan.fuzzySkor : puan;

                // Renk belirleme (tüm anketlerde aynı mantık: risk skoru arttıkça risk artsın)
                let puanRengi = '#4CAF50'; // Yeşil (düşük risk)
                let badgeRengi = '#E8F5E9';

                if (riskScore >= 40 && riskScore <= 60) {
                  puanRengi = '#FF8F00'; // Turuncu (orta risk)
                  badgeRengi = '#FFF8E1';
                } else if (riskScore > 60) {
                  puanRengi = '#F44336'; // Kırmızı (yüksek risk)
                  badgeRengi = '#FFEBEE';
                }

                // Anket analiz metnini al (backend'den gelen analiz varsa onu kullan, yoksa dinamik oluştur)
                const ogrenciAdi = studentData?.ad || 'Öğrenci';
                const anketAnalizMetni = anketPuan.analiz || getAnketAnalizMetni(anketPuan, riskScore, ogrenciAdi);
                const anketKey = anketPuan.anketId || `anket-${index}`;
                const isExpanded = expandedAnketler[anketKey] || false;

                return (
                  <View key={anketKey} style={styles.anketPuanItemContainer}>
                    <TouchableOpacity
                      style={styles.anketPuanItem}
                      onPress={() => {
                        setExpandedAnketler(prev => ({
                          ...prev,
                          [anketKey]: !prev[anketKey]
                        }));
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.anketPuanHeader}>
                        <Ionicons name="document-text-outline" size={18} color="#49b66f" />
                        <Text style={styles.anketPuanBaslik}>{anketPuan.anketBaslik}</Text>
                      </View>
                      <View style={styles.anketPuanRightSection}>
                        <View style={[styles.anketPuanBadge, { backgroundColor: badgeRengi }]}>
                          <Ionicons name="trophy" size={16} color={puanRengi} />
                          <Text style={[styles.anketPuanText, { color: puanRengi }]}>
                            {anketPuan.puan} puan
                          </Text>
                        </View>
                        <Ionicons
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={20}
                          color="#49b66f"
                          style={styles.anketPuanChevron}
                        />
                      </View>
                    </TouchableOpacity>
                    {isExpanded && (
                      <View style={styles.anketAnalizContent}>
                        <Text style={styles.anketAnalizText}>{anketAnalizMetni}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Tüm Anketlerin Analizi */}
          <View style={styles.analysisContentCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={24} color="#49b66f" />
              <Text style={styles.cardTitle}>Tüm Anketlerin Analizi</Text>
            </View>
            <Text style={styles.analysisText}>{studentData?.analiz}</Text>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      {renderHeader()}

      <SafeAreaView style={styles.safeArea}>
        <View style={[
          styles.content,
          viewMode !== 'students' && styles.contentWithoutButton
        ]}>
          {renderAnalysisButton()}

          {viewMode === 'students' && renderStudentsList()}
          {viewMode === 'surveys' && renderSurveySelection()}
          {viewMode === 'analysis' && renderAnalysisDetail()}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,

  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    marginTop: -60,
  },
  contentWithoutButton: {
    marginTop: -20,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
  },
  analyzeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#49b66f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
  },
  analyzeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    position: 'relative',
  },
  analyzeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  analysisCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  analysisCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analysisIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  analysisCardInfo: {
    flex: 1,
  },
  analysisCardDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  analysisCardStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  statBadgeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  detailContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -20,
  },
  detailHeader: {
    paddingVertical: 16,
  },
  backToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backToListText: {
    fontSize: 16,
    color: '#49b66f',
    fontWeight: '600',
    marginLeft: 8,
  },
  generalEvaluationCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  generalEvaluationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  generalEvaluationContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
  },
  evaluationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  evaluationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  evaluationDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 6,
  },
  studentsSection: {
    marginBottom: 20,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  studentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#49b66f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  studentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  riskDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  studentMetaText: {
    fontSize: 13,
    color: '#49b66f',
    marginLeft: 4,
  },
  studentHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  studentAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#49b66f',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentAvatarLargeText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  studentAvatarMedium: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#49b66f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  studentAvatarMediumText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  studentDetailName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  studentSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  scoreDetailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 12,
  },
  scoreDetailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#49b66f',
    marginLeft: 6,
  },
  surveysSection: {
    marginBottom: 20,
  },
  surveyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  surveyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surveyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  surveyInfo: {
    flex: 1,
  },
  surveyDate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  surveyScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  surveyScoreText: {
    fontSize: 13,
    color: '#49b66f',
    marginLeft: 6,
    fontWeight: '500',
  },
  surveyAnketlerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  surveyAnketlerText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 6,
    flex: 1,
  },
  surveyAnketPuaniContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 6,
  },
  surveyAnketPuanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  surveyAnketPuanText: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '600',
  },
  analysisHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  analysisHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  analysisHeaderInfo: {
    flex: 1,
  },
  analysisHeaderName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  analysisHeaderDate: {
    fontSize: 14,
    color: '#666',
  },
  analysisAnketlerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    marginBottom: 12,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  analysisAnketlerList: {
    flex: 1,
    marginLeft: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  analysisAnketlerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  analysisAnketlerText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  analysisContentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  analysisText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  anketPuaniCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  anketPuanItemContainer: {
    marginBottom: 8,
  },
  anketPuanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9ff',
    borderRadius: 12,
  },
  anketPuanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  anketPuanBaslik: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  anketPuanRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  anketPuanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  anketPuanText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '700',
  },
  anketPuanChevron: {
    marginLeft: 4,
  },
  anketAnalizContent: {
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: '#f9f9ff',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  anketAnalizText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default SurveyAnalysis;
