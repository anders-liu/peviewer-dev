import * as React from "react";
import * as ReactRedux from "react-redux";

import * as S from "../store/state";

import { OpenFilePage } from "./open-file-page";
import { HeadersPage } from "./headers-page";
import { MetadataHeadersPage } from "./md-headers-page";
import { MdsTablePage } from "./mds-table-page";
import { PagedItemListPage } from "./paged-item-list-page";

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

        switch (pageData.nav.pageID) {
            case W.PageID.HEADERS:
                return <HeadersPage data={pageData as W.HeadersPageData} />;
            case W.PageID.MD_HEADERS:
                return <MetadataHeadersPage data={pageData as W.MetadataHeadersPageData} />;
            case W.PageID.MDS_TABLE:
                return <MdsTablePage data={pageData as W.MdsTablePageData} />;
            case W.PageID.MDS_STRINGS:
            case W.PageID.MDS_US:
            case W.PageID.MDS_GUID:
                return <PagedItemListPage data={pageData as W.PagedItemListPageData} />;
            default:
                return <div>Page not found.</div>;
        }
    }
}

export const PageContent = ReactRedux.connect(mapStateToProps)(PageContentClass);
