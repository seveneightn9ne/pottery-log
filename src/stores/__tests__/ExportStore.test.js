
import ExportStore from '../ExportStore';
import * as ImageStore from '../ImageStore';
import * as exports from '../../exports';

jest.mock('../../exports');
jest.mock('../ImageStore');

describe('ExportStore', () => {
    it('initial state', () => {
        const initialState = ExportStore.getInitialState();
        expect(initialState).toEqual({exporting: false});
    });

    it('initiate', () => {
        const state = ExportStore.reduce({exporting: false}, {type: 'export-initiate'});
        expect(state).toHaveProperty('exporting', true);
        expect(state).toHaveProperty('exportId');
        expect(exports.startExport).toHaveBeenCalled();
    });

    it('ignores wrong export id', () => {
        const initialState = {exporting: true, exportId: 1};
        const state = ExportStore.reduce(initialState, {type: 'export-failure', exportId: 2});
        expect(state).toEqual(initialState);
    });

    it('starts export on each image', () => {
        ImageStore.ImageStore.getState.mockReturnValue({images: {
            'a': {fileUri: 'a.png'},
            'b': {fileUri: 'b.png'},
            'c': {fileUri: 'c.png'},
        }});

        exports.exportImage.mockReturnValueOnce(false);
        exports.exportImage.mockReturnValue(true);

        const state = ExportStore.reduce({exportId: 1, exporting: true}, {type: 'export-started', exportId: 1});
        expect(exports.exportImage).toBeCalledTimes(3);
        expect(state).toHaveProperty('totalImages', 2);
        expect(state).toHaveProperty('imagesExported', 0);
        expect(state).toHaveProperty('exportId', 1);
        expect(state).toHaveProperty('exporting', true);
    });

    it('finishes export when there are no images', () => {
        ImageStore.ImageStore.getState.mockReturnValue({images: {}});

        const state = ExportStore.reduce({exportId: 1, exporting: true}, {type: 'export-started', exportId: 1});
        expect(exports.finishExport).toHaveBeenCalled();
    });

    it('adds an exported image', () => {

    });

    it('finishes export', () => {

    });

    it('enqueues a new image', () => {

    });

    it('returns uri after finishing', () => {

    });

    it('cancels on error', () => {

    });

    it('cancels on navigation', () => {

    });



});
