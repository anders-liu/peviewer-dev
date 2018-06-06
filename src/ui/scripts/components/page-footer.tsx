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
        const { title, version, author, homepage, bugsUrl, releaseNotesUrl, buildTimeLocal, year } = appInfo;

        return (
            <footer id="app-footer">
                <div><strong>{title}</strong></div>
                <div>Coypright &copy; {author} {year}</div>
                <div>Version {version}</div>
                <div>Last build: {buildTimeLocal}</div>
                <div><a href={`${releaseNotesUrl}#${version}`} target="_blank">Release Notes</a></div>
                <div><a href="/latest" target="_blank">Try Latest Build</a></div>
                <div><a href={homepage} target="_blank">View on GitHub</a></div>
                <div><a href={bugsUrl} target="_blank">Report Issue</a></div>
            </footer>
        )
    }
}

export const PageFooter = ReactRedux.connect(mapStateToProps)(PageFooterClass);
