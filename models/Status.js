// @flow
import React from 'react';
import {Text} from 'react-native';

const NOTSTARTED = 'notstarted';
const THROWN = 'thrown';
const TRIMMED = 'trimmed';
const BISQUED = 'bisqued';
const GLAZED = 'glazed';
const PICKEDUP = 'pickedup';

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

  static progressive(name: string) {
    switch (name) {
      case BISQUED: return 'bisquing';
      case GLAZED: return 'glaze firing';
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

  constructor(status: Status) { // Or status with strings instead of dates.
    //console.log("Loading status.");
    if (typeof(status) == "string") {
      status = JSON.parse(status);
    }
    if (status) {
      //console.log("With existing status: " + JSON.stringify(status));
      Status.ordered().forEach(s => {
        //console.log("Looking for " + s + " in " + JSON.stringify(status) + " (it's " + status[s] + ")");
        if (status[s] != undefined) {
          //console.log("I see " + s);
          if (typeof(status[s]) == "string" || typeof(status[s]) == "number") {
            //console.log("Loading " + status[s] + " as a date.");
            this[s] = new Date(status[s]);
          } else {
            // It's already a date, I hope
            //console.log("It's already a date.");
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

  static dateText(date) {
    if (date) {
      const dateStringLong = date.toDateString();
      const dateString = dateStringLong.substr(0, dateStringLong.length - 5);
      return dateString;
    }
  }

  date(): Date {
    return this[this.currentStatus()];
  }

  dateText(): string {
    return Status.dateText(this.date());
  }

  text(): string {
    const statusText = this.currentStatus(true /** pretty **/);
    let dateText = this.dateText();
    const hour = 1000 * 60 * 60;
    const week = hour * 24 * 7;
    const oneWeekIsh = week - (12 * hour);
    const dateStyle = (new Date() - this.date() >= oneWeekIsh) ? {color: 'red'} : {color: undefined};
    return dateText ? (<Text>{statusText} on <Text style={dateStyle}>{dateText}</Text></Text>) : statusText;
  }

  currentStatus(pretty = false): string {
    const statuses = Status.ordered();
    for (let i=0; i < statuses.length; i++) {
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

  next(pretty = false): string {
    const currentI = Status.ordered().indexOf(this.currentStatus());
    const nextI = currentI - 1;
    if (nextI >= 0) {
      return pretty ?
        Status.prettify(Status.ordered()[nextI]) :
        Status.ordered()[nextI];
    }
  }
}