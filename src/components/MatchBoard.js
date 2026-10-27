import React, { useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, View } from 'react-native';
import T from './T';
import FadeInUp from './FadeInUp';
import { colors, fonts, shadow } from '../theme';
import { feedback } from '../services/feedback';

function Chip({ label, active, placed, dragging, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          backgroundColor: placed ? colors.sky : active || dragging ? '#FFF3D6' : colors.yellow,
          borderRadius: 20,
          paddingHorizontal: 20,
          paddingVertical: 11,
          borderBottomWidth: 5,
          borderBottomColor: placed ? '#8EC2F2' : colors.yellowDark,
          borderWidth: active || dragging ? 3 : 0,
          borderColor: colors.blue,
          transform: [{ translateY: active || dragging ? -3 : 0 }],
        }}
      >
        <T style={{ fontFamily: fonts.mono, fontSize: 19 }}>{label}</T>
      </View>
    </Pressable>
  );
}

function DraggableChip({ index, label, active, disabled, onTap, onDropAt }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [dragging, setDragging] = useState(false);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: (_, g) => !disabled && (Math.abs(g.dx) > 6 || Math.abs(g.dy) > 6),
        onPanResponderGrant: () => {
          setDragging(true);
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, g) => {
          setDragging(false);
          const moved = Math.hypot(g.dx, g.dy) > 10;
          if (!moved) {
            Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
            onTap(index);
            return;
          }
          const dropped = onDropAt(index, g.moveX, g.moveY);
          if (!dropped) {
            Animated.spring(pan, { toValue: { x: 0, y: 0 }, bounciness: 8, useNativeDriver: false }).start();
          } else {
            pan.setValue({ x: 0, y: 0 });
          }
        },
        onPanResponderTerminate: () => {
          setDragging(false);
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        },
      }),
    [disabled, index, onTap, onDropAt]
  );

  return (
    <Animated.View
      {...responder.panHandlers}
      style={{
        zIndex: dragging ? 999 : 1,
        elevation: dragging ? 10 : 0,
        transform: pan.getTranslateTransform(),
      }}
    >
      <Chip label={label} active={active} dragging={dragging} onPress={() => !disabled && onTap(index)} />
    </Animated.View>
  );
}

export default function MatchBoard({
  pieces,
  slots,
  placed,
  picked,
  slotOk,
  onPiece,
  onSlot,
  onPlaceDirect,
}) {
  const used = Object.values(placed);
  const slotRefs = useRef({});
  const [hoveredSlot, setHoveredSlot] = useState(null);

  const handleDropAt = (pieceIdx, moveX, moveY) => {
    setHoveredSlot(null);
    const entries = Object.entries(slotRefs.current);
    let matchedSlot = null;

    // Measure setiap slot untuk melihat apakah titik lepas jari berada di dalam kotak slot
    return new Promise((resolve) => {
      let checked = 0;
      if (entries.length === 0) {
        resolve(false);
        return;
      }
      entries.forEach(([slotKey, ref]) => {
        if (!ref || !ref.measureInWindow) {
          checked += 1;
          if (checked === entries.length) resolve(false);
          return;
        }
        ref.measureInWindow((x, y, w, h) => {
          checked += 1;
          if (
            matchedSlot === null &&
            moveX >= x - 20 &&
            moveX <= x + w + 20 &&
            moveY >= y - 20 &&
            moveY <= y + h + 20
          ) {
            matchedSlot = Number(slotKey);
          }
          if (checked === entries.length) {
            if (matchedSlot !== null && onPlaceDirect) {
              feedback.tap();
              onPlaceDirect(matchedSlot, pieceIdx);
              resolve(true);
            } else {
              resolve(false);
            }
          }
        });
      });
    });
  };

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
          minHeight: 66,
          marginBottom: 16,
          zIndex: 50,
        }}
      >
        {pieces.map((p, i) =>
          used.includes(i) ? null : (
            <DraggableChip
              key={i}
              index={i}
              label={p}
              active={picked === i}
              disabled={!!slotOk}
              onTap={(idx) => {
                feedback.tap();
                onPiece(idx);
              }}
              onDropAt={handleDropAt}
            />
          )
        )}
      </View>

      {slots.map((label, i) => {
        const pi = placed[i];
        const border = slotOk
          ? slotOk[i]
            ? colors.green
            : colors.red
          : hoveredSlot === i || picked !== null
          ? colors.blue
          : '#9DB6DC';
        const fill = slotOk
          ? slotOk[i]
            ? '#E6F8EE'
            : '#FFE7E7'
          : picked !== null && pi === undefined
          ? '#F2F8FF'
          : 'transparent';

        return (
          <FadeInUp key={i} delay={80 * i}>
            <View
              ref={(el) => {
                slotRefs.current[i] = el;
              }}
              collapsable={false}
            >
              <Pressable
                onPress={() => {
                  feedback.tap();
                  onSlot(i);
                }}
                style={[
                  {
                    backgroundColor: '#fff',
                    borderRadius: 26,
                    padding: 14,
                    paddingLeft: 22,
                    marginBottom: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                  shadow,
                ]}
              >
                <T weight="bold" style={{ fontSize: 18, width: 112 }}>
                  {label}
                </T>
                <View
                  style={{
                    flex: 1,
                    minHeight: 68,
                    borderRadius: 20,
                    borderWidth: 3,
                    borderStyle: 'dashed',
                    borderColor: border,
                    backgroundColor: fill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 8,
                  }}
                >
                  {pi !== undefined ? <Chip label={pieces[pi]} placed /> : null}
                </View>
              </Pressable>
            </View>
          </FadeInUp>
        );
      })}
      <T style={{ textAlign: 'center', color: colors.slate, fontSize: 15, marginTop: 4 }}>
        Seret potongan ke kotak, atau ketuk untuk memilih lalu ketuk kotak untuk menaruh.
      </T>
    </View>
  );
}
