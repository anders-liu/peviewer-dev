import * as React from "react";
import * as ReactRedux from "react-redux";

import { renderTableTitle, renderGroupedStruct } from "./struct-data";
import { TopLink } from "./top-link";
import { NavLink } from "./nav-link";

interface PagedItemListPageProps {
    data: W.PagedItemListPageData;
}

export class PagedItemListPage extends React.Component<PagedItemListPageProps> {
    public render(): JSX.Element | null {
        const { data } = this.props;

        return (
            <section className="data-page">
                {this.renderPaging()}
                {renderGroupedStruct(data.items)}
                {this.renderPaging()}
                <TopLink />
            </section>
        );
    }

    private renderPaging(): JSX.Element | null {
        const { data } = this.props;
        if (!data.paging || data.paging.pageNavList.length == 1) {
            return null;
        }

        return (
            <div>
                {data.paging.pageNavList.map((v, i) => (
                    i == data.paging!.currentPageNumber ?
                        <strong key={i}>{v.title}</strong> :
                        <NavLink key={i} target={v} />
                ))}
            </div>
        );
    }
}
