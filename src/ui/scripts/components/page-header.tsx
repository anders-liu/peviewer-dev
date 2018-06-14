import * as React from "react";
import * as ReactRedux from "react-redux";

import * as S from "../store/state";
import { NavLink } from "./nav-link";

interface ConnectedProps {
    fileInfo?: S.FileInfo;
    navList: W.NavData[];
}

function mapStateToProps(state: S.AppState): ConnectedProps {
    const { fileInfo, navList } = state;

    return {
        fileInfo,
        navList
    };
}

class PageHeaderClass extends React.Component<ConnectedProps> {
    public render(): JSX.Element {
        const { fileInfo } = this.props;

        return (
            <header id="app-header">
                {fileInfo ? this.renderFileInfo(fileInfo) : this.renderWelcome()}
                {!fileInfo && (
                    <div>PE Viewer is a simple single-page web application for viewing content of a PE (Portable Executable) file, which is the executabule file on Windows operating system and Microsoft .NET.</div>
                )}
            </header>
        )
    }

    private renderWelcome(): JSX.Element {
        return (
            <div className="pg-title-line">
                <h1 className="pg-title">Welcome to PE Viewer.</h1>
            </div>
        );
    }

    private renderFileInfo(fileInfo: S.FileInfo): JSX.Element {
        const { name, size, is32Bit, isManaged } = fileInfo;

        return (
            <React.Fragment>
                {this.renderTitleLine(fileInfo)}
                {this.renderNavList()}
            </React.Fragment>
        );
    }

    private renderTitleLine(fileInfo: S.FileInfo): JSX.Element {
        const { name, size, is32Bit, isManaged } = fileInfo;

        return (
            <div className="pg-title-line">
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
            </div>
        );
    }

    private renderNavList(): JSX.Element | null {
        const { navList } = this.props;
        if (!navList) {
            return null;
        }

        return (
            <div className="pg-navlst">
                <table>
                    <tbody>
                        {navList.map((v, i) => (
                            <tr key={i}>
                                <th><NavLink target={v.target} /></th>
                                <td>
                                    {v.children && v.children.map((cv, ci) => (
                                        <NavLink key={ci} target={cv.target} />
                                    ))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}

export const PageHeader = ReactRedux.connect(mapStateToProps)(PageHeaderClass);