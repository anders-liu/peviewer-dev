import * as React from "react";
import * as ReactRedux from "react-redux";

import * as A from "../store/actions";
import * as S from "../store/state";

import { NavLink } from "./nav-link";

interface ConnectedProps {
    paging?: W.Paging;
    pageData?: W.PageData;
}

function mapStateToProps(state: S.AppState): ConnectedProps {
    const pageData = state.pageData as W.PagedItemListPageData;
    const paging = pageData && pageData.paging;

    return {
        paging,
        pageData,
    };
}

interface ConnectedEvents {
    onSelectionChange: (target: W.NavTarget) => void;
}

function mapDispatchToEvents(dispatch: ReactRedux.Dispatch<S.AppState>): ConnectedEvents {
    return {
        onSelectionChange: (target: W.NavTarget) => { dispatch(A.createOpenNavAction(target)); }
    };
}

class PaginateClass extends React.Component<ConnectedProps & ConnectedEvents> {
    constructor(props: any) {
        super(props);
        this.handleSelectChange = this.handleSelectChange.bind(this);
    }

    public render(): JSX.Element | null {
        const { paging, pageData } = this.props;
        if (!paging || !pageData || paging.pageNavList.length == 1) {
            return null;
        }

        const { currentPageNumber, pageNavList } = paging;
        const { nav } = pageData;

        return (
            <div className="pgn">
                <NavLink
                    target={pageNavList[currentPageNumber - 1]}
                    disable={currentPageNumber <= 0}
                    text="< prev" />
                <select
                    onChange={this.handleSelectChange}
                    value={pageNavList[currentPageNumber].title}>
                    {paging.pageNavList.map((v, i) => (
                        <option key={i}>{v.title}</option>
                    ))}
                </select>
                <NavLink
                    target={pageNavList[currentPageNumber + 1]}
                    disable={currentPageNumber >= pageNavList.length - 1}
                    text="next >" />
            </div>
        );
    }

    private handleSelectChange(evt: React.ChangeEvent<HTMLSelectElement>): void {
        const { paging, onSelectionChange } = this.props;
        onSelectionChange(paging!.pageNavList[evt.currentTarget.selectedIndex]);
    }
}

export const Paginate = ReactRedux.connect(mapStateToProps, mapDispatchToEvents)(PaginateClass);
