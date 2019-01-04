
import dispatcher from '../../AppDispatcher';
import { FileSystem } from 'expo';
import * as exports from '../exports';
import * as uploader from '../uploader';
import { saveToFile } from '../imageutils';

jest.mock('../uploader');
jest.mock('../../AppDispatcher');
jest.mock('expo', ()=>({
    FileSystem: {
        documentDirectory: 'test://document/directory/',
        makeDirectoryAsync: jest.fn().mockReturnValue(Promise.resolve()),
        getInfoAsync: jest.fn().mockReturnValue(Promise.resolve()),
        downloadAsync: jest.fn().mockReturnValue(Promise.resolve()),
        copyAsync: jest.fn().mockReturnValue(Promise.resolve()),
    }
}));

describe('saveToFile', () => {
    afterEach(() => jest.clearAllMocks());
    jest.useFakeTimers();

    it('saves remote image', async () => {
        await saveToFile('https://fake-url/image.png', true);
        jest.runAllTimers();
        expect(dispatcher.dispatch).toBeCalledWith({
            type: 'image-file-created',
            name: 'image.png',
            fileUri: expect.any(String),
        });
    });

    // TODO: need to test all the other cases..
});