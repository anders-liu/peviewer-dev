import * as React from "react";
import * as ReactRedux from "react-redux";

import * as S from "../store/state";

interface ConnectedProps {
    fileInfo?: S.FileInfo;
}

function mapStateToProps(state: S.AppState): ConnectedProps {
    const { fileInfo } = state;

    return {
        fileInfo
    };
}

class PageHeaderClass extends React.Component<ConnectedProps> {
    public render(): JSX.Element {
        const { fileInfo } = this.props;

        return (
            <header id="app-header">
                {fileInfo ? this.renderFileInfo(fileInfo) : this.renderWelcome()}
            </header>
        )
    }

    private renderWelcome(): JSX.Element {
        return (
            <h1 className="pg-title">Welcome to PE Viewer.</h1>
        );
    }

    private renderFileInfo(fileInfo: S.FileInfo): JSX.Element {
        const { name, size, is32Bit, isManaged } = fileInfo;

        return (
            <React.Fragment>
                <h1 className="pg-title">{name}</h1>
                <div className="pg-finfo">
                    <span>{size.toLocaleString()} bytes.</span>

                    {is32Bit != null && (
                        <React.Fragment>
                            <span> | </span>
                            <span>{is32Bit ? "32-bit" : "64-bit"}</span>
                        </React.Fragment>
                    )}

                    {isManaged != null && (
                        <React.Fragment>
                            <span> | </span>
                            <span>{isManaged ? "managed" : "unmanaged"}</span>
                        </React.Fragment>
                    )}
                </div>
            </React.Fragment>
        );
    }
}

export const PageHeader = ReactRedux.connect(mapStateToProps)(PageHeaderClass);
