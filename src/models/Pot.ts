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

export interface Image2 {
  localUri: string;
  remoteUri?: string;
}

// Includes all the old things
export interface IntermediatePot extends Pot {
  images: string[],
  images2: Image2[],
  notes: string,
}
