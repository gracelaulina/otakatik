import React, { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import T from './T';

export default function CountUp({ to, prefix = '', suffix = '', style, duration = 900, delay = 300 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const a = new Animated.Value(0);
    const id = a.addListener(({ value }) => setVal(Math.round(value)));
    Animated.timing(a, { toValue: to, duration, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => a.removeListener(id);
  }, [to]);
  return (
    <T weight="bold" style={style}>
      {prefix}
      {val}
      {suffix}
    </T>
  );
}
