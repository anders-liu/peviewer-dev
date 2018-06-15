import * as React from "react";
import * as ReactRedux from "react-redux";

import * as S from "../store/state";
import { NavLink } from "./nav-link";

interface ConnectedProps {
    fileInfo?: S.FileInfo;
    pageData?: W.PageData;
    navList: W.NavData[];
}

function mapStateToProps(state: S.AppState): ConnectedProps {
    const { fileInfo, pageData, navList } = state;
    return { fileInfo, pageData, navList };
}

class PageHeaderClass extends React.Component<ConnectedProps> {
    public render(): JSX.Element {
        const { fileInfo } = this.props;

        return (
            <header id="app-header">
                {fileInfo ? this.renderFileInfo() : this.renderWelcome()}
                {!fileInfo && (
                    <div>PE Viewer is a simple single-page web application for viewing content of a PE (Portable Executable) file, which is the executabule file on Windows operating system and Microsoft .NET.</div>
                )}
            </header>
        )
    }

    private renderWelcome(): JSX.Element {
        return (
            <div className="pg-title-line">
                <h1 className="pg-finame">Welcome to PE Viewer.</h1>
            </div>
        );
    }

    private renderFileInfo(): JSX.Element {
        const { fileInfo } = this.props;
        const { name, size, is32Bit, isManaged } = fileInfo!;

        return (
            <div className="pg-title-line">
                <h1 className="pg-finame">{name}</h1>
                {this.renderPageTitle()}
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
            </div>
        );
    }

    private renderPageTitle(): JSX.Element | null {
        const { pageData } = this.props;

        if (pageData && pageData.nav && pageData.nav.title) {
            return <h1 className="pg-title">{pageData.nav.title}</h1>;
        } else {
            return null;
        }
    }
}

export const PageHeader = ReactRedux.connect(mapStateToProps)(PageHeaderClass);