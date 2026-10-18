import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Palette } from '@/constants/colors';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  style,
}: SwitchProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => onCheckedChange(!checked)}
      style={[
        styles.track,
        checked ? styles.trackActive : styles.trackInactive,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View
        style={[
          styles.thumb,
          checked ? styles.thumbActive : styles.thumbInactive,
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 3,
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  trackActive: {
    backgroundColor: Palette.success,
    borderColor: Palette.success,
  },
  trackInactive: {
    backgroundColor: Palette.slate200,
    borderColor: Palette.slate300,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Palette.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 3,
  },
  thumbActive: {
    alignSelf: 'flex-end',
  },
  thumbInactive: {
    alignSelf: 'flex-start',
  },
  disabled: {
    opacity: 0.5,
  },
});
