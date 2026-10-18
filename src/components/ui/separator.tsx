import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Palette } from '@/constants/colors';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

export function Separator({ orientation = 'horizontal', style }: SeparatorProps) {
  return (
    <View
      style={[
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
    backgroundColor: Palette.slate200,
    marginVertical: 12,
  },
  vertical: {
    width: 1,
    height: '100%',
    backgroundColor: Palette.slate200,
    marginHorizontal: 12,
  },
});
