import * as Redux from "redux";

import * as A from "./store/actions";
import * as S from "./store/state";

export const actionListenerMiddleware = ((store: Redux.MiddlewareAPI<S.AppState>) => (next: Redux.Dispatch<S.AppState>) => (action: Redux.Action) => {
    switch (action.type) {
        case A.ActionType.OPEN_FILE: {
            const { appInfo } = store.getState();
            const { file } = action as A.OpenFileAction;
            document.title = `${file.name} - ${appInfo.title}`
            break;
        }

        case A.ActionType.OPEN_NAV: {
            const { pageData } = store.getState();
            const { target } = action as A.OpenNavAction;
            const { pageID, elemID } = target;
            if (pageData && pageData.nav.pageID === pageID) {
                if (elemID) {
                    const elem = document.getElementById(elemID);
                    if (elem) {
                        elem.scrollIntoView();
                    }
                } else {
                    const elem = document.getElementById("app-content");
                    if (elem) {
                        elem.scrollTo(0, 0);
                    }
                }
            } else {
                // TODO: Require new page nav from worker.
            }
        }
    }
    return next(action);
}) as Redux.Middleware;
