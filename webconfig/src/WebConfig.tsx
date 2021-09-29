import React, { Component, Fragment } from 'react';
import './WebConfig.scss';
import Button from 'react-bootstrap/Button';

type Props = {
    name: string;
};

export class WebConfig extends Component<Props> {
    static defaultProps = {
        name: 'Test',
    };

    constructor(props: Props) {
        super(props);
        this.state = {
            name: 'react',
        };
    }

    render() {
        return (
            <Fragment>
                <div className="container">
                    <p>{this.props.name}</p>
                </div>
            </Fragment>
        );
    }
}
