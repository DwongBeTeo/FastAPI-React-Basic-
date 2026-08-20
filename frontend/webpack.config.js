const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  entry: './src/index.js', // Điểm bắt đầu của ứng dụng
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true, 
  },
  mode: 'development',
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    open: false, //Docker không thể tự mở trình duyệt
    hot: true,  
    historyApiFallback: true,
  },
  module: {
    // TẮT CẢNH BÁO CỦA DATEPICKER
    exprContextCritical: false,
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Cho phép import không cần ghi đuôi file
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    // new ReactRefreshWebpackPlugin(),
  ],
};