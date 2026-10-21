import React from 'react';
import { Text, View } from 'react-native';
import { colors, fonts } from '../theme';

const TOKEN = /("[^"]*"|\b\d+(?:\.\d+)?\b|\b(?:if|else|print|true|false)\b)/;

const tint = (tok) => {
  if (tok.startsWith('"')) return '#7EE0B0';
  if (/^\d/.test(tok)) return '#FFC247';
  return '#8EC8FF';
};

export default function CodeBlock({ code, size = 19, style }) {
  return (
    <View style={[{ backgroundColor: colors.navy, borderRadius: 28, paddingHorizontal: 24, paddingVertical: 22 }, style]}>
      {code.split('\n').map((line, i) => (
        <Text key={i} style={{ fontFamily: fonts.mono, fontSize: size, lineHeight: size * 1.7, color: '#fff' }}>
          {line === '' ? ' ' : line.split(TOKEN).map((part, j) => (
            <Text key={j} style={j % 2 === 1 ? { color: tint(part) } : null}>
              {part}
            </Text>
          ))}
        </Text>
      ))}
    </View>
  );
}
