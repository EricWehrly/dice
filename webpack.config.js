const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      // Force all three.js imports to use the same instance from root node_modules
      // 'three': path.resolve(__dirname, 'node_modules/three'),
      // Also alias @types/three to ensure type compatibility
      '@types/three': path.resolve(__dirname, 'node_modules/@types/three')
    }
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    static: './dist',
    hot: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};