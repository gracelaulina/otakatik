import React from 'react';
import { Text } from 'react-native';
import { colors, fonts } from '../theme';

export default function T({ weight = 'regular', style, ...rest }) {
  return <Text {...rest} style={[{ fontFamily: fonts[weight], color: colors.navy }, style]} />;
}
