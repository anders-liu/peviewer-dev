const path = require("path");

const gulp = require("gulp");
const replace = require("gulp-replace");
const webpack = require("webpack");
const ws = require("webpack-stream");
const file = require("gulp-file");
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");

gulp.task("default", ["dev", "prod"]);

gulp.task("dev", ["html-dev", "ui-dev", "styles-dev", "worker-dev"]);
gulp.task("prod", ["html-prod", "ui-prod", "styles-prod", "worker-prod"]);

gulp.task("html", ["html-dev", "html-prod"]);
gulp.task("ui", ["ui-dev", "ui-prod"]);
gulp.task("styles", ["styles-dev", "styles-prod"]);
gulp.task("worker", ["worker-dev", "worker-prod"]);

gulp.task("html-dev", () => build_html(true));
gulp.task("ui-dev", ["gen-package-json"], () => build_scripts(true, PATH_SRC_UI));
gulp.task("styles-dev", () => build_styles(true));
gulp.task("worker-dev", () => build_scripts(true, PATH_SRC_WORKER));

gulp.task("html-prod", () => build_html(false));
gulp.task("ui-prod", ["gen-package-json"], () => build_scripts(false, PATH_SRC_UI));
gulp.task("styles-prod", () => build_styles(false));
gulp.task("worker-prod", () => build_scripts(false, PATH_SRC_WORKER));

gulp.task("gen-package-json", () => gen_package_json());

function build_html(is_dev) {
    const js_react = is_dev ? JS_REACT_DEV : JS_REACT;
    const js_react_dom = is_dev ? JS_REACT_DOM_DEV : JS_REACT_DOM;
    const js_redux = is_dev ? JS_REDUX_DEV : JS_REDUX;
    const js_react_redux = is_dev ? JS_REACT_REDUX_DEV : JS_REACT_REDUX;
    const path_out = is_dev ? PATH_OUT_DEV : PATH_OUT;

    return gulp.
        src(PATH_SRC_HTML + "index.html").
        pipe(replace("{{{JS_REACT}}}", js_react)).
        pipe(replace("{{{JS_REACT_DOM}}}", js_react_dom)).
        pipe(replace("{{{JS_REDUX}}}", js_redux)).
        pipe(replace("{{{JS_REACT_REDUX}}}", js_react_redux)).
        pipe(gulp.dest(path_out));
}

function build_scripts(is_dev, src) {
    const path_out = is_dev ? PATH_OUT_DEV : PATH_OUT;
    let cfg = require(src + "webpack.config.js")();
    const entry = cfg.entry;
    delete cfg.entry;
    cfg.mode = is_dev ? "development" : "production";

    return gulp.
        src(path.resolve(src, entry.substr(2))).
        pipe(ws(cfg, webpack)).
        pipe(gulp.dest(path_out));
}

function build_styles(is_dev) {
    const path_out = is_dev ? PATH_OUT_DEV : PATH_OUT;
    const options = is_dev
        ? {
        } : {
            outputStyle: "compressed"
        };

    return gulp.
        src(PATH_SRC_STYLES + "*.scss").
        pipe(sourcemaps.init()).
        pipe(sass(options)).
        pipe(sourcemaps.write("./")).
        pipe(gulp.dest(path_out));
}

function gen_package_json() {
    const pkg = require("./package.json");
    const json = {
        title: pkg.title,
        version: pkg.version,
        author: pkg.author,
        homepage: pkg.homepage,
        bugs_url: pkg.bugs.url,
        build_time: LAST_BUILD_TIME
    }
    return file("package.g.json", JSON.stringify(json), { src: true }).
        pipe(gulp.dest(PATH_SRC_UI));
}

const JS_REACT = "https://unpkg.com/react@16/umd/react.production.min.js";
const JS_REACT_DOM = "https://unpkg.com/react-dom@16/umd/react-dom.production.min.js";
const JS_REDUX = "https://unpkg.com/redux@3.7.2/dist/redux.min.js";
const JS_REACT_REDUX = "https://unpkg.com/react-redux@5.0.7/dist/react-redux.min.js";

const JS_REACT_DEV = "https://unpkg.com/react@16/umd/react.development.js";
const JS_REACT_DOM_DEV = "https://unpkg.com/react-dom@16/umd/react-dom.development.js";
const JS_REDUX_DEV = "https://unpkg.com/redux@3.7.2/dist/redux.js";
const JS_REACT_REDUX_DEV = "https://unpkg.com/react-redux@5.0.7/dist/react-redux.js";

const PATH_SRC = "./src/";
const PATH_SRC_HTML = PATH_SRC + "ui/html/";
const PATH_SRC_UI = PATH_SRC + "ui/scripts/";
const PATH_SRC_WORKER = PATH_SRC + "worker/";
const PATH_SRC_STYLES = PATH_SRC + "ui/styles/";

const PATH_OUT = "./out/dist/";
const PATH_OUT_DEV = PATH_OUT + "dev/";

const LAST_BUILD_TIME = new Date().toUTCString();