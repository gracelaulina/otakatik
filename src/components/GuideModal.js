import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, Pressable, View } from 'react-native';
import T from './T';
import Mascot from './Mascot';
import Button3D from './Button3D';
import { colors, shadow } from '../theme';
import { feedback } from '../services/feedback';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const GUIDE_STEPS = [
  {
    key: 'stats',
    radius: 26,
    pad: 4,
    badge: '1 / 5 • STATUS BELAJAR',
    title: 'Nyawa & Poin XP',
    body: 'Kamu punya 3 Nyawa di setiap kuis. Setiap jawaban benar memberi +10 XP untuk menaikkan level dan peringkatmu!',
  },
  {
    key: 'resume',
    radius: 32,
    pad: 4,
    badge: '2 / 5 • AKSES CEPAT',
    title: 'Lanjutkan Belajar',
    body: 'Klik kartu kuning ini untuk langsung kembali ke Materi atau Kuis terakhir yang sedang kamu pelajari.',
  },
  {
    key: 'main',
    radius: 40,
    pad: 4,
    badge: '3 / 5 • MENU UTAMA',
    title: 'Ayo Otak-Atik Kodemu!',
    body: 'Tekan tombol Play untuk memilih Stage (Variabel, Tipe Data, Percabangan) beserta tingkatannya: Mudah, Menengah, atau Susah.',
  },
  {
    key: 'actions',
    radius: 32,
    pad: 4,
    badge: '4 / 5 • EVALUASI MANDIRI',
    title: 'Latihan & Riwayat',
    body: 'Gunakan Latihan untuk mengulang konsep yang masih lemah tanpa mengurangi nyawa, dan cek semua skormu di Riwayat.',
  },
  {
    key: 'tabs',
    radius: 36,
    pad: 4,
    badge: '5 / 5 • NAVIGASI BAWAH',
    title: 'Progres, Peringkat & Lencana',
    body: 'Pantau grafik perkembanganmu di Progres, adu XP di Peringkat kelas, dan kumpulkan ke-6 Lencana prestasi!',
  },
];

const HUGE = Math.max(SCREEN_W, SCREEN_H) * 2;

export default function GuideModal({ visible, targetRect, stepIdx, onNext, onSkip }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 750, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible, stepIdx]);

  if (!visible || !targetRect) return null;

  const step = GUIDE_STEPS[stepIdx] || GUIDE_STEPS[0];
  const isLast = stepIdx === GUIDE_STEPS.length - 1;
  const pad = step.pad ?? 4;
  const radius = step.radius ?? 30;

  const holeLeft = Math.max(4, targetRect.x - pad);
  const holeTop = Math.max(4, targetRect.y - pad);
  const holeWidth = Math.min(SCREEN_W - holeLeft - 4, targetRect.w + pad * 2);
  const holeHeight = targetRect.h + pad * 2;
  const holeBottom = holeTop + holeHeight;

  // Tentukan posisi kartu penjelasan: di bawah elemen bila muat, atau di atas elemen
  const spaceBelow = SCREEN_H - holeBottom;
  const showCardAbove = spaceBelow < 245;

  const glowSpread = pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 5] });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={{ flex: 1 }}>
        {/* 1 Komponen Masking Tunggal dengan border raksasa sehingga sudut lubang 100% melengkung mulus tanpa celah */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: holeLeft - HUGE,
            top: holeTop - HUGE,
            width: holeWidth + HUGE * 2,
            height: holeHeight + HUGE * 2,
            borderRadius: radius + HUGE,
            borderWidth: HUGE,
            borderColor: 'rgba(10, 9, 66, 0.76)',
          }}
        />

        {/* Ring Outline Kuning Menyala yang Persis Mengikuti Lengkungan Elemen */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: Animated.subtract(holeLeft, glowSpread),
            top: Animated.subtract(holeTop, glowSpread),
            width: Animated.add(holeWidth, Animated.multiply(glowSpread, 2)),
            height: Animated.add(holeHeight, Animated.multiply(glowSpread, 2)),
            borderRadius: Animated.add(radius, glowSpread),
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
                ? { bottom: Math.max(20, SCREEN_H - holeTop + 14) }
                : { top: Math.min(SCREEN_H - 235, holeBottom + 14) }),
              backgroundColor: '#fff',
              borderRadius: 30,
              padding: 20,
              borderWidth: 2,
              borderColor: colors.sky,
            },
            shadow,
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Mascot size={48} style={{ marginRight: 12, marginTop: -4 }} />
            <View style={{ flex: 1 }}>
              <T weight="bold" style={{ fontSize: 12, color: colors.blue }}>
                {step.badge}
              </T>
              <T weight="bold" style={{ fontSize: 20, color: colors.navy, marginTop: 2 }}>
                {step.title}
              </T>
            </View>
          </View>

          <T weight="semi" style={{ fontSize: 15, lineHeight: 22, color: colors.slate, marginBottom: 14 }}>
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
              fontSize={15}
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
