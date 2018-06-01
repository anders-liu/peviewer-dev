import * as React from "react";

export class PageHeader extends React.Component {
    public render(): JSX.Element {
        return (
            <header id="app-header">
                <h1 className="pg-title">Welcome to PE Viewer.</h1>
            </header>
        )
    }
}