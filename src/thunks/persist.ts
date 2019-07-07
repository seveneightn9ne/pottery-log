import _ from 'lodash';
import { Store } from 'redux';
import { Pot } from '../models/Pot';
import { FullState } from '../reducers/types';
import { IMPORT_STORAGE_KEY } from '../thunks/loadInitial';
import { StorageWriter } from '../utils/sync';

const makePersistingSubscriber = <T>(args: {
  name: string;
  shouldPersist: (
    prevState: FullState | undefined,
    newState: FullState,
  ) => [boolean, T];
  persist: (state: FullState, t: T) => void;
}) => (store: Store<FullState>) => {
  let prevState: FullState | undefined;
  store.subscribe(
    _.throttle(() => {
      const newState = store.getState();
      const [shouldPersist, stuffToPersist] = args.shouldPersist(
        prevState,
        newState,
      );
      if (shouldPersist) {
        args.persist(newState, stuffToPersist);
      }
      prevState = newState;
    }, 250),
  );
};

export const subscribeToPersistPotStore = makePersistingSubscriber<Pot[]>({
  name: 'pots',
  shouldPersist: (prevState, newState) => {
    if (prevState === undefined) {
      // not persisting the initial state
      return [false, []];
    }
    if (prevState.pots === newState.pots) {
      return [false, []];
    }
    if (!newState.pots.hasLoaded) {
      return [false, []];
    }
    const potsToPersist: Pot[] = _.values(newState.pots.pots).filter(
      (p) => p !== prevState.pots.pots[p.uuid],
    );
    if (potsToPersist.length > 0) {
      return [true, potsToPersist];
    }
    return [newState.pots.potIds !== prevState.pots.potIds, []];
  },
  persist: (newState, potsToPersist) => {
    StorageWriter.put('@Pots', JSON.stringify(newState.pots.potIds));

    potsToPersist.forEach((pot) =>
      StorageWriter.put('@Pot:' + pot.uuid, JSON.stringify(pot)),
    );
  },
});

export const subscribeToPersistImageStore = makePersistingSubscriber({
  name: 'images',
  shouldPersist: (prevState, newState) => [
    !!prevState &&
      prevState.images !== newState.images &&
      newState.images.loaded,
    {},
  ],
  persist: (newState) =>
    StorageWriter.put('@ImageStore', JSON.stringify(newState.images)),
});

export const subscribeToPersistImportStore = makePersistingSubscriber({
  name: 'import',
  shouldPersist: (prevState, newState) => [
    !!prevState &&
      prevState.imports !== newState.imports &&
      !newState.imports.resumable,
    {},
  ],
  persist: (newState) => {
    if (!newState.imports.importing) {
      StorageWriter.delete(IMPORT_STORAGE_KEY);
    } else {
      StorageWriter.put(IMPORT_STORAGE_KEY, JSON.stringify(newState.imports));
    }
  },
});
