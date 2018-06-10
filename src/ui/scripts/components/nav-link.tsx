import * as React from "react";
import * as ReactRedux from "react-redux";

import * as A from "../store/actions";
import * as S from "../store/state";

export interface NavLinkProps {
    target: W.NavTarget;
    disable?: boolean;
    text?: string;
    title?: string;
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
        const { target, disable, text, title, extraClass, onClick } = this.props;

        let className = "nav";
        if (disable) {
            className += " disabled"
        }
        if (extraClass) {
            className += " " + extraClass;
        }

        if (disable || !target) {
            return (
                <span className={className} title={title}>
                    {text}
                </span>
            );
        } else {
            return (
                <a className={className} title={title || target.title} onClick={onClick}>
                    {text || target.title}
                </a>
            );
        }
    }
}

export const NavLink = ReactRedux.connect(null, mapDispatchToEvents)(NavLinkClass);