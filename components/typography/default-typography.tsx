import React from "react";
import { Text, TextProps, StyleSheet, TextStyle } from "react-native";

type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "body"
  | "bodySmall"
  | "caption"
  | "label";

type FontWeight = "regular" | "medium" | "semibold" | "bold";

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  weight?: FontWeight;
  color?: string;
  align?: TextStyle["textAlign"];
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<TypographyVariant, TextStyle> = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.5,
  },
};

const FONT_WEIGHTS: Record<FontWeight, TextStyle["fontWeight"]> = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

const DEFAULT_COLOR = "#111827"; 
const Typography: React.FC<TypographyProps> = ({
  variant = "body",
  weight = "regular",
  color = DEFAULT_COLOR,
  align = "left",
  style,
  children,
  ...props
}) => {
  return (
    <Text
      {...props}
      style={[
        styles.base,
        VARIANT_STYLES[variant],
        {
          fontWeight: FONT_WEIGHTS[weight],
          color,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: "System",
  },
});

export default Typography;
