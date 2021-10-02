import { Component, ReactElement } from 'react';
import { KeySettings } from './KeySettings/KeySettings';
import { Card } from 'react-bootstrap';
import './SettingsContainer.scss';

interface SettingsContainerState {}

export class SettingsContainer extends Component<any, SettingsContainerState> {
    constructor(props: any) {
        super(props);

        this.state = {};
    }

    componentWillMount(): void {}

    render(): ReactElement {
        return (
            <div className="settings-container">
                <Card>
                    <Card.Body>
                        <KeySettings></KeySettings>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}
