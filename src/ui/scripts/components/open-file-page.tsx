import * as React from "react";
import * as ReactRedux from "react-redux";

import * as A from "../store/actions";
import * as S from "../store/state";

interface ConnectedProps {
    error?: string;
}

function mapStateToProps(state: S.AppState): ConnectedProps {
    const error = state.workerError;
    return { error };
}

interface ConnectedEvents {
    onFileSelected: (file: File) => void;
}

function mapDispatchToEvents(dispatch: ReactRedux.Dispatch<S.AppState>): ConnectedEvents {
    return {
        onFileSelected: (file) => dispatch(A.createOpenFileAction(file))
    };
}

class OpenFilePageClass extends React.Component<ConnectedProps & ConnectedEvents> {
    public constructor(props: any) {
        super(props);
        this.onFileChange = this.onFileChange.bind(this);
    }

    public render(): JSX.Element {
        return (
            <section className="file-opener">
                <div>Select a file:</div>
                <div><input type="file" onChange={this.onFileChange}></input></div>
                {this.renderErrorMsg()}
                <div className="info">No data would be uploaded, everything is parsed locally.</div>
            </section>
        )
    }

    private renderErrorMsg(): JSX.Element | null {
        const { error } = this.props;
        if (!error) return null;

        return (
            <div className="err">Failed to open the file: {error}</div>
        );
    }

    private onFileChange(ev: React.ChangeEvent<HTMLInputElement>): void {
        const { onFileSelected } = this.props;
        const fileList = ev.target.files;
        if (fileList && fileList.length > 0) {
            onFileSelected(fileList[0]);
        }
    }
}

export const OpenFilePage = ReactRedux.connect(mapStateToProps, mapDispatchToEvents)(OpenFilePageClass);
