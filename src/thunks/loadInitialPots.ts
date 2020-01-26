import _ from 'lodash';
import { AsyncStorage } from 'react-native';
import Notes from '../models/Notes';
import { Image2, IntermediatePot, Pot } from '../models/Pot';
import Status from '../models/Status';
import { PotsStoreState } from '../reducers/types';
import * as imageutils from '../utils/imageutils';

export default async function loadInitialPots(
  isImport: boolean,
): Promise<{ pots: PotsStoreState; images2: Array<[Image2, string]> }> {
  const keys = await AsyncStorage.getAllKeys();
  const allPotKeys = keys.filter((k) => k.startsWith('@Pot:'));
  const potKvPairs = await AsyncStorage.multiGet([...allPotKeys, '@Pots']);
  let potIdsJson = null;
  const potsJson: { [uuid: string]: string } = {};
  potKvPairs.forEach(([key, val]) => {
    if (key.startsWith('@Pot:')) {
      const potId = key.substring(5);
      potsJson[potId] = val;
    }
    if (key === '@Pots') {
      potIdsJson = val;
    }
  });
  const { potIds, pots, images2 } = loadInitialPotsFromJson(
    isImport,
    potIdsJson,
    potsJson,
  );
  return {
    pots: {
      potIds,
      pots,
      hasLoaded: true,
    },
    images2,
  };
}

function loadInitialPotsFromJson(
  isImport: boolean,
  potIdsJson: string | null,
  allPotsJson: { [key: string]: string | null },
): {
  potIds: string[];
  pots: { [uuid: string]: Pot };
  images2: Array<[Image2, string]>;
} {
  let potIds: string[] = [];
  if (potIdsJson) {
    try {
      potIds = JSON.parse(potIdsJson) || [];
    } catch (error) {
      console.warn('Pot load failed to parse: ' + potIdsJson);
      // Cannot continue... the @Pots key is truthy but is not json-encoded?
      throw error;
    }
  }
  const pots: { [uuid: string]: Pot } = {};
  const allImages2: Array<[Image2, string]> = [];
  const newPotIds: string[] = [];
  potIds.forEach((id) => {
    const json = allPotsJson[id];
    if (!json) {
      console.warn(`@Pots has ${id} but there is no @Pot:${id} key`);
      return;
    }
    newPotIds.push(id);
    const { pot, images2 } = loadPotFromJson(json);
    if (pot) {
      pots[id] = pot;
    }
    if (images2) {
      images2.forEach((pair) => {
        allImages2.push(pair);
      });
    }
  });
  return { pots, potIds: newPotIds, images2: allImages2 };
}

// async function loadPot(dispatch: Dispatch, uuid: string): Promise<Pot | null> {
//   const loadedJson = await AsyncStorage.getItem("@Pot:" + uuid);
//   return loadPotFromJson(loadedJson);
// }

function loadPotFromJson(
  loadedJson: string | null,
): { pot: Pot | null; images2: Array<[Image2, string]> } {
  if (!loadedJson) {
    return { pot: null, images2: [] };
  }
  const images2: Array<[Image2, string]> = [];
  // Don't catch, we want to know if this fails
  const loaded = JSON.parse(loadedJson);

  // Add all fields, for version compatibility
  const pot: IntermediatePot = { ...loaded };
  pot.status =
    typeof loaded.status === 'string'
      ? new Status(JSON.parse(loaded.status))
      : new Status(loaded.status);

  pot.notes2 =
    typeof loaded.notes2 === 'string'
      ? new Notes(JSON.parse(loaded.notes2))
      : new Notes(loaded.notes2);

  if (loaded.notes !== undefined && typeof loaded.notes !== 'string') {
    delete pot.notes;
  }
  if (loaded.images !== undefined && loaded.images2 === undefined) {
    // migrate - read the old data and convert to the new one, Miles said
    // it's ok for his old clients to lose the images.
    console.log('Migrating images 1-2.');
    pot.images2 = [];
    for (const image of loaded.images) {
      pot.images2.push({
        localUri: image,
      });
    }
  }
  if (pot.images2 !== undefined && pot.images3 === undefined) {
    console.log('Migrating images 2-3.');
    pot.images2.forEach((i) => images2.push([i, pot.uuid])); // will add these to the image store
    pot.images3 = [];
    for (const image of pot.images2) {
      pot.images3.push(imageutils.nameFromUri(image.localUri));
    }
  }
  delete pot.images;
  delete pot.images2;
  return { pot, images2 };
}
