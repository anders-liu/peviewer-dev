import * as React from "react";
import * as ReactRedux from "react-redux";

export function renderSimpleStruct(s: W.SimpleStruct) {
    return (
        <div className="struct-data">
            {renderStructTitle(s.title)}
            <StructTable>
                {s.items && s.items.map((v, i) => renderStructItemRow(v, i))}
            </StructTable>
        </div>
    );
}

export function renderGroupedStruct(s: W.GroupedStruct) {
    return (
        <div className="struct-data">
            {renderStructTitle(s.title)}
        </div>
    );
}

function renderStructTitle(title: string): JSX.Element {
    return <h2>{title}</h2>;
}

function renderStructItemRow(item: W.StructItem, key: number): JSX.Element {
    const { offset, size, rawData, name, value, descriptions } = item;
    return (
        <tr key={key}>
            <td>{offset}</td>
            <td>{size}</td>
            <td>{rawData.map((v, i) => <div className="td-line" key={i}>{v}</div>)}</td>
            <td>{name}</td>
            <td>{value}</td>
            <td></td>
        </tr>
    );
}

function renderStructGroupTitleRow(title: string): JSX.Element {
    return (<tr><th colSpan={6}>{title}</th></tr>);
}

class StructTable extends React.Component {
    public render(): JSX.Element {
        return (
            <table className="struct-table">
                <thead>
                    <tr>
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