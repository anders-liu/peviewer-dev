import * as React from "react";
import * as ReactRedux from "react-redux";

import * as A from "../store/actions";
import * as S from "../store/state";

interface ConnectedEvents {
    onFileSelected: (file: File) => void;
}

function mapDispatchToProps(dispatch: ReactRedux.Dispatch<S.AppState>): ConnectedEvents {
    return {
        onFileSelected: (file) => dispatch(A.createOpenFileAction(file))
    };
}

class OpenFilePageClass extends React.Component<ConnectedEvents> {
    public constructor(props: any) {
        super(props);
        this.onFileChange = this.onFileChange.bind(this);
    }

    public render(): JSX.Element {
        return (
            <section className="file-opener">
                <div>Select a file:</div>
                <div><input type="file" onChange={this.onFileChange}></input></div>
                <div>No data would be uploaded, everything is parsed locally.</div>
            </section>
        )
    }

    private onFileChange(ev: React.ChangeEvent<HTMLInputElement>): void {
        const { onFileSelected } = this.props;
        const fileList = ev.target.files;
        if (fileList && fileList.length > 0) {
            onFileSelected(fileList[0]);
        }
    }
}

export const OpenFilePage = ReactRedux.connect(null, mapDispatchToProps)(OpenFilePageClass);
