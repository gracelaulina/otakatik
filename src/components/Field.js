import React, { useState } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, shadow } from '../theme';

const webNoOutline = Platform.OS === 'web' ? { outlineStyle: 'none' } : {};

export default function Field({ style, secureTextEntry, ...props }) {
  const [hidden, setHidden] = useState(!!secureTextEntry);

  if (!secureTextEntry) {
    return (
      <TextInput
        placeholderTextColor={colors.slate}
        {...props}
        style={[
          {
            backgroundColor: '#fff',
            borderRadius: 22,
            height: 58,
            paddingHorizontal: 20,
            fontSize: 17,
            fontFamily: fonts.semi,
            color: colors.navy,
            width: '100%',
            minWidth: 0,
          },
          webNoOutline,
          shadow,
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          borderRadius: 22,
          height: 58,
          paddingLeft: 20,
          paddingRight: 12,
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          minWidth: 0,
          overflow: 'hidden',
        },
        shadow,
        style,
      ]}
    >
      <TextInput
        placeholderTextColor={colors.slate}
        {...props}
        secureTextEntry={hidden}
        style={[
          {
            flex: 1,
            minWidth: 0,
            height: '100%',
            fontSize: 17,
            fontFamily: fonts.semi,
            color: colors.navy,
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          webNoOutline,
        ]}
      />
      <Pressable
        onPress={() => setHidden(!hidden)}
        hitSlop={10}
        style={{ padding: 6 }}
      >
        <Ionicons
          name={hidden ? 'eye-off-outline' : 'eye-outline'}
          size={22}
          color={colors.slate}
        />
      </Pressable>
    </View>
  );
}
