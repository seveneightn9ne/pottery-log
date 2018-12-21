// @flow
import Status from './Status';
import Notes from './Notes';

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
