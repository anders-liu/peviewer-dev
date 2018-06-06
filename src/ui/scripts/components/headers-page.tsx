import * as React from "react";
import * as ReactRedux from "react-redux";

import { renderSimpleStruct, renderGroupedStruct } from "./struct-data";
import { TopLink } from "./top-link";

interface HeadersPageProps {
    data: W.HeadersPageData;
}

export class HeadersPage extends React.Component<HeadersPageProps> {
    public render(): JSX.Element | null {
        const { data } = this.props;

        return (
            <section className="data-page">
                {renderSimpleStruct(data.dosHeader)}
                <TopLink />
                {renderSimpleStruct(data.peSignature)}
                <TopLink />
                {renderSimpleStruct(data.fileHeader)}
                <TopLink />
                {renderGroupedStruct(data.optionalHeader)}
                <TopLink />
                {renderGroupedStruct(data.dataDirectories)}
                <TopLink />
                {renderGroupedStruct(data.sectionHeaders)}
                <TopLink />
            </section>
        );
    }
}
