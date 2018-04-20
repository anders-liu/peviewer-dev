import * as Redux from "redux";
import * as A from "./actions";
import * as S from "./state";

export const appReducer = Redux.combineReducers({
    appInfo,
    fileInfo,
}) as Redux.Reducer<S.AppState>;

function appInfo(state: S.AppInfo | null = null, action: Redux.Action): S.AppInfo | null {
    return state;
}

function fileInfo(state: S.FileInfo | null = null, action: Redux.Action): S.FileInfo | null {
    switch (action.type) {
        case "OPEN_FILE": {
            const { file } = action as A.OpenFileAction;
            const { name, size } = file;
            return Object.assign({}, state, { name, size });
        }
        default: return state;
    }
}
