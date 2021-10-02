import { Component } from 'react';
import { Spinner } from 'react-bootstrap';
import './Loading.scss';

export class Loading extends Component {
    render() {
        return (
            <div className="loading">
                <Spinner animation="border" role="status"></Spinner>
                <span>Loading...</span>
            </div>
        );
    }
}
