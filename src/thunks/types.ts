import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { Action } from '../action';
import { FullState } from '../reducers/types';

export type PLThunkAction<R = any> = ThunkAction<
  Promise<R>,
  FullState,
  undefined,
  Action
>;
export type PLThunkDispatch = ThunkDispatch<FullState, undefined, Action>;
