// @flow
import React from 'react';
import {Text} from 'react-native';

export interface Pot {
  title: string,
  status: Status,
  images: string[],
  uuid: string,
  notes: string,
}
