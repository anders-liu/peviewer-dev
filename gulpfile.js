const gulp = require("gulp");
const replace = require("gulp-replace");

gulp.task("default", ["dev", "prod"]);

gulp.task("dev", ["html-dev"]);
gulp.task("prod", ["html-prod"]);

gulp.task("html-dev", () => build_html(true));
gulp.task("html-prod", () => build_html(false));

function build_html(is_dev) {
    const js_react = is_dev ? JS_REACT_DEV : JS_REACT;
    const js_react_dom = is_dev ? JS_REACT_DOM_DEV : JS_REACT_DOM;
    const js_redux = is_dev ? JS_REDUX_DEV : JS_REDUX;
    const js_react_redux = is_dev ? JS_REACT_REDUX_DEV : JS_REACT_REDUX;
    const path_out = is_dev ? PATH_OUT_DEV : PATH_OUT;

    return gulp.
        src("./src/ui/html/index.html").
        pipe(replace("{{{JS_REACT}}}", js_react)).
        pipe(replace("{{{JS_REACT_DOM}}}", js_react_dom)).
        pipe(replace("{{{JS_REDUX}}}", js_redux)).
        pipe(replace("{{{JS_REACT_REDUX}}}", js_react_redux)).
        pipe(gulp.dest(path_out));
}

const JS_REACT = "https://unpkg.com/react@16/umd/react.production.min.js";
const JS_REACT_DOM = "https://unpkg.com/react-dom@16/umd/react-dom.production.min.js";
const JS_REDUX = "https://unpkg.com/redux@3.7.2/dist/redux.min.js";
const JS_REACT_REDUX = "https://unpkg.com/react-redux@5.0.7/dist/react-redux.min.js";

const JS_REACT_DEV = "https://unpkg.com/react@16/umd/react.development.js";
const JS_REACT_DOM_DEV = "https://unpkg.com/react-dom@16/umd/react-dom.development.js";
const JS_REDUX_DEV = "https://unpkg.com/redux@3.7.2/dist/redux.js";
const JS_REACT_REDUX_DEV = "https://unpkg.com/react-redux@5.0.7/dist/react-redux.js";

const PATH_OUT = "./out/dist/";
const PATH_OUT_DEV = PATH_OUT + "dev";
