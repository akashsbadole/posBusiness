import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: number;
  borderRadius?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'elevated',
  padding = 16,
  borderRadius = 12,
}) => {
  const { colors } = useTheme();

  const getCardStyles = () => {
    const baseStyle: ViewStyle = {
      borderRadius,
      padding,
    };

    const variantStyles: Record<string, ViewStyle> = {
      elevated: {
        backgroundColor: colors.surface,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      outlined: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
      },
      filled: {
        backgroundColor: colors.primary + '10',
      },
    };

    return [baseStyle, variantStyles[variant]];
  };

  return (
    <View style={[getCardStyles(), style]}>
      {children}
    </View>
  );
};

export default Card;