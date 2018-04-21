const path = require("path");

module.exports = (env) => {
    return {
        entry: "./index.ts",
        target: "webworker",
        output: {
            filename: "pe.js",
            path: path.resolve(__dirname, "../../out/webpack/"),
            libraryTarget: "umd",
            library: "PE"
        },
        devtool: "source-map",
        resolve: {
            extensions: [".ts", ".js"],
        },
        module: {
            rules: [{
                test: /\.ts$/, loader: "ts-loader"
            }, {
                test: /\.js$/, loader: "source-map-loader", enforce: "pre"
            }]
        }
    };
};