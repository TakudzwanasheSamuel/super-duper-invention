import { Colors, Fonts } from '@/constants/theme';

// Minimal Victory theme object tailored for our charts, without
// depending on built-in VictoryTheme variants (which may differ by version).
export const ChartTheme = {
  axis: {
    style: {
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
    style: {
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
    style: {
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
    style: {
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
