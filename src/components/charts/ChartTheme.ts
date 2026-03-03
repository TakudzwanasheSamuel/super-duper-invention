import { VictoryTheme } from 'victory-native';
import { Colors, Fonts } from '@/constants/theme';

export const ChartTheme = {
  ...VictoryTheme.grayscale,
  axis: {
    ...VictoryTheme.grayscale.axis,
    style: {
      ...VictoryTheme.grayscale.axis.style,
      grid: {
        stroke: '#16161E',
      },
      axis: {
        stroke: Colors.secondary,
      },
      ticks: {
        stroke: Colors.secondary,
      },
      tickLabels: {
        fontFamily: Fonts.body,
        fontSize: 12,
        fill: Colors.secondary,
      },
    },
  },
  bar: {
    ...VictoryTheme.grayscale.bar,
    style: {
      ...VictoryTheme.grayscale.bar.style,
      data: {
        fill: Colors.accent.blue,
      },
      labels: {
        fontFamily: Fonts.body,
        fontSize: 10,
        fill: 'white',
      },
    },
  },
  line: {
    ...VictoryTheme.grayscale.line,
    style: {
      ...VictoryTheme.grayscale.line.style,
      data: {
        stroke: Colors.accent.gold,
        strokeWidth: 3,
      },
      labels: {
        fontFamily: Fonts.body,
        fontSize: 10,
        fill: 'white',
      },
    },
  },
  pie: {
    ...VictoryTheme.grayscale.pie,
    style: {
        ...VictoryTheme.grayscale.pie.style,
        data: {
            stroke: 'transparent',
            strokeWidth: 0,
        },
        labels: {
            fontFamily: Fonts.body,
            fontSize: 12,
            fill: 'white',
        },
    },
  },
};
