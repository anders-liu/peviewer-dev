import * as React from "react";
import * as ReactRedux from "react-redux";

import { renderTableTitle, renderSimpleStruct, renderGroupedStruct } from "./struct-data";
import { TopLink } from "./top-link";

interface MdsTablePageProps {
    data: W.MdsTablePageData;
}

export class MdsTablePage extends React.Component<MdsTablePageProps> {
    public render(): JSX.Element | null {
        const { data } = this.props;

        return (
            <section className="data-page">
                {renderGroupedStruct(data.tableHeader)}
                <TopLink />
                {this.renderTableList()}
                <TopLink />
            </section>
        );
    }

    private renderTableList(): JSX.Element {
        return (
            <div className="struct-data">
                {renderTableTitle(W.KnownTitle.MDT_LIST, W.KnownElemID.MDT_LIST)}
                <table className="struct-table">
                    <thead>
                        <tr className="st-hdr">
                            <th>Index</th>
                            <th>Name</th>
                            <th>Rows</th>
                            <th>Valid</th>
                            <th>Sorted</th>
                            <th>Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.data.tableInfo.map((v, i) => (
                            <tr key={i} className="st-tr">
                                <td>{v.index}</td>
                                <td>{v.name}</td>
                                <td>{v.rows}</td>
                                <td>{v.valid ? "X" : ""}</td>
                                <td>{v.sorted ? "X" : ""}</td>
                                <td></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
}
