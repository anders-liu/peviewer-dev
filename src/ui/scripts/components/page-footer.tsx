import * as React from "react";
import * as ReactRedux from "react-redux";

import * as S from "../store/state";

interface ConnectedProps {
    appInfo: S.AppInfo;
}

function mapStateToProps(state: S.AppState): ConnectedProps {
    const { appInfo } = state;
    return {
        appInfo
    };
}

class PageFooterClass extends React.Component<ConnectedProps> {
    public render(): JSX.Element {
        const { appInfo } = this.props;
        const { title, version, author, homepage, bugsUrl, year } = appInfo;

        return (
            <footer id="app-footer">
                <div>{title}. Coypright &copy; {author} {year}. Version {version}</div>
                <div><a href={homepage} target="_blank">View on GitHub</a> | <a href={bugsUrl} target="_blank">Report Issue</a></div>
            </footer>
        )
    }
}

export const PageFooter = ReactRedux.connect(mapStateToProps)(PageFooterClass);
