
import dispatcher from '../../AppDispatcher';
import * as uploader from '../uploader';

global.FormData = function() {
    this.append = jest.fn();
};

function mockFetchJson(val) {
    global.fetch = jest.fn().mockImplementation((path, options) => {
        return Promise.resolve({
            json: function() {
                return Promise.resolve(val);
            },
            ok: true,
        });
    });
    return global.fetch;
}

function mockFetchError() {
    global.fetch = jest.fn().mockImplementation((path, options) => {
        return Promise.reject('something is wrong');
    });
    return global.fetch;
}

function mockFetchError2() {
    global.fetch = jest.fn().mockImplementation((path, options) => {
        return Promise.resolve({
            ok: false,
            statusText: 'something is wrong',
        });
    });
    return global.fetch;
}
function expectFormValue(fetch, field, val) {
    expect(fetch.mock.calls[0][1].body.append).toHaveBeenCalledWith(field, val);
}

jest.mock('../../AppDispatcher');
jest.mock('expo', ()=>({
    Constants: {
        deviceId: '1001',
    },
}));

describe('uploader', () => {
    afterEach(() => jest.clearAllMocks());

    it('remove', () => {
        const fetch = mockFetchJson({status: "ok"});
        const uri = 'my-image-uri';
        uploader.remove(uri);
        expect(fetch).toHaveBeenCalled();
        expect(fetch.mock.calls[0][0]).toBe(uploader.IMAGE_DELETE);
        expectFormValue(fetch, 'uri', uri);
    });

    it('startExport', async () => {
        const fetch = mockFetchJson({status: "ok"});
        const id = 1;
        const metadata = {whatever: 'whatever'};
        const metadataJSON = JSON.stringify(metadata);

        await uploader.startExport(id, metadata);
        expect(fetch).toHaveBeenCalled();
        expect(fetch.mock.calls[0][0]).toBe(uploader.EXPORT_START);
        expectFormValue(fetch, 'deviceId', '1001');
        expectFormValue(fetch, 'metadata', metadataJSON);
        expect(dispatcher.dispatch).toBeCalledWith({
            type: 'export-started',
            exportId: id,
        });

    });

    it('startExport error', async () => {
        const fetch = mockFetchError();
        const id = 1;
        const metadata = {whatever: 'whatever'};

        await uploader.startExport(id, metadata);
        expect(dispatcher.dispatch).toBeCalledWith({
            type: 'export-failure',
            exportId: id,
            error: 'something is wrong',
        });
    });

    it('startExport error2', async () => {
        const fetch = mockFetchError2();
        const id = 1;
        const metadata = {whatever: 'whatever'};

        await uploader.startExport(id, metadata);
        expect(dispatcher.dispatch).toBeCalledWith({
            type: 'export-failure',
            exportId: id,
            error: 'something is wrong',
        });
    });

    it('exportImage', async () => {
        const fetch = mockFetchJson({status: "ok"});
        const id = 1;
        const uri = 'local/image.png';
        const onError = jest.fn();

        await uploader.exportImage(id, uri, onError);
        expect(fetch).toHaveBeenCalled();
        expect(fetch.mock.calls[0][0]).toBe(uploader.EXPORT_IMAGE);
        expectFormValue(fetch, 'deviceId', '1001');
        expectFormValue(fetch, 'image', {
            uri: uri,
            name: 'image.png',
            type: 'image/png',
        });
        expect(dispatcher.dispatch).toBeCalledWith({
            type: 'export-image',
            exportId: id,
            uri: uri,
        });
    });

    it('exportImage error', async () => {
        const fetch = mockFetchError();
        const id = 1;
        const uri = 'local/image.png';
        const onError = jest.fn();

        await uploader.exportImage(id, uri, onError);
        expect(onError).toHaveBeenCalled();
        expect(onError)
        expect(dispatcher.dispatch).toBeCalledWith({
            type: 'export-failure',
            exportId: id,
            error: 'something is wrong',
        });

    });

    it('finishExport', async () => {
        const fetch = mockFetchJson({
            status: 'ok',
            uri: 's3-uri',
        });
        const id = 1;

        await uploader.finishExport(id);
        expect(fetch).toHaveBeenCalled();
        expect(fetch.mock.calls[0][0]).toBe(uploader.EXPORT_FINISH);
        expectFormValue(fetch, 'deviceId', '1001');
        expect(dispatcher.dispatch).toBeCalledWith({
            type: 'export-finished',
            exportId: id,
            uri: 's3-uri',
        });
    });

    it('finishExport error', async () => {
        const fetch = mockFetchError();
        const id = 1;

        await uploader.finishExport(id);
        expect(dispatcher.dispatch).toBeCalledWith({
            type: 'export-failure',
            exportId: id,
            error: 'something is wrong',
        });
    });

    it('startImport', async () => {
        const fetch = mockFetchJson({
            status: 'ok',
            metadata: 'meta-data',
            image_map: {},
        });
        const uri = 'local/data.zip';

        await uploader.startImport(uri);
        expect(fetch).toHaveBeenCalled();
        expect(fetch.mock.calls[0][0]).toBe(uploader.IMPORT);
        expectFormValue(fetch, 'deviceId', '1001');
        expectFormValue(fetch, 'import', {
            uri: uri,
            name: 'data.zip',
            type: 'application/zip',
        });
        expect(dispatcher.dispatch).toBeCalledWith({
            type: 'import-started',
            metadata: 'meta-data',
            imageMap: {},
        });
    });

    it('startImport error', async () => {
        const fetch = mockFetchError();
        const id = 1;
        const uri = 'local/data.zip';

        await uploader.startImport(uri);
        expect(dispatcher.dispatch).toBeCalledWith({
            type: 'import-failure',
            error: 'something is wrong',
        });
    });

    it('startUrlImport', async () => {
        const fetch = mockFetchJson({
            status: 'ok',
            metadata: 'meta-data',
            image_map: {},
        });
        const uri = 'https://pottery-log-exports/data.zip';

        await uploader.startUrlImport(uri);
        expect(fetch).toHaveBeenCalled();
        expect(fetch.mock.calls[0][0]).toBe(uploader.IMPORT);
        expectFormValue(fetch, 'deviceId', '1001');
        expectFormValue(fetch, 'importURL', uri);
        expect(dispatcher.dispatch).toBeCalledWith({
            type: 'import-started',
            metadata: 'meta-data',
            imageMap: {},
        });
    });

    it('startUrlImport error', async () => {
        const fetch = mockFetchError();
        const id = 1;
        const uri = 'https://pottery-log-exports/data.zip';

        await uploader.startUrlImport(uri);
        expect(dispatcher.dispatch).toBeCalledWith({
            type: 'import-failure',
            error: 'something is wrong',
        });
    });
});
