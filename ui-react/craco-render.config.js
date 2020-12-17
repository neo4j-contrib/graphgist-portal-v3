const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      return {
        ...webpackConfig,
        entry: [path.join(__dirname, 'src/graphgists/render/GraphGistRendererOnExternal.js')],
        output: {
          ...webpackConfig.output,
          filename: 'static/js/graphgist-render.js',
          libraryTarget: 'var',
          library: 'GraphGistRenderer',
          libraryExport: 'default'
        },
        optimization: {
          splitChunks: {
            cacheGroups: {
              default: false,
            },
          },
          runtimeChunk: false,
        },
        plugins: [
          webpackConfig.plugins[4],
          new MiniCssExtractPlugin({
            filename: 'static/css/graphgist-render.css',
          }),
          webpackConfig.plugins[7],
        ]
      };
    }
  }
};