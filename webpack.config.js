const path = require('path');

module.exports = {
    entry: ['babel-polyfill','./src/content.js'],
    output: {
        filename: 'content.bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    }
};
