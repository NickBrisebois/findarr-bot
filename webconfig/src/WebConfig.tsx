import React, { Component, Fragment } from 'react';
import './WebConfig.scss';
import { Container } from 'react-bootstrap';
import { SettingsContainer } from './views/SettingsContainer';

export class WebConfig extends Component {
    constructor(props: any) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <Fragment>
                <Container>
                    <SettingsContainer></SettingsContainer>
                </Container>
            </Fragment>
        );
    }
}
