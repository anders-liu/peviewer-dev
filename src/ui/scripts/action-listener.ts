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
                scrollElement(elemID);
            }
            break;
        }

        case A.ActionType.SET_PAGE_DATA: {
            const { data } = action as A.SetPageDataAction;
            scrollElement(data.nav.elemID);
            break;
        }
    }
    return next(action);
}) as Redux.Middleware;

function scrollElement(elemID?: string): void {
    setTimeout(() => {
        if (elemID) {
            const elem = document.getElementById(elemID);
            if (elem) {
                elem.scrollIntoView();
            }
        } else {
            const elem = document.getElementById("app-content");
            if (elem) {
                elem.scrollTop = 0;
            }
        }
    }, 1);
}