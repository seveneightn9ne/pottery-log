import _ from 'lodash';
import { fixPotsAndImages, migrateFromImages2 } from './loadInitialFixes';
import loadInitialImages, { saveImagesToFiles } from './loadInitialImages';
import loadInitialImport from './loadInitialImport';
import loadInitialPots from './loadInitialPots';
import { PLThunkAction, PLThunkDispatch, t } from './types';
import loadInitialSettings, { setDarkModeFromSetting } from './loadInitialSettings';
import { SettingsState } from '../reducers/types';

export function reloadFromImport(): PLThunkAction {
  return t('reloadFromImport', {}, async (dispatch: PLThunkDispatch) => {
    dispatch({
      type: 'initial-pots-images',
    });
    await dispatch(load(true));
    dispatch({
      type: 'imported-metadata',
    });
  });
}

export function loadInitial(): PLThunkAction {
  return load(false);
}

function load(isImport: boolean): PLThunkAction {
  return t('load', { isImport }, async (dispatch: PLThunkDispatch) => {
    // Note: the tests using mockAsyncStorage are dependent upon the order that items are loaded
    // from AsyncStorage.
    let settings: SettingsState | null = null;
    if (!isImport) {
      settings = await loadInitialSettings();
      setDarkModeFromSetting(settings);
    }

    let images = await loadInitialImages();
    let { pots, images2 } = await loadInitialPots(isImport);

    images2.forEach(([image, potId]) => {
      images = migrateFromImages2(images, image, potId);
    });

    const fixed = fixPotsAndImages(pots, images);
    pots = fixed.pots;
    images = fixed.images;

    const importt = isImport ? null : await loadInitialImport();
    dispatch({
      type: 'loaded-everything',
      pots,
      images,
      isImport,
      settings,
    });

    // Save remote/local URIs
    // we probably don't care about the result of promise, since it's opportunistic
    // so I don't think we have to wait for it to continue
    // especially since we don't want to delay offering to resume the import
    // btw, it had to be after we dispatch "loaded-everything"
    // so that the image store won't ignore saves to files
    saveImagesToFiles(dispatch, images);

    // console.log("will check importt");
    if (importt) {
      // console.log("will dispatch import-resume");
      dispatch({
        type: 'import-resume',
        data: importt,
      });
    }
  });
}
