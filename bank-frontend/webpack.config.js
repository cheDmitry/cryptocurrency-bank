const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
// const tranformModule = require("babel/plugin-transform-modules-commonjs")


module.exports = (env) => (
  {
    entry: './src/index.js',
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle[contenthash].js',
      clean: true,
      publicPath: env.prod ? './' : '/',
    },
  
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: "defaults" }, ]
              ],
              // blacklist: ["useStrict"],
            }
          }
        },

        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
  
        {
          test: /\.css/i,
          use: [
            env.prod ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            // 'sass-loader'
          ]
        },
  
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
        },
      ],
    },
  
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'main[contenthash].css'
      }),
  
      new HtmlWebpackPlugin({
        title: 'Bank',
      }),
    ],
  
    devServer: {
      historyApiFallback: true,
      hot: true,
    },
  
    optimization: {
      minimizer: [
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.squooshMinify,
            options: {
              encodeOptions: {
                mozjpeg: {
                  quality: 100,
                },
                webp: {
                  lossless: 1,
                },
                avif: {
                  cqLevel: 0,
                },
              },
            },
          },
        }),
        
        new CssMinimizerPlugin(),
        new TerserPlugin(),
      ],
    },
  }
)