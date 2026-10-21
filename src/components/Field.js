import React from 'react';
import { TextInput } from 'react-native';
import { colors, fonts, shadow } from '../theme';

export default function Field({ style, ...props }) {
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
          fontSize: 19,
          fontFamily: fonts.semi,
          color: colors.navy,
        },
        shadow,
        style,
      ]}
    />
  );
}
