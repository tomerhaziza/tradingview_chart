<template>
  <div
    class="TVChartContainer"
    ref="chartContainer"
    :style="{ background: 'backgroundColor' }"
  />
</template>

<script>
import { widget } from "../../public/charting_library";
import { themeOverrides } from "../fixtures/theme_overrides";

const getParamFromUrl = (param) => {
  return new URLSearchParams(location.search).get(param);
};

const returnHostname = () => {
  const hostname = window.location.hostname.split("\.");
  hostname.shift();
  return hostname.join(".");
};

// let positionsShownOnChartEnabled =
//   localStorage.getItem("positionsShownOnChartEnabled") === null ||
//   localStorage.getItem("positionsShownOnChartEnabled") === "true";

const defaultName = "Default";

const backgroundColor =
  getParamFromUrl("theme") === "dark" ? "#131329" : "#ffffff";

export default {
  name: "TVChartContainer",
  props: {
    symbol: {
      default: getParamFromUrl("symbol"),
      type: String,
    },
    interval: {
      default: getParamFromUrl("interval"),
      type: String,
    },
    datafeedUrl: {
      default: "/tw-chart/data",
      type: String,
    },
    datafeedUpdateTime: {
      default: 3000,
      type: Number,
    },
    libraryPath: {
      default: "/charting_library/",
      type: String,
    },
    locale: {
      default: getParamFromUrl("lang") || "en",
      type: String,
    },
    theme: {
      default: getParamFromUrl("theme") || "light",
      type: String,
    },
    chartsStorageUrl: {
      default: "/tw-chart/saveload",
      type: String,
    },
    chartsStorageApiVersion: {
      default: "1.1",
      type: String,
    },
    autoSaveDelay: {
      default: 2,
      type: Number,
    },
    clientId: {
      default: returnHostname(),
      type: String,
    },
    userId: {
      default: "1",
      type: String,
    },
    fullscreen: {
      default: false,
      type: Boolean,
    },
    autosize: {
      default: true,
      type: Boolean,
    },
    overrides: {
      default: {
        "mainSeriesProperties.showCountdown": true,
        "scalesProperties.showSymbolLabels": false,
        "mainSeriesProperties.statusViewStyle.showExchange": false,
        "mainSeriesProperties.style": 3,
      },
      type: Object,
    },
    disabledFeatures: {
      default: [
        // "header_saveload",
        "use_localstorage_for_settings",
        "header_symbol_search",
        "symbol_search_hot_key",
        "header_compare",
      ],
      type: Array,
    },
    enabledFeatures: {
      default: [
        "study_templates",
        "side_toolbar_in_fullscreen_mode",
        "header_in_fullscreen_mode",
      ],
      type: Array,
    },
    studiesOverrides: {
      type: Object,
    },
    tvEnableDebug: {
      default: false,
      type: Boolean,
    },
    customCssPath: {
      default: "/chart-theme.css",
      type: String,
    },
    isMobile: {
      default: getParamFromUrl("isMobile") === "true",
      type: Boolean,
    },
    studiesAccess: {
      default: {
        type: "black",
        tools: [
          {
            name: "Volume",
            grayed: false,
          },
        ],
      },
      type: Object,
    },
    loadingScreen: {
      default: {
        backgroundColor,
        foregroundColor: backgroundColor,
      },
      type: Object,
    },
  },
  tvWidget: null,

  methods: {
    initChart(symbol) {
      const widgetOptions = {
        debug: this.tvEnableDebug,
        symbol: symbol,
        // BEWARE: no trailing slash is expected in feed URL
        datafeed: new window.Datafeeds.UDFCompatibleDatafeed(
          this.datafeedUrl,
          this.datafeedUpdateTime
        ),
        interval: this.interval,
        container: this.$refs.chartContainer,
        library_path: this.libraryPath,

        locale: this.locale,
        disabled_features: this.disabledFeatures,
        enabled_features: this.enabledFeatures,
        theme: this.theme,
        loading_screen: this.loadingScreen,
        charts_storage_url: this.chartsStorageUrl,
        charts_storage_api_version: this.chartsStorageApiVersion,
        auto_save_delay: this.autoSaveDelay,
        client_id: this.clientId, //
        user_id: this.userId, //
        fullscreen: this.fullscreen,
        autosize: this.autosize,
        overrides: { ...this.overrides, ...themeOverrides[this.theme] }, //
        studies_overrides: this.studiesOverrides,
        studies_access: this.studiesAccess,
        custom_css_url: this.customCssPath,
        load_last_chart: true,
      };

      // extend settings for mobile
      if (this.isMobile) {
        widgetOptions.preset = "mobile";
        widgetOptions.enabled_features.push(
          "header_widget",
          "header_resolutions",
          "timeframes_toolbar",
          "left_toolbar"
        );
        widgetOptions.disabled_features.push("header_screenshot");
      }

      const tvWidget = new widget(widgetOptions);
      this.tvWidget = tvWidget;

      tvWidget.onChartReady(this.onChartReady);
    },

    onChartReady() {
      if (!this.mobile) this.addCustomButtonsToChart();
      this.initSaveLoad();
    },

    createCustomButton(text, onClick) {
      this.tvWidget.createButton({ useTradingViewStyle: true, text, onClick });
    },

    updateChartTheme(selectedTheme) {
      const currentTheme = selectedTheme || this.tvWidget.getTheme();
      this.tvWidget.changeTheme(currentTheme).then(() => {
        this.tvWidget.chart().applyOverrides(themeOverrides[currentTheme]);
      });
    },

    loadChartFromServerByName(layoutName) {
      // get saved layouts from saveload server
      this.tvWidget.getSavedCharts((chartRecords) => {
        const savedChart = chartRecords.find((obj) => obj.name === layoutName);
        if (savedChart) {
          // if user has saved layout, load Default layout
          this.tvWidget.loadChartFromServer(savedChart);
        } else {
          // if Default layout not found, create and save Default layout
          this.tvWidget.saveChartToServer(null, null, {
            chartName: layoutName,
            defaultChartName: layoutName,
          });
        }
      });
    },

    onChartLayoutLoaded() {
      this.updateChartTheme();
      // Preserve selected symbol and resolution when loading chart layout
      this.changeSymbol(this.symbol);
    },

    onAutoSaveNeeded() {
      this.tvWidget.saveChartToServer();
    },

    initSaveLoad() {
      // FALLBACK: if for some reason the saved chart layout was not loaded, show chart anyway after 3 sec (when saveload server is down)
      // setTimeout(() => {
      //   this.updateChartTheme();
      //   // reveal chart
      // }, 3000);

      // load saved layout
      this.loadChartFromServerByName(defaultName);

      // event subscribtions
      this.tvWidget.subscribe("onAutoSaveNeeded", this.onAutoSaveNeeded);
      this.tvWidget.subscribe("layout_changed", this.onChartLayoutLoaded);
    },

    changeSymbol(symbolName) {
      this.tvWidget.activeChart().setSymbol(symbolName, () => {
        // reset chart zoom for new symbol
        this.tvWidget.activeChart().executeActionById("timeScaleReset");
      });
    },

    addCustomButtonsToChart() {
      // this.createPositionsOnChartToggleButton();
      // this.createCustomButton("TEST", () => {});
    },

    // createPositionsOnChartToggleButton() {
    //   const text = positionsShownOnChartEnabled
    //     ? "Hide open positions"
    //     : "Show open positions";
    //   const onClickFunc = () => {
    //     console.log(true);
    //     // positionsShownOnChartEnabled = !positionsShownOnChartEnabled;
    //     // localStorage.setItem(
    //     //   "positionsShownOnChartEnabled",
    //     //   positionsShownOnChartEnabled
    //     // );
    //     // if (!positionsShownOnChartEnabled) {
    //     //   removeAllPositionLinesFromChart();
    //     //   button.innerHTML = "Show open positions";
    //     // } else {
    //     //   updatePositions();
    //     //   button.innerHTML = "Hide open positions";
    //     // }
    //   };
    //   this.createCustomButton(text, onClickFunc);
    // },
  },

  mounted() {
    if (this.symbol) this.initChart(this.symbol);
    console.time();
  },
  destroyed() {
    if (this.tvWidget !== null) {
      this.tvWidget.remove();
      this.tvWidget = null;
    }
  },
};
</script>

<style lang="scss" scoped>
.TVChartContainer {
  height: 100vh;
}
</style>
