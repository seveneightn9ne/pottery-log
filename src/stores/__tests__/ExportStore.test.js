
import ExportStore from '../ExportStore';
import * as ImageStore from '../ImageStore';
import * as exports from '../../exports';

jest.mock('../../exports');
jest.mock('../ImageStore');

describe('ExportStore', () => {
    afterEach(() => jest.clearAllMocks());

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
        expect(state).toHaveProperty('exportingImages', true);
    });

    it('finishes export when there are no images', () => {
        ImageStore.ImageStore.getState.mockReturnValue({images: {}});

        const state = ExportStore.reduce({exportId: 1, exporting: true}, {type: 'export-started', exportId: 1});
        expect(exports.finishExport).toHaveBeenCalled();
    });

    it('adds an exported image', () => {
        const state = ExportStore.reduce({
            exportId: 1,
            exporting: true,
            exportingImages: true,
            imagesExported: 0,
            totalImages: 2,
        }, {
            type: 'export-image',
        });

        expect(exports.finishExport).not.toHaveBeenCalled();
        expect(state).toHaveProperty('imagesExported', 1);
        expect(state).toHaveProperty('totalImages', 2);
        expect(state).toHaveProperty('exportId', 1);
        expect(state).toHaveProperty('exporting', true);
    });

    it('finishes export', () => {
        const state = ExportStore.reduce({
            exportId: 1,
            exporting: true,
            exportingImages: true,
            imagesExported: 1,
            totalImages: 2,
        }, {
            type: 'export-image',
        });

        expect(exports.finishExport).toHaveBeenCalled();
        expect(state).toHaveProperty('imagesExported', 2);
        expect(state).toHaveProperty('totalImages', 2);
        expect(state).toHaveProperty('exportId', 1);
        expect(state).toHaveProperty('exporting', true);
        expect(state).not.toHaveProperty('exportingImages', true);
    });

    it('skips an image when not exportingImages', () => {
        const state = ExportStore.reduce({
            exportId: 1,
            exporting: true,
            imagesExported: 2,
            totalImages: 2,
        }, {
            type: 'export-image',
        });

        expect(exports.finishExport).not.toHaveBeenCalled();
        expect(state).toHaveProperty('imagesExported', 2);
        expect(state).toHaveProperty('totalImages', 2);
        expect(state).toHaveProperty('exportId', 1);
        expect(state).toHaveProperty('exporting', true);
        expect(state).not.toHaveProperty('exportingImages', false);
    })

    it('enqueues a new image', () => {
        exports.exportImage.mockReturnValue(true);

        const state = ExportStore.reduce({
            exportId: 1,
            exporting: true,
            exportingImages: true,
            imagesExported: 1,
            totalImages: 2,
        }, {
            type: 'image-file-created',
            fileUri: 'z.png',
        });

        expect(exports.exportImage).toHaveBeenCalled();
        expect(state).toHaveProperty('totalImages', 3);
        expect(state).toHaveProperty('imagesExported', 1);
        expect(state).toHaveProperty('exportId', 1);
        expect(state).toHaveProperty('exporting', true);
        expect(state).toHaveProperty('exportingImages', true);
    });

    it('returns uri after finishing', () => {
        const state = ExportStore.reduce({
            exportId: 1,
            exporting: true,
        }, {
            type: 'export-finished',
            uri: 'export-uri',
        });

        expect(state).toHaveProperty('exporting', false);
        expect(state).toHaveProperty('exportUri', 'export-uri');
    });

    it('cancels on error', () => {
        const state = ExportStore.reduce({
            exportId: 1,
            exporting: true,
            exportingImages: true,
            imagesExported: 1,
            totalImages: 2,
        }, {
            type: 'export-failure',
            error: 'unknown',
        });

        expect(state).toHaveProperty('exporting', false);

    });

    it('cancels on navigation', () => {
        const state = ExportStore.reduce({
            exportId: 1,
            exporting: true,
        }, {
            type: 'page-list',
        });

        expect(state).toEqual(ExportStore.getInitialState());
    });

    it('resets on settings navigation', () => {
        const state = ExportStore.reduce({
            exportId: 1,
            exporting: true,
        }, {
            type: 'page-settings',
        });

        expect(state).toEqual(ExportStore.getInitialState());
    });
});
