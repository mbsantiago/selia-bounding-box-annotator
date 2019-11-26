const path = require('path');

const config = {
   mode: 'development',
   module:{
       rules:[
         {
           test: /\.js$/,
           exclude: /node_modules/,
           loader: 'babel-loader'
         },
         {
           test: /\.css$/i,
           use: ['style-loader', 'css-loader'],
         },
         {
           test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
           use: [
             {
               loader: 'file-loader',
               options: {
                 name: '[name].[ext]',
                 outputPath: 'fonts/'
               }
             }
           ]
         }
       ]
   },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    hot: true,
    port: 9000
  },
};

const visConfig = Object.assign({}, config, {
  entry: path.join(__dirname, '/src/annotator/index.js'),
  output: {
    filename: 'annotator.js',
    path: path.join(__dirname, '/dist'),
    library: 'AnnotatorTool',
    libraryTarget: 'umd',
  }
});

const appConfig = Object.assign({}, config, {
  entry: path.join(__dirname, '/src/index.js'),
  output: {
    filename: 'index.js',
    path: path.join(__dirname, '/dist'),
  }
})

module.exports = [
  visConfig, appConfig
]
