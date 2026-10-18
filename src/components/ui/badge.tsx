import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { Palette } from '@/constants/colors';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'destructive'
  | 'warning'
  | 'info';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = 'default',
  style,
  textStyle,
  icon,
}: BadgeProps) {
  const stylesForVariant = getVariantStyle(variant);

  return (
    <View style={[styles.badge, stylesForVariant.container, style]}>
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
      {typeof children === 'string' ? (
        <Text style={[styles.text, { color: stylesForVariant.textColor }, textStyle]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

function getVariantStyle(variant: BadgeVariant) {
  switch (variant) {
    case 'secondary':
      return {
        container: {
          backgroundColor: Palette.slate100,
          borderColor: Palette.slate200,
        },
        textColor: Palette.slate700,
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderColor: Palette.slate300,
        },
        textColor: Palette.slate700,
      };
    case 'success':
      return {
        container: {
          backgroundColor: Palette.successLight,
          borderColor: '#A7F3D0',
        },
        textColor: Palette.successForeground,
      };
    case 'destructive':
      return {
        container: {
          backgroundColor: Palette.destructiveLight,
          borderColor: '#FECACA',
        },
        textColor: Palette.destructiveForeground,
      };
    case 'warning':
      return {
        container: {
          backgroundColor: Palette.warningLight,
          borderColor: '#FDE68A',
        },
        textColor: Palette.warningForeground,
      };
    case 'info':
      return {
        container: {
          backgroundColor: Palette.infoLight,
          borderColor: '#BAE6FD',
        },
        textColor: Palette.infoForeground,
      };
    case 'default':
    default:
      return {
        container: {
          backgroundColor: Palette.primaryLight,
          borderColor: '#BFDBFE',
        },
        textColor: Palette.primary,
      };
  }
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  iconContainer: {
    marginRight: 4,
  },
});
