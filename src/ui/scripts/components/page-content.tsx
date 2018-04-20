import * as React from "react";
import * as ReactRedux from "react-redux";

import * as S from "../store/state";

interface ConnectedProps {
}

function mapStateToProps(state: S.AppState): ConnectedProps {
    return {
    };
}

class PageContentClass extends React.Component<ConnectedProps> {
    public render(): JSX.Element {
        return (
            <section id="app-content">
                <div>Hello</div>
            </section>
        )
    }
}

export const PageContent = ReactRedux.connect(mapStateToProps)(PageContentClass);
