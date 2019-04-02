
import { Alert, AsyncStorage } from 'react-native';
import dispatcher from '../../AppDispatcher';
import { DocumentPicker } from 'expo';
import * as exports from '../exports';
import * as uploader from '../uploader';
import * as imageutils from '../imageutils';

jest.mock('../uploader');
jest.mock('AsyncStorage');
jest.mock('../imageutils');
jest.mock('../../AppDispatcher');
jest.mock('expo', ()=>({
    DocumentPicker: {
        getDocumentAsync: jest.fn(),
    }
}));
jest.mock('Alert', () => ({
    alert: jest.fn(),
}));

describe('exporting', () => {
    afterEach(() => jest.clearAllMocks());

    it('startExport', async () => {
        AsyncStorage.getAllKeys.mockReturnValue(Promise.resolve(['@Pots', '@ImageStore', '@DoNotExport']));
        AsyncStorage.multiGet.mockReturnValue(Promise.resolve([
            ['@Pots', '{pots}'],
            ['@ImageStore', '{images}'],
        ]));
        await exports.startExport(12345);

        expect(uploader.startExport).toHaveBeenCalledWith(12345, {
            '@Pots': '{pots}',
            '@ImageStore': '{images}',
        });
    });

    it('exportImage file', () => {
        const isReady = exports.exportImage(12345, {
            localUri: 'l.jpg',
            remoteUri: 'r.jpg',
            fileUri: 'f.jpg',
        });
        expect(isReady).toBeTruthy();
        expect(uploader.exportImage).toHaveBeenCalledWith(12345, 'f.jpg');
        expect(imageutils.saveToFile).not.toHaveBeenCalled();
    });


    it('exportImage save remote first', () => {
        const isReady = exports.exportImage(12345, {
            localUri: 'l.jpg',
            remoteUri: 'r.jpg',
        });
        expect(isReady).toBeFalsy();
        expect(uploader.exportImage).not.toHaveBeenCalled();
        expect(imageutils.saveToFile).toHaveBeenCalledWith('r.jpg', true);
    });

    it('exportImage save local first', () => {
        const isReady = exports.exportImage(12345, {
            localUri: 'l.jpg',
        });
        expect(isReady).toBeFalsy();
        expect(uploader.exportImage).not.toHaveBeenCalled();
        expect(imageutils.saveToFile).toHaveBeenCalledWith('l.jpg', false);
    });

    it('exportImage not exportable', () => {
        const isReady = exports.exportImage(12345, {});
        expect(isReady).toBeFalsy();
        expect(uploader.exportImage).not.toHaveBeenCalled();
        expect(imageutils.saveToFile).not.toHaveBeenCalled();
    });

    it('finishExport', () => {
        exports.finishExport(12345);
        expect(uploader.finishExport).toHaveBeenCalledWith(12345);
    });
});

describe('importing', () => {
    afterEach(() => jest.clearAllMocks());

    it('startImport', async () => {
        DocumentPicker.getDocumentAsync.mockReturnValue(Promise.resolve({type: 'success', uri: 'a.zip'}));
        await exports.startImport();
        expect(uploader.startImport).toHaveBeenCalledWith('a.zip');
    });

    it('startImport cancelled', async () => {
        DocumentPicker.getDocumentAsync.mockReturnValue(Promise.resolve({type: 'cancel'}));
        await exports.startImport();
        expect(uploader.startImport).not.toHaveBeenCalled();
        expect(dispatcher.dispatch).toHaveBeenCalledWith({type: 'import-cancel'});
    });

    it('importMetadata', async () => {
        jest.useFakeTimers();
        Alert.alert.mockImplementation(async (text, whoknows, array) => {
            return array[1].onPress();
        });
        await exports.importMetadata('{"key": "\\"value\\""}');
        jest.runAllTimers();

        expect(AsyncStorage.clear).toHaveBeenCalled();
        expect(AsyncStorage.multiSet).toHaveBeenCalledWith([['key', '"value"']])
        expect(dispatcher.dispatch).toHaveBeenCalledWith({type: 'imported-metadata'});
    });

    it('importMetadata not parsable', async () => {
        jest.useFakeTimers();
        await exports.importMetadata('this is not JSON');
        jest.runAllTimers();
        expect(dispatcher.dispatch.mock.calls[0][0]).toHaveProperty('type', 'import-failure');
    });

    it('importMetadata declined', async () => {
        jest.useFakeTimers();
        Alert.alert.mockImplementation(async (text, whoknows, array) => {
            return array[0].onPress();
        });
        await exports.importMetadata('{"key": "\\"value\\""}');
        jest.runAllTimers();

        expect(AsyncStorage.clear).not.toHaveBeenCalled();
        expect(AsyncStorage.multiSet).not.toHaveBeenCalled();
        expect(dispatcher.dispatch).not.toHaveBeenCalledWith({type: 'imported-metadata'});
        expect(dispatcher.dispatch).toHaveBeenCalledWith({type: 'import-cancel'});
    });

    it('importImage', () => {
        jest.useFakeTimers();
        exports.importImage('r.png');
        jest.runAllTimers();
        expect(imageutils.saveToFile).toHaveBeenCalledWith('r.png', true);
        expect(dispatcher.dispatch).toHaveBeenCalledWith({
            type: 'image-timeout',
            uri: 'r.png',
        });
    });
});
