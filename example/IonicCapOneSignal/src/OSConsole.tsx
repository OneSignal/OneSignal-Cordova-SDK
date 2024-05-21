import React from 'react';

export interface Props {
    value: string;
}

export interface State { }

class OSConsole extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        // Replace newline characters with JSX <br> elements
        const formattedValue = this.props.value.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                <br />
            </React.Fragment>
        ));

        return (
            <div>{formattedValue}</div>
        );
    }
}

export default OSConsole;
