import * as React from "react";
import * as ReactRedux from "react-redux";

import * as S from "../store/state";
import { NavLink } from "./nav-link";

export interface ConnectedProps {
    pageID?: W.PageID;
}

function mapStateToProps(state: S.AppState): ConnectedProps {
    const { pageData } = state;

    return {
        pageID: pageData && pageData.nav.pageID
    };
}

class TopLinkClass extends React.Component<ConnectedProps> {
    public render(): JSX.Element | null {
        const { pageID } = this.props;

        if (!pageID) {
            return null;
        } else {
            const target: W.NavTarget = {
                pageID,
                title: W.KnownTitle.TOP
            };

            return (
                <div className="top-lnk">
                    <NavLink target={target} title="Back to top" />
                </div>
            );
        }
    }
}

export const TopLink = ReactRedux.connect(mapStateToProps)(TopLinkClass);