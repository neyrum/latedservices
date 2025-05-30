module.exports = {
  chainWebpack: config => {
    config.plugin("define").tap(options => {
      options[0] = {
        ...options[0],
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
      };
      return options;
    });
  }
};
