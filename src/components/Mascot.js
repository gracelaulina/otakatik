
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { colors } from '../theme';

export default function Mascot({
  size = 160,
  mood = 'happy',
  bob = true,
  style,
  mascotColor = colors.mascot,

  // Kustomisasi baru
  hair = 'none',
  hairColor = '#49315F',
  hat = 'none',
  outfit = 'none',
  outfitColor = '#FF8FB1',
  faceAccessory = 'none',
  extraAccessory = 'none',

  // Kompatibilitas dengan sistem lama
  accessory = 'none',
}) {
  const S = size;
  const float = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let floating;

    if (bob) {
      floating = Animated.loop(
        Animated.sequence([
          Animated.timing(float, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(float, {
            toValue: 0,
            duration: 1100,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      floating.start();
    }

    const blinking = Animated.loop(
      Animated.sequence([
        Animated.delay(2600),
        Animated.timing(blink, {
          toValue: 0.1,
          duration: 90,
          useNativeDriver: true,
        }),
        Animated.timing(blink, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ])
    );

    blinking.start();

    return () => {
      if (floating) floating.stop();
      blinking.stop();
    };
  }, [bob]);

  const translateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -S * 0.05],
  });

  const eye = S * 0.26;
  const pupil = S * 0.14;

  // Kompatibilitas pilihan aksesori lama
  const selectedHat =
    hat !== 'none' ? hat : accessory === 'crown' ? 'crown' : 'none';

  const selectedHair = hair;

  const selectedFace =
    faceAccessory !== 'none'
      ? faceAccessory
      : accessory === 'glasses'
        ? 'glasses'
        : 'none';

  const selectedExtra =
    extraAccessory !== 'none'
      ? extraAccessory
      : accessory === 'bow'
        ? 'bow'
        : accessory === 'star'
          ? 'star'
          : 'none';

  const Eye = ({ left }) => (
    <Animated.View
      style={{
        position: 'absolute',
        top: S * 0.26,
        left,
        width: eye,
        height: eye,
        borderRadius: eye / 2,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scaleY: blink }],
        zIndex: 3,
      }}
    >
      <View
        style={{
          width: pupil,
          height: pupil,
          borderRadius: pupil / 2,
          backgroundColor: colors.navy,
        }}
      />
    </Animated.View>
  );

  // Rambut
  const Hair = () => {
    if (selectedHair === 'none') return null;

    const common = {
      position: 'absolute',
      backgroundColor: hairColor,
      zIndex: 5,
    };

    if (selectedHair === 'short') {
      return (
        <>
          <View style={[common, {
            top: -S * 0.035,
            left: S * 0.16,
            width: S * 0.68,
            height: S * 0.29,
            borderTopLeftRadius: S * 0.38,
            borderTopRightRadius: S * 0.38,
            borderBottomLeftRadius: S * 0.18,
            borderBottomRightRadius: S * 0.18,
          }]} />
          <View style={[common, {
            top: S * 0.12,
            left: S * 0.12,
            width: S * 0.18,
            height: S * 0.26,
            borderRadius: S * 0.1,
          }]} />
          <View style={[common, {
            top: S * 0.12,
            right: S * 0.12,
            width: S * 0.18,
            height: S * 0.26,
            borderRadius: S * 0.1,
          }]} />
        </>
      );
    }

    if (selectedHair === 'long') {
      return (
        <>
          <View style={[common, {
            top: -S * 0.025,
            left: S * 0.13,
            width: S * 0.74,
            height: S * 0.34,
            borderRadius: S * 0.35,
          }]} />
          <View style={[common, {
            top: S * 0.12,
            left: S * 0.06,
            width: S * 0.2,
            height: S * 0.7,
            borderRadius: S * 0.12,
          }]} />
          <View style={[common, {
            top: S * 0.12,
            right: S * 0.06,
            width: S * 0.2,
            height: S * 0.7,
            borderRadius: S * 0.12,
          }]} />
        </>
      );
    }

    if (selectedHair === 'bangs') {
      return (
        <>
          <View style={[common, {
            top: -S * 0.04,
            left: S * 0.14,
            width: S * 0.72,
            height: S * 0.3,
            borderTopLeftRadius: S * 0.35,
            borderTopRightRadius: S * 0.35,
          }]} />
          {[0, 1, 2, 3].map((n) => (
            <View
              key={n}
              style={[common, {
                top: S * (0.16 + (n % 2) * 0.035),
                left: S * (0.2 + n * 0.15),
                width: S * 0.18,
                height: S * 0.16,
                borderBottomLeftRadius: S * 0.12,
                borderBottomRightRadius: S * 0.12,
              }]}
            />
          ))}
        </>
      );
    }

    if (selectedHair === 'curly') {
      return (
        <>
          {Array.from({ length: 7 }).map((_, n) => (
            <View
              key={n}
              style={[common, {
                top: S * (0.005 + (n % 2) * 0.035),
                left: S * (0.1 + n * 0.115),
                width: S * 0.23,
                height: S * 0.25,
                borderRadius: S * 0.13,
              }]}
            />
          ))}
          <View style={[common, {
            top: S * 0.15,
            left: S * 0.09,
            width: S * 0.14,
            height: S * 0.4,
            borderRadius: S * 0.1,
          }]} />
          <View style={[common, {
            top: S * 0.15,
            right: S * 0.09,
            width: S * 0.14,
            height: S * 0.4,
            borderRadius: S * 0.1,
          }]} />
        </>
      );
    }

    if (selectedHair === 'bob') {
      return (
        <>
          <View style={[common, {
            top: -S * 0.025,
            left: S * 0.12,
            width: S * 0.76,
            height: S * 0.35,
            borderTopLeftRadius: S * 0.4,
            borderTopRightRadius: S * 0.4,
          }]} />
          <View style={[common, {
            top: S * 0.15,
            left: S * 0.06,
            width: S * 0.2,
            height: S * 0.55,
            borderBottomLeftRadius: S * 0.16,
            borderBottomRightRadius: S * 0.12,
          }]} />
          <View style={[common, {
            top: S * 0.15,
            right: S * 0.06,
            width: S * 0.2,
            height: S * 0.55,
            borderBottomLeftRadius: S * 0.12,
            borderBottomRightRadius: S * 0.16,
          }]} />
        </>
      );
    }

    if (selectedHair === 'ponytail') {
      return (
        <>
          <View style={[common, {
            top: -S * 0.02,
            left: S * 0.15,
            width: S * 0.7,
            height: S * 0.29,
            borderRadius: S * 0.3,
          }]} />
          <View style={[common, {
            top: S * 0.05,
            right: -S * 0.02,
            width: S * 0.23,
            height: S * 0.48,
            borderRadius: S * 0.14,
            transform: [{ rotate: '-25deg' }],
          }]} />
          <View style={{
            position: 'absolute',
            top: S * 0.2,
            right: S * 0.03,
            width: S * 0.16,
            height: S * 0.1,
            borderRadius: S * 0.1,
            backgroundColor: '#FF8FB1',
            zIndex: 6,
          }} />
        </>
      );
    }

    return null;
  };

  // Topi
  const Hat = () => {
    if (selectedHat === 'none') return null;

    const hatColor = {
      beret: '#FF8FB1',
      bucket: '#A78BFA',
      party: '#FFD166',
      crown: '#FFC247',
      cap: '#68BFA4',
      hood: '#8CB9FF',
    }[selectedHat] || '#FF8FB1';

    if (selectedHat === 'crown') {
      return (
        <View style={{
          position: 'absolute',
          top: -S * 0.18,
          left: S * 0.31,
          width: S * 0.38,
          height: S * 0.28,
          backgroundColor: hatColor,
          zIndex: 9,
          borderTopLeftRadius: S * 0.04,
          borderTopRightRadius: S * 0.04,
          borderBottomWidth: S * 0.04,
          borderBottomColor: '#E9A52E',
          transform: [{ rotate: '0deg' }],
        }}>
          {[0, 1, 2].map((n) => (
            <View key={n} style={{
              position: 'absolute',
              top: -S * 0.05,
              left: S * (0.04 + n * 0.13),
              width: S * 0.09,
              height: S * 0.12,
              backgroundColor: hatColor,
              borderRadius: S * 0.06,
            }} />
          ))}
        </View>
      );
    }

    if (selectedHat === 'party') {
      return (
        <View style={{
          position: 'absolute',
          top: -S * 0.32,
          left: S * 0.34,
          width: 0,
          height: 0,
          borderLeftWidth: S * 0.16,
          borderRightWidth: S * 0.16,
          borderBottomWidth: S * 0.34,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: hatColor,
          zIndex: 9,
        }} />
      );
    }

    if (selectedHat === 'beret') {
      return (
        <View style={{
          position: 'absolute',
          top: -S * 0.15,
          left: S * 0.22,
          width: S * 0.57,
          height: S * 0.24,
          borderRadius: S * 0.3,
          backgroundColor: hatColor,
          transform: [{ rotate: '-12deg' }],
          zIndex: 9,
        }} />
      );
    }

    if (selectedHat === 'bucket' || selectedHat === 'cap') {
      return (
        <>
          <View style={{
            position: 'absolute',
            top: -S * 0.13,
            left: S * 0.2,
            width: S * 0.6,
            height: S * 0.23,
            borderTopLeftRadius: S * 0.22,
            borderTopRightRadius: S * 0.22,
            backgroundColor: hatColor,
            zIndex: 9,
          }} />
          <View style={{
            position: 'absolute',
            top: S * 0.055,
            left: S * 0.12,
            width: S * 0.76,
            height: S * 0.09,
            borderRadius: S * 0.06,
            backgroundColor: hatColor,
            zIndex: 9,
          }} />
        </>
      );
    }

    if (selectedHat === 'hood') {
      return (
        <View style={{
          position: 'absolute',
          top: -S * 0.08,
          left: S * 0.08,
          width: S * 0.84,
          height: S * 0.5,
          borderTopLeftRadius: S * 0.4,
          borderTopRightRadius: S * 0.4,
          borderWidth: S * 0.1,
          borderColor: hatColor,
          zIndex: 1,
        }} />
      );
    }

    return null;
  };

  // Baju
  const Outfit = () => {
    if (outfit === 'none') return null;

    const base = {
      position: 'absolute',
      bottom: -S * 0.015,
      left: S * 0.08,
      width: S * 0.84,
      height: S * 0.34,
      backgroundColor: outfitColor,
      zIndex: 7,
    };

    if (outfit === 'hoodie') {
      return (
        <>
          <View style={[base, {
            height: S * 0.38,
            borderTopLeftRadius: S * 0.2,
            borderTopRightRadius: S * 0.2,
            borderBottomLeftRadius: S * 0.38,
            borderBottomRightRadius: S * 0.38,
          }]} />
          <View style={{
            position: 'absolute',
            bottom: S * 0.2,
            left: S * 0.37,
            width: S * 0.26,
            height: S * 0.12,
            borderWidth: S * 0.025,
            borderColor: '#FFFFFF',
            borderRadius: S * 0.08,
            zIndex: 8,
          }} />
          <View style={{
            position: 'absolute',
            bottom: S * 0.13,
            left: S * 0.48,
            width: S * 0.025,
            height: S * 0.13,
            backgroundColor: '#FFFFFF',
            zIndex: 8,
          }} />
        </>
      );
    }

    if (outfit === 'overall') {
      return (
        <>
          <View style={[base, {
            height: S * 0.36,
            borderTopLeftRadius: S * 0.08,
            borderTopRightRadius: S * 0.08,
          }]} />
          <View style={{
            position: 'absolute',
            bottom: S * 0.27,
            left: S * 0.22,
            width: S * 0.12,
            height: S * 0.2,
            backgroundColor: outfitColor,
            transform: [{ rotate: '-18deg' }],
            zIndex: 8,
          }} />
          <View style={{
            position: 'absolute',
            bottom: S * 0.27,
            right: S * 0.22,
            width: S * 0.12,
            height: S * 0.2,
            backgroundColor: outfitColor,
            transform: [{ rotate: '18deg' }],
            zIndex: 8,
          }} />
          <View style={{
            position: 'absolute',
            bottom: S * 0.19,
            left: S * 0.43,
            width: S * 0.14,
            height: S * 0.09,
            borderRadius: S * 0.03,
            backgroundColor: '#FFD166',
            zIndex: 9,
          }} />
        </>
      );
    }

    if (outfit === 'dress') {
      return (
        <View style={{
          position: 'absolute',
          bottom: -S * 0.015,
          left: S * 0.05,
          width: S * 0.9,
          height: S * 0.39,
          backgroundColor: outfitColor,
          borderTopLeftRadius: S * 0.16,
          borderTopRightRadius: S * 0.16,
          borderBottomLeftRadius: S * 0.42,
          borderBottomRightRadius: S * 0.42,
          zIndex: 7,
        }}>
          <View style={{
            position: 'absolute',
            top: S * 0.08,
            left: S * 0.37,
            width: S * 0.2,
            height: S * 0.12,
            borderRadius: S * 0.1,
            backgroundColor: '#FFFFFF',
          }} />
        </View>
      );
    }

    if (outfit === 'sweater') {
      return (
        <View style={[base, {
          height: S * 0.32,
          borderTopLeftRadius: S * 0.2,
          borderTopRightRadius: S * 0.2,
          borderBottomLeftRadius: S * 0.3,
          borderBottomRightRadius: S * 0.3,
        }]}>
          <View style={{
            position: 'absolute',
            top: 0,
            left: S * 0.28,
            width: S * 0.44,
            height: S * 0.07,
            backgroundColor: '#FFFFFF',
            borderBottomLeftRadius: S * 0.05,
            borderBottomRightRadius: S * 0.05,
          }} />
        </View>
      );
    }

    if (outfit === 'suit') {
      return (
        <View style={[base, {
          height: S * 0.34,
          borderTopLeftRadius: S * 0.18,
          borderTopRightRadius: S * 0.18,
          borderBottomLeftRadius: S * 0.3,
          borderBottomRightRadius: S * 0.3,
        }]}>
          <View style={{
            position: 'absolute',
            top: 0,
            left: S * 0.35,
            width: S * 0.14,
            height: S * 0.2,
            backgroundColor: '#FFFFFF',
            transform: [{ rotate: '18deg' }],
          }} />
          <View style={{
            position: 'absolute',
            top: 0,
            right: S * 0.35,
            width: S * 0.14,
            height: S * 0.2,
            backgroundColor: '#FFFFFF',
            transform: [{ rotate: '-18deg' }],
          }} />
          <View style={{
            position: 'absolute',
            top: S * 0.12,
            left: S * 0.45,
            width: S * 0.1,
            height: S * 0.13,
            backgroundColor: '#FFD166',
          }} />
        </View>
      );
    }

    return null;
  };

  // Kacamata dan wajah tambahan
  const FaceDetails = () => (
    <>
      {selectedFace === 'glasses' && (
        <>
          {[0, 1].map((n) => (
            <View
              key={n}
              style={{
                position: 'absolute',
                top: S * 0.29,
                left: S * (0.15 + n * 0.4),
                width: S * 0.3,
                height: S * 0.2,
                borderWidth: S * 0.025,
                borderColor: '#473B61',
                borderRadius: S * 0.07,
                zIndex: 8,
              }}
            />
          ))}
          <View style={{
            position: 'absolute',
            top: S * 0.37,
            left: S * 0.45,
            width: S * 0.1,
            height: S * 0.025,
            backgroundColor: '#473B61',
            zIndex: 8,
          }} />
        </>
      )}

      {selectedFace === 'blush' && (
        <>
          {[0, 1].map((n) => (
            <View key={n} style={{
              position: 'absolute',
              top: S * 0.55,
              left: S * (0.12 + n * 0.65),
              width: S * 0.13,
              height: S * 0.07,
              borderRadius: S * 0.07,
              backgroundColor: '#FF9DAF',
              opacity: 0.8,
              zIndex: 4,
            }} />
          ))}
        </>
      )}

      {selectedFace === 'freckles' && (
        <>
          {Array.from({ length: 6 }).map((_, n) => (
            <View key={n} style={{
              position: 'absolute',
              top: S * (0.52 + (n % 2) * 0.045),
              left: S * (0.25 + Math.floor(n / 2) * 0.2),
              width: S * 0.025,
              height: S * 0.025,
              borderRadius: S * 0.02,
              backgroundColor: '#A66B55',
              zIndex: 5,
            }} />
          ))}
        </>
      )}
    </>
  );

  // Aksesori tambahan
  const Extra = () => {
    if (selectedExtra === 'none') return null;

    if (selectedExtra === 'bow') {
      return (
        <View style={{
          position: 'absolute',
          top: -S * 0.09,
          right: S * 0.12,
          width: S * 0.25,
          height: S * 0.2,
          zIndex: 12,
        }}>
          <View style={{
            position: 'absolute',
            left: 0,
            top: S * 0.02,
            width: S * 0.13,
            height: S * 0.15,
            backgroundColor: '#FF75A8',
            borderRadius: S * 0.08,
            transform: [{ rotate: '-25deg' }],
          }} />
          <View style={{
            position: 'absolute',
            right: 0,
            top: S * 0.02,
            width: S * 0.13,
            height: S * 0.15,
            backgroundColor: '#FF75A8',
            borderRadius: S * 0.08,
            transform: [{ rotate: '25deg' }],
          }} />
          <View style={{
            position: 'absolute',
            left: S * 0.09,
            top: S * 0.055,
            width: S * 0.07,
            height: S * 0.07,
            borderRadius: S * 0.04,
            backgroundColor: '#E84E87',
          }} />
        </View>
      );
    }

    if (selectedExtra === 'headphones') {
      return (
        <>
          <View style={{
            position: 'absolute',
            top: -S * 0.08,
            left: S * 0.13,
            width: S * 0.74,
            height: S * 0.45,
            borderTopLeftRadius: S * 0.4,
            borderTopRightRadius: S * 0.4,
            borderWidth: S * 0.055,
            borderBottomWidth: 0,
            borderColor: '#8B70D6',
            zIndex: 8,
          }} />
          {[0, 1].map((n) => (
            <View key={n} style={{
              position: 'absolute',
              top: S * 0.24,
              left: n === 0 ? -S * 0.025 : S * 0.85,
              width: S * 0.17,
              height: S * 0.25,
              borderRadius: S * 0.08,
              backgroundColor: '#8B70D6',
              zIndex: 9,
            }} />
          ))}
        </>
      );
    }

    if (selectedExtra === 'necklace') {
      return (
        <View style={{
          position: 'absolute',
          top: S * 0.72,
          left: S * 0.3,
          width: S * 0.4,
          height: S * 0.13,
          borderBottomWidth: S * 0.035,
          borderColor: '#FFD166',
          borderRadius: S * 0.2,
          zIndex: 9,
        }} />
      );
    }

    if (selectedExtra === 'star') {
      return (
        <View style={{
          position: 'absolute',
          top: -S * 0.15,
          right: S * 0.08,
          width: S * 0.2,
          height: S * 0.2,
          backgroundColor: '#FFD166',
          borderRadius: S * 0.1,
          zIndex: 10,
        }} />
      );
    }

    return null;
  };

  return (
    <View style={[{ width: S, height: S * 1.3 }, style]}>
      {/* Bayangan */}
      <View style={{
        position: 'absolute',
        left: S * 0.14,
        bottom: 0,
        width: S * 0.72,
        height: S * 0.09,
        borderRadius: S * 0.05,
        backgroundColor: 'rgba(27,26,94,0.12)',
      }} />

      <Animated.View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: S,
        height: S * 1.2,
        transform: [{ translateY }],
      }}>
        {/* Antena */}
        <View style={{
          position: 'absolute',
          top: S * 0.12,
          left: S / 2 - S * 0.02,
          width: S * 0.04,
          height: S * 0.1,
          backgroundColor: colors.navy,
        }} />

        <View style={{
          position: 'absolute',
          top: 0,
          left: S / 2 - S * 0.075,
          width: S * 0.15,
          height: S * 0.15,
          borderRadius: S * 0.075,
          backgroundColor: '#FFC247',
          zIndex: 2,
        }} />

{/* Sayap di belakang badan robot */}
{selectedExtra === 'wings' && (
  <>
    {[0, 1].map((n) => (
      <View
        key={n}
        style={{
          position: 'absolute',
          top: S * 0.73,
          left: n === 0 ? -S * 0.1 : S * 0.85,
          width: S * 0.25,
          height: S * 0.3,
          borderRadius: S * 0.2,
          backgroundColor: '#FFFFFF',
          borderWidth: 2,
          borderColor: '#B8D9FF',
          transform: [{ rotate: n === 0 ? '-30deg' : '30deg' }],
          zIndex: -1,
        }}
      />
    ))}
  </>
)}

{/* Badan robot */}
<View style={{
  position: 'absolute',
  top: S * 0.2,
  left: 0,
  width: S,
  height: S,
  borderRadius: S / 2,
  backgroundColor: mascotColor,
}}>
  {/* Rambut */}
  <Hair />

          {/* Wajah */}
          <View style={{
            position: 'absolute',
            left: S * 0.175,
            top: S * 0.41,
            width: S * 0.65,
            height: S * 0.5,
            borderRadius: S * 0.25,
            backgroundColor: colors.sky,
            zIndex: 2,
          }} />

          <Eye left={S * 0.17} />
          <Eye left={S * 0.57} />

          {/* Mulut */}
          {mood === 'happy' ? (
            <View style={{
              position: 'absolute',
              left: S * 0.32,
              top: S * 0.58,
              width: S * 0.36,
              height: S * 0.17,
              backgroundColor: colors.navy,
              borderBottomLeftRadius: S * 0.18,
              borderBottomRightRadius: S * 0.18,
              zIndex: 3,
            }} />
          ) : (
            <View style={{
              position: 'absolute',
              left: S * 0.39,
              top: S * 0.62,
              width: S * 0.22,
              height: S * 0.1,
              borderTopLeftRadius: S * 0.11,
              borderTopRightRadius: S * 0.11,
              borderWidth: S * 0.03,
              borderBottomWidth: 0,
              borderColor: colors.navy,
              zIndex: 3,
            }} />
          )}

          <FaceDetails />

          {/* Topi */}
          <Hat />

          {/* Baju */}
          <Outfit />

          {/* Aksesori */}
          <Extra />
        </View>
      </Animated.View>
    </View>
  );
}
