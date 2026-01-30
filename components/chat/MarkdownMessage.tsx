import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface MarkdownMessageProps {
  content: string;
  isUser?: boolean;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, isUser }) => {
  return (
    <Markdown style={isUser ? userStyles : assistantStyles}>
      {content}
    </Markdown>
  );
};

const assistantStyles = StyleSheet.create({
  body: { color: '#e0f2fe', fontSize: 15, lineHeight: 22 },
  text: { color: '#e0f2fe' },
});

const userStyles = StyleSheet.create({
  body: { color: '#0f172a', fontSize: 15, lineHeight: 22 },
  text: { color: '#0f172a' },
});
