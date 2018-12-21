// @flow
import React from 'react';
import {Text, View} from 'react-native';
import styles from '../style';

const NOTSTARTED = 'notstarted';
const THROWN = 'thrown';
const TRIMMED = 'trimmed';
const BISQUED = 'bisqued';
const GLAZED = 'glazed';
const PICKEDUP = 'pickedup';

// $FlowFixMe
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

export default class Status {
  // Immutable! Functions return copies.

  notstarted: Date; // Created date
  thrown: Date;
  trimmed: Date;
  bisqued: Date;
  glazed: Date;
  pickedup: Date;

  static prettify(name: string) {
    return name.replace(PICKEDUP, 'picked up').replace(NOTSTARTED, 'not started');
  }

  static longterm(name: string) {
    switch (name) {
      case BISQUED: return 'bisquing';
      case GLAZED: return 'glaze firing';
      case PICKEDUP: return 'finished';
      case NOTSTARTED: return 'not started';
      default: return name;
    }
  }

  static progressive(name: string) {
    switch (name) {
      case THROWN: return 'throwing';
      case TRIMMED: return 'trimming';
      case BISQUED: return 'bisquing';
      case GLAZED: return 'glazing';
      case PICKEDUP: return 'finished';
      default: return name;
    }
  }

  static action(name: string) {
    switch (name) {
      case THROWN: return 'throw';
      case TRIMMED: return 'trim';
      case BISQUED: return 'bisque';
      case GLAZED: return 'glaze';
      case PICKEDUP: return 'pick up';
      default: return name;
    }
  }

  static ordered(): string[] {
    return [PICKEDUP, GLAZED, BISQUED, TRIMMED, THROWN, NOTSTARTED];
  }

  constructor(status: Status | Object) { // Or status with strings instead of dates.
    //console.log("Loading status.");
    if (typeof(status) == "string") {
      try {
        status = JSON.parse(status);
      } catch (e) {
        console.log("Status failed to parse: " + status);
        console.warn(e);
      }
    }
    if (status) {
      //console.log("With existing status: " + JSON.stringify(status));
      Status.ordered().forEach(s => {
        //console.log("Looking for " + s + " in " + JSON.stringify(status) + " (it's " + status[s] + ")");
        // $FlowFixMe
        if (status[s] != undefined) {
          //console.log("I see " + s);
          if (typeof(status[s]) == "string" || typeof(status[s]) == "number") {
            //console.log("Loading " + status[s] + " as a date.");
            // $FlowFixMe
            this[s] = new Date(status[s]);
          } else {
            // It's already a date, I hope
            //console.log("It's already a date.");
            // $FlowFixMe
            this[s] = status[s];
          }
        }
      });
    }
    //console.log("Done.");
  }

  toObj() {
    return {
      notstarted: this.notstarted,
      thrown: this.thrown,
      trimmed: this.trimmed,
      bisqued: this.bisqued,
      glazed: this.glazed,
      pickedup: this.pickedup,
    };
  }

  toJSON(): string {
    return JSON.stringify(this.toObj());
  }

  static dateText(date): string | undefined  {
    if (date) {
      const dateStringLong = date.toDateString();
      const dateString = dateStringLong.substr(0, dateStringLong.length - 5);
      return dateString;
    }
  }

  date(): Date {
    // $FlowFixMe
    return this[this.currentStatus()];
  }

  dateText(): string | undefined {
    return Status.dateText(this.date());
  }

  isOld(): boolean {
    const hour = 1000 * 60 * 60;
    const week = hour * 24 * 7;
    const oneWeekIsh = week - (12 * hour);
    return new Date() - this.date() > oneWeekIsh && this.currentStatus() != "pickedup";
  }

  text(): string {
    return this.currentStatus(true /** pretty */) + " on " + this.dateText();
  }

  currentStatus(pretty: boolean = false): string {
   const statuses = Status.ordered();
    for (let i=0; i < statuses.length; i++) {
      // $FlowFixMe
      if (this[statuses[i]]) {
        if (pretty) return Status.prettify(statuses[i]);
        return statuses[i];
      }
    }
    return 'unknown';
  }

  withStatus(name: string, date: Date): Status {
    //const pot = PotsStore.getState().pots[UIStore.getState().editPotId];
    //console.log("I see current status is " + JSON.stringify(pot.status));
    const prevDate = this.toObj()[name];
    date = date ? date : (prevDate ? prevDate : new Date());
    const newFullStatus = {
      ...this.toObj(),
      [name]: date,
    }
    //console.log("newFullStatus 0 is " + JSON.stringify(newFullStatus));
    const statuses = Status.ordered();
    const oldStatusIndex = statuses.indexOf(this.currentStatus());
    const newStatusIndex = statuses.indexOf(name);
    for (let i = oldStatusIndex; i < newStatusIndex; i++) {
      newFullStatus[statuses[i]] = undefined;
    }
    //console.log("The new status will be " + JSON.stringify(newFullStatus));
    return new Status(newFullStatus);
  }

  next(pretty: boolean = false): string | undefined {
    const currentI = Status.ordered().indexOf(this.currentStatus());
    const nextI = currentI - 1;
    if (nextI >= 0) {
      return pretty ?
        Status.prettify(Status.ordered()[nextI]) :
        Status.ordered()[nextI];
    }
  }

  prev(pretty: boolean = false): string | undefined {
    const currentI = Status.ordered().indexOf(this.currentStatus());
    const prevI = currentI + 1;
    if (prevI < Status.ordered().length) {
      return pretty ?
        Status.prettify(Status.ordered()[prevI]) :
        Status.ordered()[prevI];
    }
  }

  hasTimeline(): boolean {
    return this.currentStatus() != "thrown" && this.currentStatus() != "notstarted"
  }
}
