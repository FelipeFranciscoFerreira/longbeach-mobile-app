import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { Palette } from '@/constants/colors';

export interface CardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export interface CardHeaderProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export interface CardTitleProps {
  children?: React.ReactNode;
  style?: TextStyle;
}

export function CardTitle({ children, style }: CardTitleProps) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export interface CardDescriptionProps {
  children?: React.ReactNode;
  style?: TextStyle;
}

export function CardDescription({ children, style }: CardDescriptionProps) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

export interface CardContentProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

export interface CardFooterProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginVertical: 6,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.textPrimary,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  content: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  footer: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
