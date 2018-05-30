import * as React from "react";
import * as ReactRedux from "react-redux";

import * as S from "../store/state";

import { OpenFilePage } from "./open-file-page";
import { HeadersPage } from "./headers-page";

interface ConnectedProps {
    pageData?: W.PageData;
}

function mapStateToProps(state: S.AppState): ConnectedProps {
    const { pageData } = state;

    return {
        pageData
    };
}

class PageContentClass extends React.Component<ConnectedProps> {
    public render(): JSX.Element {
        return (
            <section id="app-content">
                {this.renderContent()}
            </section>
        )
    }

    private renderContent(): JSX.Element {
        const { pageData } = this.props;

        if (pageData == null) {
            return <OpenFilePage />;
        }

        switch (pageData.id) {
            case W.PageID.HEADERS:
                return <HeadersPage data={pageData as W.HeadersPageData} />;
            default:
                return <div>Page not found.</div>;
        }
    }
}

export const PageContent = ReactRedux.connect(mapStateToProps)(PageContentClass);
