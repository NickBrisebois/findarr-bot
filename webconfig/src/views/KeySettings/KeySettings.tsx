import { Component, ReactElement } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FindarrApiService } from '../../services/findarr.api.service';
import { FindarrConfig } from '../../types';
import { Loading } from '../Loading/Loading';

interface KeySettingsState {
    isLoading: boolean;
}

export class KeySettings extends Component<any, KeySettingsState> {
    findarrApiService: FindarrApiService;
    config: FindarrConfig | null = null;

    constructor(props: any) {
        super(props);

        this.state = {
            isLoading: true,
        };

        this.findarrApiService = new FindarrApiService();
    }

    componentWillMount(): void {
        this.findarrApiService.getConfig().then((response: any) => {
            console.log(response);
        });
    }

    render(): ReactElement {
        const isLoading = this.state.isLoading;

        return (
            <div className="discord-settings">
                {isLoading && <Loading></Loading>}
                {!isLoading && (
                    <Form>
                        <Form.Group
                            className="mb-3"
                            controlId="formDiscordToken"
                        >
                            <Form.Label>Discord Token</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="AAAAAAAAAAAAAAAAAAAAAAAA.BBBBBB.CCCCCCCCCCCCCCCCCCCCCCCCCCC"
                            />
                            <Form.Text className="text-muted">
                                Your discord token which can be found{' '}
                                <a href="https://discord.com/developers/applications">
                                    here.
                                </a>
                            </Form.Text>
                        </Form.Group>

                        <Form.Group
                            className="mb-3"
                            controlId="formSonarrApiKey"
                        >
                            <Form.Label>Sonarr API Key</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="11a111a11a111a111111a1f11111aaa1"
                            />
                            <Form.Text className="text-muted">
                                Your Sonarr API key which can be found in
                                Settings -&gt; General -&gt; Security
                            </Form.Text>
                        </Form.Group>

                        <Form.Group
                            className="mb-3"
                            controlId="formRadarrApiKey"
                        >
                            <Form.Label>Radarr API Key</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="22a222a22a222a222222a2f22222aaa2"
                            />
                            <Form.Text className="text-muted">
                                Your Radarr API key which can be found in
                                Settings -&gt; General -&gt; Security
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formSonarrUrl">
                            <Form.Label>Sonarr URL</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="192.168.0.1:8989"
                            />
                            <Form.Text className="text-muted">
                                The URL of your Sonarr server
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formSonarrUrl">
                            <Form.Label>Radarr API Key</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="192.168.0.1:7878"
                            />
                            <Form.Text className="text-muted">
                                The URL of your Radarr server
                            </Form.Text>
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                )}
            </div>
        );
    }
}
