// Usage: npx ts-node merge-exports.ts exp1.zip exp2.zip exportName
const AdmZip = require("adm-zip");
const fs = require("fs-extra").promises;
const {createReadStream} = require("fs");
const fetch = require("node-fetch");
const _ = require("lodash");
var FormData = require('form-data');

// Copied from src/utils/uploader.ts
const apiPrefix = 'https://jesskenney.com/pottery-log/';
const EXPORT_START = apiPrefix + 'export';
const EXPORT_IMAGE = apiPrefix + 'export-image';
const EXPORT_FINISH = apiPrefix + 'finish-export';

main();

async function main() {
    const exports = getExports();
    const name = getOutputFilename();
    const tmpFolderName = await setupTmpFolder(name);
    await extractImages(exports, tmpFolderName);

    const metadatas = exports.map(getMetadata);// as [Metadata, Metadata];
    const metadata = metadataToString(mergeMetadatas(metadatas));

    await startExport(metadata, name);

    await exportImages(tmpFolderName, name);

    const result = await finishExport(name);
    console.log(`Done! ${result}`)
}

function getExports() {
    // argv:
    // 0: node
    // 1: src/scripts/merge-exports.js
    // 2: export1.zip
    // 3: export2.zip
    // 4: output.json
    const files = process.argv.slice(2, 4);
    if (!files || files.length !== 2 || !files[0] || !files[1]) {
      throw Error("Two export file arguments are required");
    }
    return files.map(f => new AdmZip(f));
}

/** @type {(exports: AdmZip[], tmpFolderName: string) => Promise<null>} */
async function extractImages(exports, tmpFolderName) {
    exports.forEach((exp, i) => {
        console.log(`Extracting images (${i+1}/${exports.length})...`);
        exp.extractAllTo(tmpFolderName, true /* overwrite */);
    });
    await fs.unlink(`${tmpFolderName}/metadata.json`);
}

/** @type {(outputFilename: string) => Promise<string>} */
async function setupTmpFolder(outputFilename) {
    const parts = outputFilename.split("/");

    const folderName = parts[parts.length - 1].replace(/\.\w+$/, "");
    const folderFullPath = `/tmp/${folderName}`;

    console.log(`Setting up temp dir at ${folderFullPath}...`)
    await fs.rmdir(folderFullPath, {recursive: true});
    await fs.mkdir(folderFullPath, {recursive: true});

    return folderFullPath;
}

function getOutputFilename() {
    const [filename] = process.argv.slice(4, 5);
    if (!filename) {
      throw Error("Output filename is required");
    }
    return filename
        .replace(/\.[\w]+$/, "") // remove file type suffix
        .replace(/^.*\//g, ""); // remove any folder prefix
}

function getMetadata(zipFile) { //: AdmZip): Metadata {
    const entry = zipFile.getEntry("metadata.json");
    if (!entry) {
        throw Error("Zip file has no metadata.json")
    }
    const metadataStr = entry.getData().toString('utf8');
    const metadata = JSON.parse(metadataStr);
    const images /*: {[name: string]: ImageState}*/ = JSON.parse(metadata["@ImageStore"]).images;
    const pots = {};
    JSON.parse(metadata["@Pots"]).forEach((id/*: string*/) => {
        const potState = JSON.parse(metadata["@Pot:" + id])
        if (!potState) {
            fail(`Pot ${id} is causing trouble`);
        }
        pots[id] = potState;
    });
    if (Object.keys(images).length == 0) {
        throw Error(`No images: ${images}`);
    }
    if (Object.keys(pots).length == 0) {
        throw Error(`No pots: ${JSON.stringify(pots)}`);
    }
    return { images, pots };
}

function mergeMetadatas([m1, m2]) { //: [Metadata, Metadata]): Metadata {
    const metadata /*: Metadata*/ = {
        images: {...m1.images},
        pots: {...m1.pots},
    };
    Object.keys(m2.images).forEach(imageName => {
        if (imageName in metadata.images) {
            throw Error(`Duplicate imageName: ${imageName}`);
        }
        metadata.images[imageName] = m2.images[imageName];
    });
    Object.keys(m2.pots).forEach(potId => {
        if (potId in metadata.pots) {
            throw Error(`Duplicate potId: ${potId}`);
        }
        metadata.pots[potId] = m2.pots[potId];
    });
    return metadata;
}

function metadataToString(metadata) {
    const metadataObj = {
        "@ImageStore": JSON.stringify({images: metadata.images}),
        "@Pots": JSON.stringify(Object.keys(metadata.pots)),
    };
    for (let potId in metadata.pots) {
        metadataObj[`@Pot:${potId}`] = JSON.stringify(metadata.pots[potId]);
    }
    return JSON.stringify(metadataObj);
}

/** @type {(metadata: string, name: string) => Promise<null>} */
async function startExport(metadata, name) {
    console.log("Uploading metadata...")
    await doPost(EXPORT_START, {
        deviceId: name,
        metadata: metadata,
    });
}

/** @type {(folderName: string, exportName: string) => Promise<null>} */
async function exportImages(folderName, exportName) {
    const fileNames = await fs.readdir(folderName);
    for (let i=0; i<fileNames.length; i++) {
        const fileName = fileNames[i];
        const fullFilePath = `${folderName}/${fileName}`;
        console.log(`Uploading image (${i+1}/${fileNames.length})...`)
        await doPost(EXPORT_IMAGE, {
            deviceId: exportName,
            image: createReadStream(fullFilePath),
        });
        console.log(`Done uploading #${i+1}`)
    }
}

/** @type {(exportName: string) => Promise<string>} */
async function finishExport(exportName) {
    console.log("Finalizing export...")
    const response = await doPost(EXPORT_FINISH, {deviceId: exportName});
    return response.uri;
}

// Copied from src/utils/uploader.ts
/** @type {(path: string), kvs: {[k: string]: string}) => Promise<any>} */
async function doPost(path, kvs) {
    const formData = new FormData();
    _.forOwn(kvs, (val, key) => {
        formData.append(key, val);
    });

  const options = {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json',
    },
  };

  let error;
  for (let tries = 0; tries < 3; tries++) {
    try {
      const response = await fetch(path, options);
      if (response.ok) {
        const r = await response.json();
        if (r.status === 'ok') {
          return r;
        } else if (r.status === 'error') {
          error = r.message;
        }
      } else {
        error = response.statusText || `HTTP ${response.status}`;
        console.log(`Error accessing ${path}`, error);
      }
    } catch (reason) {
      console.log('Error accessing ' + path);
      console.warn(reason);
      error = reason;
    }
  }
  throw error;
}