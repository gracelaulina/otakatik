import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import T from './T';
import Mascot from './Mascot';
import Button3D from './Button3D';
import { colors, shadow } from '../theme';
import { feedback } from '../services/feedback';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const GUIDE_STEPS = [
  {
    key: 'stats',
    badge: '1 / 5 • STATUS BELAJAR',
    title: 'Nyawa & Poin XP',
    body: 'Kamu punya 3 Nyawa di setiap kuis. Setiap jawaban benar memberi +10 XP untuk menaikkan level dan peringkatmu!',
  },
  {
    key: 'resume',
    badge: '2 / 5 • AKSES CEPAT',
    title: 'Lanjutkan Belajar',
    body: 'Klik kartu kuning ini untuk langsung kembali ke Materi atau Kuis terakhir yang sedang kamu pelajari.',
  },
  {
    key: 'main',
    badge: '3 / 5 • MENU UTAMA',
    title: 'Ayo Otak-Atik Kodemu!',
    body: 'Tekan tombol Play untuk memilih Stage (Variabel, Tipe Data, Percabangan) beserta tingkatannya: Mudah, Menengah, atau Susah.',
  },
  {
    key: 'actions',
    badge: '4 / 5 • EVALUASI MANDIRI',
    title: 'Latihan & Riwayat',
    body: 'Gunakan Latihan untuk mengulang konsep yang masih lemah tanpa mengurangi nyawa, dan cek semua skormu di Riwayat.',
  },
  {
    key: 'tabs',
    badge: '5 / 5 • NAVIGASI BAWAH',
    title: 'Progres, Peringkat & Lencana',
    body: 'Pantau grafik perkembanganmu di Progres, adu XP di Peringkat kelas, dan kumpulkan ke-6 Lencana prestasi!',
  },
];

export default function GuideModal({ visible, targetRect, stepIdx, onNext, onSkip }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, stepIdx]);

  if (!visible) return null;

  const step = GUIDE_STEPS[stepIdx] || GUIDE_STEPS[0];
  const isLast = stepIdx === GUIDE_STEPS.length - 1;
  const pad = 8;

  // Fallback apabila ukuran elemen sedang dihitung setelah scroll
  const rect = targetRect || {
    x: 24,
    y: step.key === 'tabs' ? SCREEN_H - 105 : 120,
    w: SCREEN_W - 48,
    h: 90,
  };

  const holeLeft = Math.max(8, rect.x - pad);
  const holeTop = Math.max(8, rect.y - pad);
  const holeWidth = Math.min(SCREEN_W - holeLeft - 8, rect.w + pad * 2);
  const holeHeight = rect.h + pad * 2;
  const holeRight = holeLeft + holeWidth;
  const holeBottom = holeTop + holeHeight;

  // Tentukan apakah kartu penjelasan muncul di bawah atau di atas sorotan
  const showCardAbove = holeBottom > SCREEN_H * 0.56;
  const borderScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={{ flex: 1 }}>
        {/* 4 Panel Gelap mengelilingi area yang di-highlight agar bagian tengah tetap bening & terang */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: holeTop,
            backgroundColor: 'rgba(10, 9, 66, 0.74)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: holeBottom,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 9, 66, 0.74)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: holeTop,
            left: 0,
            width: holeLeft,
            height: holeHeight,
            backgroundColor: 'rgba(10, 9, 66, 0.74)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: holeTop,
            left: holeRight,
            right: 0,
            height: holeHeight,
            backgroundColor: 'rgba(10, 9, 66, 0.74)',
          }}
        />

        {/* Outline Menyala Berdenyut pada Area yang Disorot */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: Animated.subtract(holeLeft, borderScale),
            top: Animated.subtract(holeTop, borderScale),
            width: Animated.add(holeWidth, Animated.multiply(borderScale, 2)),
            height: Animated.add(holeHeight, Animated.multiply(borderScale, 2)),
            borderRadius: 30,
            borderWidth: 3.5,
            borderColor: '#FFC247',
          }}
        />

        {/* Kartu Penjelasan Maskot Atik (Tooltip) */}
        <View
          style={[
            {
              position: 'absolute',
              left: 20,
              right: 20,
              ...(showCardAbove
                ? { bottom: Math.max(24, SCREEN_H - holeTop + 16) }
                : { top: Math.min(SCREEN_H - 250, holeBottom + 16) }),
              backgroundColor: '#fff',
              borderRadius: 30,
              padding: 20,
              borderWidth: 2,
              borderColor: colors.sky,
            },
            shadow,
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Mascot size={50} style={{ marginRight: 12, marginTop: -4 }} />
            <View style={{ flex: 1 }}>
              <T weight="bold" style={{ fontSize: 12, color: colors.blue }}>
                {step.badge}
              </T>
              <T weight="bold" style={{ fontSize: 21, color: colors.navy, marginTop: 2 }}>
                {step.title}
              </T>
            </View>
          </View>

          <T weight="semi" style={{ fontSize: 15, lineHeight: 22, color: colors.slate, marginBottom: 16 }}>
            {step.body}
          </T>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Pressable
              onPress={() => {
                feedback.tap();
                onSkip();
              }}
              style={{ paddingVertical: 8, paddingRight: 12 }}
            >
              <T weight="bold" style={{ fontSize: 15, color: colors.slate }}>
                Lewati
              </T>
            </Pressable>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              {GUIDE_STEPS.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === stepIdx ? 18 : 7,
                    height: 7,
                    borderRadius: 4,
                    backgroundColor: i === stepIdx ? colors.blue : colors.sky,
                  }}
                />
              ))}
            </View>

            <Button3D
              title={isLast ? 'Selesai!' : 'Lanjut'}
              variant="blue"
              radius={18}
              depth={4}
              fontSize={16}
              onPress={() => {
                feedback.tap();
                onNext();
              }}
              faceStyle={{ paddingVertical: 10, paddingHorizontal: 20 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
