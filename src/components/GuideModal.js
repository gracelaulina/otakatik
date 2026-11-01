import React, { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import T from './T';
import Mascot from './Mascot';
import Button3D from './Button3D';
import { colors, shadow } from '../theme';
import { feedback } from '../services/feedback';

const SLIDES = [
  {
    badge: 'APA ITU OTAKATIK?',
    title: 'Belajar Logika Kode Jadi Seru!',
    body: 'OtakAtik adalah aplikasi pembelajaran interaktif untuk memahami dasar pemrograman: Variabel, Tipe Data, dan Percabangan bersama maskot Atik.',
    icon: 'code-slash',
    tint: colors.sky,
  },
  {
    badge: 'UNTUK APA APLIKASI INI?',
    title: 'Visual & Sesuai Kemampuanmu',
    body: 'Dirancang agar konsep abstrak di memori komputer terlihat nyata, serta melatih logika pemrograman dari tingkat Mudah, Menengah, hingga Susah.',
    icon: 'school',
    tint: colors.yellow,
  },
  {
    badge: 'FITUR UNGGULAN',
    title: 'Simulasi, Drag & Drop, Gamifikasi',
    body: '• Simulasi Kotak Memori interaktif di Materi\n• Kuis Adaptif & Drag-and-Drop merapikan kode\n• Sistem 3 Nyawa, XP, Level, Lencana & Peringkat',
    icon: 'trophy',
    tint: colors.mint,
  },
];

export default function GuideModal({ visible, onDone }) {
  const [idx, setIdx] = useState(0);
  if (!visible) return null;

  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  const next = () => {
    feedback.tap();
    if (isLast) {
      setIdx(0);
      onDone();
    } else {
      setIdx(idx + 1);
    }
  };

  const skip = () => {
    feedback.tap();
    setIdx(0);
    onDone();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={skip}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(10, 9, 66, 0.55)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 22,
        }}
      >
        <View
          style={[
            {
              width: '100%',
              backgroundColor: '#fff',
              borderRadius: 34,
              padding: 24,
              alignItems: 'center',
            },
            shadow,
          ]}
        >
          <View
            style={{
              backgroundColor: slide.tint,
              borderRadius: 28,
              width: '100%',
              paddingVertical: 20,
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Mascot size={96} />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 4,
                marginTop: 8,
              }}
            >
              <Ionicons name={slide.icon} size={15} color={colors.blue} />
              <T weight="bold" style={{ fontSize: 12, color: colors.navy, marginLeft: 6 }}>
                {slide.badge}
              </T>
            </View>
          </View>

          <T weight="bold" style={{ fontSize: 24, textAlign: 'center', marginBottom: 10 }}>
            {slide.title}
          </T>
          <T weight="semi" style={{ fontSize: 16, lineHeight: 24, color: colors.slate, textAlign: 'center', marginBottom: 20 }}>
            {slide.body}
          </T>

          {/* Indikator Titik Slide */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === idx ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: i === idx ? colors.blue : colors.sky,
                }}
              />
            ))}
          </View>

          <View style={{ alignSelf: 'stretch' }}>
            <Button3D title={isLast ? 'Mulai Belajar!' : 'Lanjut'} onPress={next} />
          </View>

          {!isLast ? (
            <Pressable onPress={skip} style={{ marginTop: 12, paddingVertical: 4 }}>
              <T weight="bold" style={{ fontSize: 15, color: colors.slate }}>
                Lewati Panduan
              </T>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
