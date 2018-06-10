import * as React from "react";
import * as ReactRedux from "react-redux";

export function renderTableTitle(title: string, elemID?: string): JSX.Element {
    return <h2 id={elemID} className="struct-title">{title}</h2>;
}

export function renderSimpleStruct(s: W.SimpleStruct): JSX.Element {
    return (
        <div className="struct-data">
            {renderStructTitle(s)}
            <StructTable>
                {s.items && s.items.map((v, i) => renderStructItemRow(v, i.toString()))}
            </StructTable>
        </div>
    );
}

export function renderGroupedStruct(s: W.GroupedStruct): JSX.Element {
    return (
        <div className="struct-data">
            {renderStructTitle(s)}
            <StructTable>
                {s.groups && s.groups.map((gv, gi) => {
                    return [
                        renderStructGroupTitleRow(gv.title, gi.toString())
                    ].concat(gv.items && gv.items.map((v, i) =>
                        renderStructItemRow(v, `${gi}.${i}`)) || []);
                })}
            </StructTable>
        </div>
    );
}

function renderStructTitle(s: W.StructData): JSX.Element {
    return renderTableTitle(s.title, s.elemID);
}

function renderStructItemRow(item: W.StructItem, key: string): JSX.Element {
    const { offset, size, rawData, name, value, descriptions } = item;
    return (
        <tr key={key} className="st-tr">
            <td>{offset}</td>
            <td>{size}</td>
            <td>{rawData.map((v, i) => <div className="td-line" key={i}>{v}</div>)}</td>
            <td>{name}</td>
            <td className="wrap">{value}</td>
            <td></td>
        </tr>
    );
}

function renderStructGroupTitleRow(title: string, key: string): JSX.Element | null {
    return title ? (<tr key={key} className="st-grphdr"><th colSpan={6}>{title}</th></tr>) : null;
}

class StructTable extends React.Component {
    public render(): JSX.Element {
        return (
            <table className="struct-table">
                <thead>
                    <tr className="st-hdr">
                        <th>Offset</th>
                        <th>Size</th>
                        <th>Raw Data</th>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.children}
                </tbody>
            </table>
        );
    }
}