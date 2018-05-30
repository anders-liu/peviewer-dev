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
    }
    return next(action);
}) as Redux.Middleware;
