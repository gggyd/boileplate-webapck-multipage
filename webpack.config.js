'use strict';

const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');
const TransferWebpackPlugin = require('transfer-webpack-plugin');

const TARGET = process.env.npm_lifecycle_event;
const buildPath = 'build';
const cdnPath = 'cdn';
const port = 5900;
const host = 'http://local.domestore.cn';
const build = 'http://sdkserver.domestore.cn';

const PATHS = {
  app: path.join(__dirname, 'src'),
  build: path.join(__dirname, buildPath),
  cdn: path.join(__dirname, cdnPath)
}

const chunks = ['index'];

const common = {
  entry: {
      index: './src/js/page/index.js'
  },
  output: {
    path: TARGET === 'cdn' ? PATHS.cdn : PATHS.build,
    filename: 'js/[name].js',
    chunkFilename: 'js/[id].chunk.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
      },
      {
        test: /\.less$/, 
        loader: ExtractTextPlugin.extract( "style-loader", 'css-loader?sourceMap!less-loader!autoprefixer-loader')
      },
      {
				//html模板加载器，可以处理引用的静态资源，默认配置参数attrs=img:src，处理图片的src引用的资源
				//比如你配置，attrs=img:src img:data-src就可以一并处理data-src引用的资源了，就像下面这样
				test: /\.(html)$/,
				loader: "html?attrs=img:src img:data-src"
			},
      {
        test: /\.hbs$/, 
        loader: "handlebars-loader?attrs=img:src"
      },
      {
				//文件加载器，处理文件静态资源
				test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				loader: 'file-loader?name=./fonts/[name].[ext]'
			},
      {
				//图片加载器，雷同file-loader，更适合图片，可以将较小的图片转成base64，减少http请求
				//如下配置，将小于8192byte的图片转成base64码
				test: /\.(png|jpg|gif)$/,
				loader: 'url-loader?limit=2048&name=./img/[hash].[ext]'
			}
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendors',
      chunks: chunks,
      minChunks: chunks.length
    }),
    new HtmlWebpackPlugin({ 
        favicon: './src/img/favicon.png', 
        filename: './index.html', 
        template: './src/view/index.html', 
        inject: 'body', 
        hash: true, 
        chunks: ['vendors', 'index'],
        minify: {  
            removeComments: true, 
            collapseWhitespace: false 
        }
    }),
    new ExtractTextPlugin('css/[name].css')
  ]
}

if (TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    devtool: 'eval-source-map',
    devServer: {
      hot: true,
      inline: true,
      progress: true,

      stats: 'errors-only',

      host: process.env.HOST,
      port: process.env.PORT || port
    },
    output: {
      publicPath: host + ':' + port + '/',
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ]
  });
}

if (TARGET === 'build' || TARGET === cdnPath) {
  module.exports = merge(common, {
    output: {
      publicPath: TARGET === cdnPath ? 'http://sdk.domestore.cn/' : '/',
    },
    plugins: [
      new CleanPlugin(TARGET === cdnPath ? [PATHS.cdn] : [PATHS.build], {
        // verbose: false
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
   });
}