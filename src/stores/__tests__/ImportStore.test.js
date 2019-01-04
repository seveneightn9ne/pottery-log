
import * as exports from '../../utils/exports';
import ImportStore from '../ImportStore';

jest.mock('../../utils/exports');

describe('ImportStore', () => {
    afterEach(() => jest.clearAllMocks());

    it('initial state', () => {
        const initialState = ImportStore.getInitialState();
        expect(initialState).toEqual({importing: false});
    });

    it('initiate', () => {
        const state = ImportStore.reduce(
            {importing: false},
            {type: 'import-initiate'});
        expect(state).toHaveProperty('importing', true);
        expect(exports.startImport).toHaveBeenCalled();
    });

    it('imports metadata', () => {
        const metadata = 'some-metadata';
        const state = ImportStore.reduce({
            importing: true,
        }, {
            type: 'import-started',
            metadata,
            imageMap: {'a': 'a.png'},
        });

        expect(exports.importMetadata).toHaveBeenCalledWith(metadata);
        expect(state).toHaveProperty('importing', true);
        expect(state).toHaveProperty('imageMap', {'a': {uri: 'a.png'}});
    });

    it('imports first 3 images', () => {
        const state = ImportStore.reduce({
            importing: true,
            imageMap: {
                'a': {uri: 'a.png'},
                'b': {uri: 'b.png'},
                'c': {uri: 'c.png'},
                'd': {uri: 'd.png'},
            },
        }, {
            type: 'imported-metadata',
        });

        expect(exports.importImage).toHaveBeenCalledTimes(3);
        expect(state).toHaveProperty('totalImages', 4);
        expect(state).toHaveProperty('imagesImported', 0);
    });

    it('finishes import with no images', () => {
        const state = ImportStore.reduce({
            importing: true,
            imageMap: {},
        }, {
            type: 'imported-metadata',
        });

        expect(state).toHaveProperty('importing', false);
    });

    it('starts a new image after one finishes', () => {
        const state = ImportStore.reduce({
            importing: true,
            imagesImported: 0,
            totalImages: 4,
            imageMap: {
                'a': {uri: 'a.png', started: true},
                'b': {uri: 'b.png', started: true},
                'c': {uri: 'c.png', started: true},
                'd': {uri: 'd.png'},
            },
        }, {
            type: 'image-file-created',
            name: 'a',
        });

        expect(exports.importImage).toHaveBeenCalledTimes(1);
        expect(exports.importImage).toHaveBeenCalledWith('d.png');
        expect(state).toHaveProperty('imagesImported', 1);
        expect(state.imageMap).not.toHaveProperty('a');
    });

    it('doesn\'t start an import when the rest are done', () => {
        const state = ImportStore.reduce({
            importing: true,
            imagesImported: 0,
            totalImages: 3,
            imageMap: {
                'a': {uri: 'a.png', started: true},
                'b': {uri: 'b.png', started: true},
                'c': {uri: 'c.png', started: true},
            },
        }, {
            type: 'image-file-created',
            name: 'a',
        });

        expect(exports.importImage).not.toHaveBeenCalled();
        expect(state).toHaveProperty('imagesImported', 1);
        expect(state.imageMap).not.toHaveProperty('a');
    });

    it('finishes after all images imported', () => {
        const state = ImportStore.reduce({
            importing: true,
            imagesImported: 3,
            totalImages: 4,
            imageMap: {
                'a': {uri: 'a.png', started: true},
            },
        }, {
            type: 'image-file-created',
            name: 'a',
        });

        expect(state).toHaveProperty('importing', false);
    });

    it('retries a failed image', () => {
        const state = ImportStore.reduce({
            importing: true,
            imagesImported: 0,
            totalImages: 1,
            imageMap: {'a.png': {uri: 'r/a.png', started: true}},
        }, {
            type: 'image-file-failed',
            uri: 'r/a.png',
        });

        expect(exports.importImage).toHaveBeenCalledWith('r/a.png');

    });

    it('doesn\'t retry a failed image not in map', () => {
        const state = ImportStore.reduce({
            importing: true,
            imagesImported: 0,
            totalImages: 1,
            imageMap: {'b.png': {uri: 'r/b.png', started: true}},
        }, {
            type: 'image-file-failed',
            uri: 'r/a.png',
        });

        expect(exports.importImage).not.toHaveBeenCalled();
    });

    it('retries a timeout', () => {
        const state = ImportStore.reduce({
            importing: true,
            imagesImported: 0,
            totalImages: 1,
            imageMap: {'a.png': {uri: 'r/a.png', started: true}},
        }, {
            type: 'image-timeout',
            uri: 'r/a.png',
        });

        expect(exports.importImage).toHaveBeenCalledWith('r/a.png');
    });

    it('doesn\'t retry a finished one', () => {
        const state = ImportStore.reduce({
            importing: true,
            imagesImported: 0,
            totalImages: 1,
            imageMap: {'a.png': {uri: 'r/a.png', started: true}},
        }, {
            type: 'image-timeout',
            uri: 'r/b.png',
        });

        expect(exports.importImage).not.toHaveBeenCalled();
    });

    it('cancels', () => {
        const state = ImportStore.reduce({
            importing: true,
            imagesImported: 0,
            totalImages: 1,
            imageMap: {'a.png': {uri: 'r/a.png', started: true}},
        }, {
            type: 'import-cancel',
        });
        expect(state).toEqual({importing: false});
    })

    it('cancels on error', () => {
        const state = ImportStore.reduce({
            importing: true,
            imagesImported: 0,
            totalImages: 1,
            imageMap: {'a.png': {uri: 'r/a.png', started: true}},
        }, {
            type: 'import-failure',
            error: 'unknown',
        });
        expect(state).toHaveProperty('importing', false);
    });

    it('cancels on navigation', () => {
        const state = ImportStore.reduce({
            importing: true,
            imagesImported: 0,
            totalImages: 1,
            imageMap: {'a.png': {uri: 'r/a.png', started: true}},
        }, {
            type: 'page-settings',
        });
        expect(state).toEqual({importing: false});
    });

    it('doesn\'t cancel on list navigation', () => {
        const prevState = {
            importing: true,
            imagesImported: 0,
            totalImages: 1,
            imageMap: {'a.png': {uri: 'r/a.png', started: true}},
        };
        const state = ImportStore.reduce(prevState, {
            type: 'page-list',
        });
        expect(state).toEqual(prevState);
    });
});
