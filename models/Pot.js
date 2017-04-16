// @flow
import React from 'react';
import {Text} from 'react-native';
import Status from './Status.js';
import Notes from './Notes.js';

export interface Pot {
  title: string,
  status: Status,
  images: string[],
  uuid: string,
  //notes: string,
  notes2: Notes,
}
