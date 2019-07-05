import _ from 'lodash';
import { Store } from 'redux';
import { Pot } from '../models/Pot';
import { FullState, PotsStoreState } from '../reducers/types';
import { StorageWriter } from '../utils/sync';

function shouldPersistState(
  prevState: PotsStoreState | undefined,
  newState: PotsStoreState,
): [boolean, Pot[]] {
  if (prevState === undefined) {
    // not persisting the initial state
    return [false, []];
  }
  if (prevState === newState) {
    return [false, []];
  }
  if (!newState.hasLoaded) {
    return [false, []];
  }
  const potsToPersist: Pot[] = _.values(newState.pots).filter(
    (p) => p !== prevState.pots[p.uuid],
  );
  if (potsToPersist.length > 0) {
    return [true, potsToPersist];
  }
  return [newState.potIds !== prevState.potIds, []];
}

export function subscribeToPersistPotStore(store: Store<FullState>) {
  let prevState: PotsStoreState | undefined;
  store.subscribe(() => {
    const newState = store.getState().pots;
    const [shouldPersist, potsToPersist] = shouldPersistState(
      prevState,
      newState,
    );
    if (shouldPersist) {
      StorageWriter.put('@Pots', JSON.stringify(newState.potIds));
    }
    potsToPersist.forEach((pot) =>
      StorageWriter.put('@Pot:' + pot.uuid, JSON.stringify(pot)),
    );
    prevState = newState;
  });
}
