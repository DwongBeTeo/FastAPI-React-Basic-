const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js', // Điểm bắt đầu của ứng dụng
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true, // Xóa thư mục dist cũ trước khi build mới
  },
  mode: 'development',
  devServer: {
    port: 3000,
    open: true, // Tự động mở trình duyệt
    hot: true,  // Cập nhật giao diện không cần reload trang
    historyApiFallback: true, // quan trọng cho React Router (SPA)
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader', // Dùng Babel để đọc file .js, .jsx
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
  ],
};