// @flow
import Status from './Status.js';
import Notes from './Notes.js';

export interface Pot {
  title: string,
  status: Status,
  //images: string[],
  //images2: Image[],
  images3: string[],
  uuid: string,
  //notes: string,
  notes2: Notes,
}
