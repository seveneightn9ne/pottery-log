// @flow
import React from 'react';
import {Text} from 'react-native';
import Status from './Status.js';

export default class Notes {
  // Immutable! Functions return copies.

  constructor(notes: Notes | Object) { // Or status with strings instead of dates.
    if (typeof(notes) == "string") {
      try {
        notes = JSON.parse(notes);
      } catch (err) {
        return;
      }
    }
    Status.ordered().forEach(s => {
      // $FlowFixMe
      if (notes != undefined && notes[s] != undefined) {
        // $FlowFixMe
        this[s] = notes[s];
      }
    });
  }

  toObj() {
    const obj = {}
    Status.ordered().forEach(s => {
      // $FlowFixMe
      if (this[s]) {
        obj[s] = this[s];
      }
    });
    return obj;
  }

  toJSON(): string {
    return JSON.stringify(this.toObj());
  }

  isEmpty(): boolean {
    let empty = true;
    Status.ordered().forEach(s => {
      // $FlowFixMe
      if (this[s]) {
        empty = false;
      }
    });
    return empty;
  }

  withNoteForStatus(status: string, note: string): Notes {
    return new Notes({...this.toObj(), [status]: note});
  }

  forStatus(status: Status): string {
    // $FlowFixMe
    return this[status.currentStatus()];
  }

  includes(text: string): boolean {
    let contains = false;
    Status.ordered().forEach(s => {
      // $FlowFixMe
      if (this[s] && this[s].includes(text)) {
        contains = true;
      }
    });
    return contains;
  }

}
