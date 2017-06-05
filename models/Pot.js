// @flow
import React from 'react';
import {Text} from 'react-native';
import Status from './Status.js';
import Notes from './Notes.js';

export interface Image {
  localUri: string,
  remoteUri: string,
}
export interface Pot {
  title: string,
  status: Status,
  //images: string[],
  images2: Image[],
  uuid: string,
  //notes: string,
  notes2: Notes,
}
