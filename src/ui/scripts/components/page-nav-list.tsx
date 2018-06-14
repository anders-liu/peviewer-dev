import * as React from "react";
import * as ReactRedux from "react-redux";

import * as S from "../store/state";
import { NavLink } from "./nav-link";

interface ConnectedProps {
    pageData?: W.PageData;
    navList: W.NavData[];
}

function mapStateToProps(state: S.AppState): ConnectedProps {
    const { pageData, navList } = state;

    return {
        pageData,
        navList
    };
}

class PageNavListClass extends React.Component<ConnectedProps> {
    public render(): JSX.Element | null {
        const { navList } = this.props;

        if (!navList || navList.length == 0) {
            return null;
        }

        return (
            <section id="app-nav-list">
                {this.renderNavList(navList)}
            </section>
        )
    }

    private renderNavList(data: W.NavData[]): JSX.Element {
        const { pageData } = this.props;
        return (
            <ul>
                {data.map((v, i) => (
                    <li key={i}>
                        <NavLink target={v.target} extraClass={this.isSelected(v.target) ? "strong" : ""} />
                        {v.children && this.renderNavList(v.children)}
                    </li>
                ))}
            </ul>
        );
    }

    private isSelected(target: W.NavTarget): boolean {
        const { pageData } = this.props;
        if (!pageData) return false;

        const { pageID, subID } = pageData.nav;
        return pageID == target.pageID && target.elemID == null
            && (subID == null || subID == target.subID);
    }
}

export const PageNavList = ReactRedux.connect(mapStateToProps)(PageNavListClass);