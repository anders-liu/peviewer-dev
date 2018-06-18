import * as React from "react";
import * as ReactRedux from "react-redux";
import { NavLink } from "./nav-link";

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
                        renderStructGroupTitleRow(gv.title, gi.toString(), gv.elemID)
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
            <td>{renderDescriptions(item.descriptions)}</td>
        </tr>
    );
}

function renderStructGroupTitleRow(title: string, key: string, elemID?: string): JSX.Element | null {
    return title ? (<tr key={key} className="st-grphdr"><th id={elemID} colSpan={6}>{title}</th></tr>) : null;
}

function renderDescriptions(desc?: W.ItemDescription[]): JSX.Element | null {
    return desc == null ? null : (
        <React.Fragment>
            {desc.filter(v => v != null).map((v, i) => renderDescription(v, i))}
        </React.Fragment>
    );
}

function renderDescription(desc: W.ItemDescription, key: number): JSX.Element | null {
    switch (desc.type) {
        case W.ItemDescriptionType.STR:
            return (
                <div key={key} className="st-des st-des-str">
                    {(desc as W.ItemSimpleDescription).content}
                </div>
            );
        case W.ItemDescriptionType.GRPL:
            return renderDescGrpl(desc as W.ItemGroupedLinesDescription, key);
        case W.ItemDescriptionType.NAV:
            return (
                <div key={key} className="st-des st-des-nav">
                    See: <NavLink target={(desc as W.ItemNavDescription).target} />
                </div>
            );
        case W.ItemDescriptionType.RVA: {
            const { sectionHeaderTarget, fileOffset, sectionOffset } = desc as W.ItemRvaDescription;
            return (
                <div key={key} className="st-des st-des-rva">
                    Offset={fileOffset},
                    [<NavLink target={sectionHeaderTarget} />]+{sectionOffset}
                </div>
            );
        }
        default:
            return null;
    }
}

function renderDescGrpl(desc: W.ItemGroupedLinesDescription, key: number): JSX.Element {
    return (
        <div key={key} className="st-des st-des-grpl">
            {desc.groups.map((v, i) => (
                <div key={i} className="st-des-grp">
                    {v.title && <div className="st-des-grp-t">{v.title}</div>}
                    {v.lines.map((vl, il) => (
                        <div key={il} className="st-des-grp-l">{vl}</div>
                    ))}
                </div>
            ))}
        </div>
    );
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