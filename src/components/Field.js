import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, shadow } from '../theme';

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
            height: 60,
            paddingHorizontal: 24,
            fontSize: 18,
            fontFamily: fonts.semi,
            color: colors.navy,
          },
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
          height: 60,
          paddingLeft: 24,
          paddingRight: 14,
          flexDirection: 'row',
          alignItems: 'center',
        },
        shadow,
        style,
      ]}
    >
      <TextInput
        placeholderTextColor={colors.slate}
        {...props}
        secureTextEntry={hidden}
        style={{
          flex: 1,
          height: '100%',
          fontSize: 18,
          fontFamily: fonts.semi,
          color: colors.navy,
        }}
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
