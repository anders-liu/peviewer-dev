import * as React from "react";

import { PageHeader } from "./page-header";
import { PageNavList } from "./page-nav-list";
import { PageContent } from "./page-content";
import { PageFooter } from "./page-footer";

export class App extends React.Component {
    public render(): JSX.Element {
        return (
            <React.Fragment>
                <PageHeader />
                <PageNavList />
                <PageContent />
                <PageFooter />
            </React.Fragment>
        )
    }
}