
import { paths, getEntry, getOutput, loaders, plugins, combine } from 'kiwiai';

const { urlLoader, babelLoader, jsonLoader } = loaders;
const staticFileName = 'static/[name].$[hash:4].[ext]';


export default {
  devtool: 'cheap-module-source-map',
  entry: getEntry(['./public/index.js']),
  output: getOutput(),
  resolve: {
    modules: [
      paths.appSrc,
      paths.appNodeModules,
      paths.ownNodeModules
    ],
    extensions: [ '.js', '.json' ]
  },
  module: {
    noParse: [/moment.js/],
    rules: [{
      exclude: [
        /\.html$/,
        /\.jsx?$/,
        /\.(css|less)$/,
        /\.json$/,
        /\.svg$/,
        /\.tsx?$/
      ],
      use: [urlLoader({ name: staticFileName })]
    }, {
      test: /\.jsx?$/,
      include: [
        paths.appSrc,
        paths.resolveApp( 'public/index.js' )
      ],
      use: [babelLoader()]
    }, {
      test: /\.json$/,
      use: [jsonLoader()]
    }]
  },
  plugins: combine(
    plugins.Define(),
    plugins.HotModuleReplacement(),
    plugins.CaseSensitivePaths(),
    plugins.WatchMissingNodeModules(),
    plugins.SystemBellWebpack(),
    plugins.CommonsChunk(),
    plugins.HtmlWebpack({
      favicon: undefined
    })
  ),
  // externals: config.externals,
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};
