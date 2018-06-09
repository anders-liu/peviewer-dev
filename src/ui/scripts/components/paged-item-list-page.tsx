import * as React from "react";
import * as ReactRedux from "react-redux";

import { renderTableTitle, renderGroupedStruct } from "./struct-data";
import { TopLink } from "./top-link";
import { Paginate } from "./paginate";

interface PagedItemListPageProps {
    data: W.PagedItemListPageData;
}

export class PagedItemListPage extends React.Component<PagedItemListPageProps> {
    public render(): JSX.Element | null {
        const { data } = this.props;

        return (
            <section className="data-page">
                <Paginate />
                {renderGroupedStruct(data.items)}
                <Paginate />
                <TopLink />
            </section>
        );
    }
}
