import superagent from 'superagent';
import { instance, mock } from 'ts-mockito';

const mockSA = mock(superagent);
export const mockSuperagent = instance(mockSA);

/*
export const mockSuperagent = {
    get: mock(),
    put: mock(),
    delete: mock(),
    post: mock(),
    query: mock(),
    field: mock(),
    set: mock(),
    accept: mock(),
    timeout: mock(),
};

*/
