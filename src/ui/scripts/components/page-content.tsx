import * as React from "react";
import * as ReactRedux from "react-redux";

import * as S from "../store/state";

import { OpenFilePage } from "./open-file-page";

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
                <OpenFilePage />
            </section>
        )
    }
}

export const PageContent = ReactRedux.connect(mapStateToProps)(PageContentClass);
