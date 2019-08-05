import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { Action } from '../action';
import { FullState } from '../reducers/types';

export type PLThunkAction<R = void> = PLThunkActionFn<R> & ThunkAnnotation;
export type PLSyncThunkAction<R = void> = PLSyncThunkActionFn<R> &
  ThunkAnnotation;

interface ThunkAnnotation {
  thunkName: string;
  thunkArgs: { [k: string]: any };
}

type PLSyncThunkActionFn<R = void> = ThunkAction<
  R,
  FullState,
  undefined,
  Action
>;

type PLThunkActionFn<R> = ThunkAction<Promise<R>, FullState, undefined, Action>;
export type PLThunkDispatch = ThunkDispatch<FullState, undefined, Action>;

export function t<R = any>(
  thunkName: string,
  thunkArgs: { [k: string]: any },
  p: PLThunkActionFn<R>,
): PLThunkAction<R> {
  // tslint:disable-next-line
  const r: PLThunkAction<R> = Object.assign(p, { thunkName, thunkArgs });
  return r;
}

export function tSync<R = any>(
  thunkName: string,
  thunkArgs: { [k: string]: any },
  p: PLSyncThunkActionFn<R>,
): PLSyncThunkAction<R> {
  // tslint:disable-next-line
  const r: PLSyncThunkAction<R> = Object.assign(p, { thunkName, thunkArgs });
  return r;
}
