import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import T from './T';
import { colors, fonts, shadow } from '../theme';
import { feedback } from '../services/feedback';

const TOKEN = /("[^"]*"|\b\d+(?:\.\d+)?\b|\b(?:if|else|print|true|false)\b)/;

const tint = (tok) => {
  if (tok.startsWith('"')) return '#7EE0B0';
  if (/^\d/.test(tok)) return '#FFC247';
  return '#8EC8FF';
};

const TYPE_STYLE = {
  Integer: { bg: '#DCEEFF', text: colors.blueDark },
  String: { bg: '#DFF7EA', text: colors.greenText },
  Boolean: { bg: '#FDE0A5', text: '#946200' },
};

function MemoryBoxCard({ box }) {
  const pop = useRef(new Animated.Value(box.updated ? 0.88 : 1)).current;

  useEffect(() => {
    if (box.updated) {
      pop.setValue(0.88);
      Animated.spring(pop, { toValue: 1, bounciness: 12, speed: 18, useNativeDriver: true }).start();
    }
  }, [box.value, box.updated]);

  const badge = TYPE_STYLE[box.type] || { bg: colors.sky, text: colors.navy };

  return (
    <Animated.View
      style={{
        transform: [{ scale: pop }],
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 12,
        minWidth: 112,
        borderWidth: 2.5,
        borderColor: box.updated ? colors.blue : '#D5E5F7',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <View style={{ backgroundColor: colors.navy, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: '#fff', fontWeight: '700' }}>{box.name}</Text>
        </View>
        {box.type ? (
          <View style={{ backgroundColor: badge.bg, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 }}>
            <T weight="bold" style={{ fontSize: 11, color: badge.text }}>{box.type}</T>
          </View>
        ) : null}
      </View>

      <View
        style={{
          backgroundColor: box.updated ? '#EEF6FF' : colors.bg,
          borderRadius: 12,
          paddingVertical: 10,
          paddingHorizontal: 10,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {box.prevValue ? (
          <Text
            style={{
              fontFamily: fonts.mono,
              fontSize: 13,
              color: colors.red,
              textDecorationLine: 'line-through',
              marginBottom: 2,
            }}
          >
            {box.prevValue}
          </Text>
        ) : null}
        <Text style={{ fontFamily: fonts.mono, fontSize: 19, color: colors.navy, fontWeight: '700' }}>
          {box.value}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function MemorySim({ code, sim }) {
  const [stepIdx, setStepIdx] = useState(-1);
  const lines = code.split('\n');
  const steps = sim ? sim.steps : [];
  const currentStep = stepIdx >= 0 && stepIdx < steps.length ? steps[stepIdx] : null;

  useEffect(() => {
    setStepIdx(-1);
  }, [code]);

  const handleNextStep = () => {
    feedback.tap();
    if (stepIdx < steps.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      setStepIdx(0);
    }
  };

  const handleReset = () => {
    feedback.tap();
    setStepIdx(-1);
  };

  return (
    <View>
      {/* Blok Kode dengan Sorotan Baris Aktif */}
      <View style={{ backgroundColor: colors.navy, borderRadius: 28, paddingHorizontal: 20, paddingVertical: 20 }}>
        {lines.map((line, i) => {
          const isActive = currentStep && currentStep.line === i;
          return (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isActive ? 'rgba(47, 142, 255, 0.28)' : 'transparent',
                borderRadius: 12,
                paddingHorizontal: 10,
                paddingVertical: 3,
                marginVertical: 1,
                borderLeftWidth: isActive ? 4 : 0,
                borderLeftColor: '#FFC247',
              }}
            >
              <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: '#6E7FB8', width: 22 }}>{i + 1}</Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 19, lineHeight: 30, color: '#fff', flex: 1 }}>
                {line === ''
                  ? ' '
                  : line.split(TOKEN).map((part, j) => (
                      <Text key={j} style={j % 2 === 1 ? { color: tint(part) } : null}>
                        {part}
                      </Text>
                    ))}
              </Text>
            </View>
          );
        })}

        {sim ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' }}>
            <Pressable
              onPress={handleNextStep}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.blue,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <Ionicons name={stepIdx < 0 ? 'play' : stepIdx < steps.length - 1 ? 'play-skip-forward' : 'refresh'} size={18} color="#fff" />
              <T weight="bold" style={{ color: '#fff', fontSize: 15, marginLeft: 8 }}>
                {stepIdx < 0
                  ? 'Simulasikan di Memori'
                  : stepIdx < steps.length - 1
                  ? `Langkah Berikutnya (${stepIdx + 1}/${steps.length})`
                  : 'Ulangi Simulasi'}
              </T>
            </Pressable>

            {stepIdx >= 0 ? (
              <Pressable onPress={handleReset} style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
                <T weight="semi" style={{ color: '#9DB6DC', fontSize: 14 }}>Reset</T>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* Panel Visualisasi Kotak Memori Komputer */}
      {sim && currentStep ? (
        <View
          style={[
            {
              backgroundColor: '#fff',
              borderRadius: 26,
              padding: 18,
              marginTop: 14,
              borderWidth: 2,
              borderColor: colors.sky,
            },
            shadow,
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="hardware-chip-outline" size={20} color={colors.blue} />
              <T weight="bold" style={{ fontSize: 16, marginLeft: 6, color: colors.navy }}>
                {sim.title || 'Kotak Memori Komputer'}
              </T>
            </View>
            <T weight="bold" style={{ fontSize: 13, color: colors.slate }}>
              Langkah {stepIdx + 1}/{steps.length}
            </T>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 6 }}>
            {currentStep.boxes.map((b, idx) => (
              <MemoryBoxCard key={`${b.name}-${idx}`} box={b} />
            ))}
          </View>

          {currentStep.output ? (
            <View style={{ backgroundColor: colors.navyDark, borderRadius: 14, padding: 12, marginTop: 8 }}>
              <T weight="bold" style={{ fontSize: 12, color: '#8EC8FF', marginBottom: 4 }}>OUTPUT LAYAR:</T>
              <Text style={{ fontFamily: fonts.mono, fontSize: 16, color: '#7EE0B0' }}>{currentStep.output}</Text>
            </View>
          ) : null}

          <T weight="semi" style={{ fontSize: 15, color: colors.slate, marginTop: 10, lineHeight: 22 }}>
            {currentStep.desc}
          </T>
        </View>
      ) : null}
    </View>
  );
}
