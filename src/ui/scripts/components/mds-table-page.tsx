import * as React from "react";
import * as ReactRedux from "react-redux";

import { renderSimpleStruct, renderGroupedStruct } from "./struct-data";
import { TopLink } from "./top-link";

interface MdsTablePageProps {
    data: W.MdsTablePageData;
}

export class MdsTablePage extends React.Component<MdsTablePageProps> {
    public render(): JSX.Element | null {
        const { data } = this.props;

        return (
            <section className="data-page">
                {renderGroupedStruct(data.mdTableHeader)}
                <TopLink />
            </section>
        );
    }
}
