import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { Palette } from '@/constants/colors';

export interface AvatarProps {
  name: string;
  size?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  isOnline?: boolean;
}

export function Avatar({
  name,
  size = 42,
  style,
  textStyle,
  isOnline,
}: AvatarProps) {
  const initials = getInitials(name);
  const backgroundColor = getColorForName(name);

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
          },
          style,
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              fontSize: size * 0.38,
            },
            textStyle,
          ]}
        >
          {initials}
        </Text>
      </View>
      {isOnline ? (
        <View
          style={[
            styles.onlineBadge,
            {
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: (size * 0.28) / 2,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

function getInitials(name: string) {
  if (!name) return 'LB';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorForName(name: string) {
  const colors = [
    '#2563EB', // Blue
    '#7C3AED', // Violet
    '#059669', // Emerald
    '#D97706', // Amber
    '#DC2626', // Red
    '#0284C7', // Sky
    '#4F46E5', // Indigo
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignSelf: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Palette.white,
  },
  text: {
    color: Palette.white,
    fontWeight: '700',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Palette.success,
    borderWidth: 2,
    borderColor: Palette.white,
  },
});
