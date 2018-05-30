import * as React from "react";
import * as ReactRedux from "react-redux";

import { renderSimpleStruct, renderGroupedStruct } from "./struct-data";

interface HeadersPageProps {
    data: W.HeadersPageData;
}

export class HeadersPage extends React.Component<HeadersPageProps> {
    public render(): JSX.Element | null {
        const { data } = this.props;

        return (
            <section className="data-page">
                {renderSimpleStruct(data.dosHeader)}
                {renderSimpleStruct(data.peSignature)}
                {renderSimpleStruct(data.fileHeader)}
                {renderGroupedStruct(data.optionalHeader)}
                {renderGroupedStruct(data.dataDirectories)}
                {renderGroupedStruct(data.sectionHeaders)}
            </section>
        );
    }
}
