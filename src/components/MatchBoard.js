import React from 'react';
import { Pressable, View } from 'react-native';
import T from './T';
import FadeInUp from './FadeInUp';
import PressableScale from './PressableScale';
import { colors, fonts, shadow } from '../theme';

function Chip({ label, active, placed, onPress }) {
  const body = (
    <View
      style={{
        backgroundColor: placed ? colors.sky : active ? '#FFF3D6' : colors.yellow,
        borderRadius: 20,
        paddingHorizontal: 22,
        paddingVertical: 12,
        borderBottomWidth: 5,
        borderBottomColor: placed ? '#8EC2F2' : colors.yellowDark,
        borderWidth: active ? 3 : 0,
        borderColor: colors.blue,
        transform: [{ translateY: active ? -3 : 0 }],
      }}
    >
      <T style={{ fontFamily: fonts.mono, fontSize: 21 }}>{label}</T>
    </View>
  );
  return onPress ? <PressableScale onPress={onPress} scaleTo={0.94}>{body}</PressableScale> : body;
}

export default function MatchBoard({ pieces, slots, placed, picked, slotOk, onPiece, onSlot }) {
  const used = Object.values(placed);
  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, minHeight: 66, marginBottom: 16 }}>
        {pieces.map((p, i) => (used.includes(i) ? null : <Chip key={i} label={p} active={picked === i} onPress={() => onPiece(i)} />))}
      </View>
      {slots.map((label, i) => {
        const pi = placed[i];
        const border = slotOk ? (slotOk[i] ? colors.green : colors.red) : '#9DB6DC';
        const fill = slotOk ? (slotOk[i] ? '#E6F8EE' : '#FFE7E7') : 'transparent';
        return (
          <FadeInUp key={i} delay={80 * i}>
            <Pressable
              onPress={() => onSlot(i)}
              style={[
                { backgroundColor: '#fff', borderRadius: 26, padding: 14, paddingLeft: 24, marginBottom: 14, flexDirection: 'row', alignItems: 'center' },
                shadow,
              ]}
            >
              <T weight="bold" style={{ fontSize: 20, width: 110 }}>{label}</T>
              <View
                style={{
                  flex: 1,
                  minHeight: 70,
                  borderRadius: 20,
                  borderWidth: 3,
                  borderStyle: 'dashed',
                  borderColor: border,
                  backgroundColor: fill,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {pi !== undefined ? <Chip label={pieces[pi]} placed /> : null}
              </View>
            </Pressable>
          </FadeInUp>
        );
      })}
      <T style={{ textAlign: 'center', color: colors.slate, fontSize: 16, marginTop: 4 }}>
        Ketuk potongan, lalu ketuk kotak untuk menaruh. Ketuk kotak terisi untuk melepas.
      </T>
    </View>
  );
}
