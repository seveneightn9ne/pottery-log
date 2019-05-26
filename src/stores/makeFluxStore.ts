import { Action } from '../action';
import {ReduceStore} from 'flux/utils';
import dispatcher from '../AppDispatcher';

function makeFluxStore<S>(getInitialState: () => S, reducer: (state: S, action: Action) => S): ReduceStore<S, Action> {

    class FluxStore extends ReduceStore<S, Action> {
        constructor() {
            super(dispatcher);
        }

        getInitialState() {
            return getInitialState();
        }

        reduce(state: S, action: Action): S {
            return reducer(state, action);
        }

    }

    return new FluxStore();
}

export default makeFluxStore;