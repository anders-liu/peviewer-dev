import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Redux from "redux";
import * as ReactRedux from "react-redux";

import * as packageJson from "package.json";
import * as S from "./store/state";
import * as R from "./store/reducers";
import { App } from "./components/app";
import { actionListenerMiddleware } from "./action-listener";
import { workerClientMiddleware, initWorkerClient } from "./worker-client";

const appInfo: S.AppInfo = {
    title: packageJson.title,
    version: packageJson.version,
    author: packageJson.author,
    homepage: packageJson.homepage,
    bugsUrl: packageJson.bugs.url,
    year: new Date().getFullYear().toString(),
};

const defaultState: S.AppState = {
    appInfo,
    fileInfo: null,
};

document.title = `${appInfo.title}`;

const _w = window as any;
const composeEnhancers = _w.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;
const store = Redux.createStore(R.appReducer, defaultState, composeEnhancers(
    Redux.applyMiddleware(
        actionListenerMiddleware,
        workerClientMiddleware)
));

ReactDOM.render(
    <App />,
    document.getElementById("app")
);
