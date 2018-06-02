import * as React from "react";
import * as ReactRedux from "react-redux";

import * as A from "../store/actions";
import * as S from "../store/state";

export interface NavLinkProps {
    target: W.NavTarget;
    extraClass?: string;
}

interface ConnectedEvents {
    onClick: () => void;
}

function mapDispatchToEvents(dispatch: ReactRedux.Dispatch<S.AppState>, ownProps: NavLinkProps): ConnectedEvents {
    return {
        onClick: () => { dispatch(A.createOpenNavAction(ownProps.target)); }
    };
}

class NavLinkClass extends React.Component<NavLinkProps & ConnectedEvents> {
    public render(): JSX.Element {
        const { target, extraClass, onClick } = this.props;
        const { title } = target;

        let className = "nav";
        if (extraClass) {
            className += " " + extraClass;
        }

        return (
            <a className={className} title={title} onClick={onClick}>{title}</a>
        );
    }
}

export const NavLink = ReactRedux.connect(null, mapDispatchToEvents)(NavLinkClass);