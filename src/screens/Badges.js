import React, { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import T from '../components/T';
import Button3D from '../components/Button3D';
import PopIn from '../components/PopIn';
import FadeInUp from '../components/FadeInUp';
import { useGame, getBadges } from '../state/GameContext';
import { colors, shadow } from '../theme';
import { feedback } from '../services/feedback';

export default function Badges() {
  const { state } = useGame();
  const badges = getBadges(state);
  const open = badges.filter((b) => b.unlocked).length;
  const [selectedBadge, setSelectedBadge] = useState(null);

  return (
    <Screen padBottom={100}>
      <FadeInUp>
        <T weight="bold" style={{ fontSize: 40 }}>Lencana</T>
        <T weight="semi" style={{ color: colors.slate, fontSize: 18, marginTop: 6, marginBottom: 16 }}>
          {open} dari {badges.length} lencana terbuka.
        </T>
      </FadeInUp>
      <View style={{ backgroundColor: '#fff', borderRadius: 34, padding: 12, flexDirection: 'row', flexWrap: 'wrap' }}>
        {badges.map((b, i) => (
          <View key={b.id} style={{ width: '33.33%', padding: 8, alignItems: 'center' }}>
            <PopIn delay={120 + i * 90} style={{ width: '100%' }}>
              <Pressable
                onPress={() => {
                  feedback.tap();
                  setSelectedBadge(b);
                }}
              >
                <View style={{ width: '100%', aspectRatio: 1, borderRadius: 28, backgroundColor: b.color, opacity: b.unlocked ? 1 : 0.75, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={b.unlocked ? b.icon : 'lock-closed'} size={36} color={b.unlocked ? colors.navy : '#8A8FB5'} />
                </View>
              </Pressable>
            </PopIn>
            <T weight="bold" style={{ fontSize: 15, textAlign: 'center', marginTop: 8, color: b.unlocked ? colors.navy : '#8A8FB5' }}>{b.title}</T>
          </View>
        ))}
      </View>

      <Modal
        visible={!!selectedBadge}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBadge(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(10, 9, 66, 0.65)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          {selectedBadge && (
            <View
              style={[
                {
                  backgroundColor: '#fff',
                  borderRadius: 28,
                  padding: 22,
                  width: '100%',
                  maxWidth: 360,
                  alignItems: 'center',
                },
                shadow,
              ]}
            >
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 24,
                  backgroundColor: selectedBadge.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <Ionicons
                  name={selectedBadge.unlocked ? selectedBadge.icon : 'lock-closed'}
                  size={36}
                  color={colors.navy}
                />
              </View>
              <T weight="bold" style={{ fontSize: 22, textAlign: 'center' }}>
                {selectedBadge.title}
              </T>
              <T weight="semi" style={{ fontSize: 15, color: colors.slate, textAlign: 'center', marginTop: 6, marginBottom: 18 }}>
                {selectedBadge.unlocked ? `Terbuka! ${selectedBadge.desc}` : `Terkunci: ${selectedBadge.desc}`}
              </T>
              <Button3D
                title="Tutup"
                variant="blue"
                onPress={() => setSelectedBadge(null)}
                style={{ width: '100%' }}
              />
            </View>
          )}
        </View>
      </Modal>
    </Screen>
  );
}
