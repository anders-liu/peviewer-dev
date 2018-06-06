import * as React from "react";
import * as ReactRedux from "react-redux";

import { renderSimpleStruct, renderGroupedStruct } from "./struct-data";
import { TopLink } from "./top-link";

interface MetadataHeadersPageProps {
    data: W.MetadataHeadersPageData;
}

export class MetadataHeadersPage extends React.Component<MetadataHeadersPageProps> {
    public render(): JSX.Element | null {
        const { data } = this.props;

        return (
            <section className="data-page">
                {renderSimpleStruct(data.cliHeader)}
                <TopLink />
                {this.renderMetadataRoot()}
                {this.renderStreamHeaders()}
                {this.renderSNSignature()}
            </section>
        );
    }

    private renderMetadataRoot(): JSX.Element | undefined {
        const { data } = this.props;
        return data.metadataRoot && (
            <React.Fragment>
                {renderSimpleStruct(data.metadataRoot)}
                <TopLink />
            </React.Fragment>
        );
    }

    private renderStreamHeaders(): JSX.Element | undefined {
        const { data } = this.props;
        return data.streamHeaders && (
            <React.Fragment>
                {renderGroupedStruct(data.streamHeaders)}
                <TopLink />
            </React.Fragment>
        );
    }

    private renderSNSignature(): JSX.Element | undefined {
        const { data } = this.props;
        return data.snSignature && (
            <React.Fragment>
                {renderSimpleStruct(data.snSignature)}
                <TopLink />
            </React.Fragment>
        );
    }
}
