const darkBackground = "#131329";
const greenColor = "#66fee8";
const redColor = "#f03a53";
const xtradeLineColor = "#0ac8ff";

export const themeOverrides = {
  light: {},
  dark: {
    "paneProperties.background": darkBackground,
    "paneProperties.backgroundGradientStartColor": darkBackground,
    "paneProperties.backgroundGradientEndColor": darkBackground,

    "mainSeriesProperties.priceLineColor": "#ffffff",

    "mainSeriesProperties.candleStyle.upColor": greenColor,
    "mainSeriesProperties.candleStyle.downColor": redColor,
    "mainSeriesProperties.candleStyle.drawBorder": false,

    "mainSeriesProperties.hollowCandleStyle.upColor": greenColor,
    "mainSeriesProperties.hollowCandleStyle.downColor": redColor,

    "mainSeriesProperties.barStyle.upColor": greenColor,
    "mainSeriesProperties.barStyle.downColor": redColor,

    "mainSeriesProperties.baselineStyle.topLineColor": greenColor,
    "mainSeriesProperties.baselineStyle.bottomLineColor": redColor,

    "mainSeriesProperties.lineStyle.linewidth": 1,
    "mainSeriesProperties.lineStyle.color": xtradeLineColor,

    "mainSeriesProperties.areaStyle.linewidth": 1,
    "mainSeriesProperties.areaStyle.linecolor": xtradeLineColor,
    "mainSeriesProperties.areaStyle.color1": "rgba(10, 200, 255, 0.5)",
    "mainSeriesProperties.areaStyle.color2": "rgba(10, 200, 255, 0)",
  },
};
