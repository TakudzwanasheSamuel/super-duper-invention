import React from 'react';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
};

export function TabBarIcon({ name, color }: Props) {
  return <Ionicons name={name} size={20} color={color} style={{ marginBottom: -1 }} />;
}

