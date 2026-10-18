import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
  PressableProps,
} from 'react-native';
import { Palette } from '@/constants/colors';

export type ButtonVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'success';

export type ButtonSize = 'sm' | 'default' | 'lg' | 'icon';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Button({
  children,
  variant = 'default',
  size = 'default',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const variantStyles = getVariantStyle(variant, isDisabled);
  const sizeStyles = getSizeStyle(size);

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles.container,
        variantStyles.container,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.textColor}
          style={styles.spinner}
        />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' ? (
            <View style={styles.iconLeft}>{icon}</View>
          ) : null}
          {typeof children === 'string' ? (
            <Text
              style={[
                styles.text,
                sizeStyles.text,
                { color: variantStyles.textColor },
                textStyle,
              ]}
            >
              {children}
            </Text>
          ) : (
            children
          )}
          {icon && iconPosition === 'right' ? (
            <View style={styles.iconRight}>{icon}</View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

function getVariantStyle(variant: ButtonVariant, disabled: boolean) {
  switch (variant) {
    case 'secondary':
      return {
        container: {
          backgroundColor: Palette.slate100,
          borderWidth: 1,
          borderColor: Palette.slate200,
        },
        textColor: Palette.slate800,
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: Palette.slate300,
        },
        textColor: Palette.slate800,
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 0,
        },
        textColor: Palette.slate700,
      };
    case 'destructive':
      return {
        container: {
          backgroundColor: Palette.destructive,
          borderWidth: 0,
        },
        textColor: Palette.white,
      };
    case 'success':
      return {
        container: {
          backgroundColor: Palette.success,
          borderWidth: 0,
        },
        textColor: Palette.white,
      };
    case 'default':
    default:
      return {
        container: {
          backgroundColor: Palette.primary,
          borderWidth: 0,
        },
        textColor: Palette.primaryForeground,
      };
  }
}

function getSizeStyle(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return {
        container: {
          height: 36,
          paddingHorizontal: 12,
          borderRadius: 8,
        },
        text: {
          fontSize: 13,
          fontWeight: '600' as const,
        },
      };
    case 'lg':
      return {
        container: {
          height: 52,
          paddingHorizontal: 24,
          borderRadius: 12,
        },
        text: {
          fontSize: 16,
          fontWeight: '600' as const,
        },
      };
    case 'icon':
      return {
        container: {
          width: 42,
          height: 42,
          paddingHorizontal: 0,
          borderRadius: 10,
        },
        text: {
          fontSize: 14,
        },
      };
    case 'default':
    default:
      return {
        container: {
          height: 44,
          paddingHorizontal: 16,
          borderRadius: 10,
        },
        text: {
          fontSize: 14,
          fontWeight: '600' as const,
        },
      };
  }
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  spinner: {
    marginVertical: 2,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
