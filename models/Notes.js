// @flow
import React from 'react';
import {Text} from 'react-native';
import Status from './Status.js';

export default class Notes {
  // Immutable! Functions return copies.

  constructor(notes: Notes) { // Or status with strings instead of dates.
    Status.ordered().forEach(s => {
      if (notes != undefined && notes[s] != undefined) {
        this[s] = notes[s];
      }
    });
  }

  toObj() {
    const obj = {}
    Status.ordered.forEach(s => {
      if (this[s]) {
        obj[s] = this[s];
      }
    });
    return obj;
  }

  toJSON(): string {
    return JSON.stringify(this.toObj());
  }

  withNoteForStatus(status: Status, note: string): Note {
    return new Note({...this.toObj(), [status.currentStatus()]: note});
  }

  forStatus(status: Status): string {
    return this[status.currentStatus()];
  }

}
