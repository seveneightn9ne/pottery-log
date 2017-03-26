// @flow

export interface Pot {
  title: string,
  status: Status,
  images: string[],
  uuid: string,
}

export class Status {
  // Immutable! Functions return copies.
  static ordered
  notstarted: Date; // Created date
  thrown: Date;
  trimmed: Date;
  bisqued: Date;
  glazed: Date;
  pickedup: Date;

  constructor(status: Status) { // Or status with strings instead of dates.
    if (status) {
      Status.ordered().forEach(s => {
        if (status[s]) {
          if (typeof(status[s]) == "string" || typeof(status[s]) == "number") {
            this[s] = new Date(status[s]);
          } else {
            // It's already a date, I hope
            this[s] = status[s];
          }
        }
      });
    }
  }

  static ordered(): string[] {
    return ['pickedup', 'glazed', 'bisqued', 'trimmed', 'thrown', 'notstarted'];
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

  text(): string {
    const status = this.currentStatus(true /** pretty **/);
    let date = this[status];
    if (date) {
      if (typeof(date) == "number") {
        console.log("Stop using Date.now!!");
        date = new Date(date);
      }
      const dateStringLong = date.toDateString();
      const dateString = dateStringLong.substr(0, dateStringLong.length - 5);
      return status + ' on ' + dateString;
    }
    return status;
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

  static prettify(name: string) {
    return name.replace('pickedup', 'picked up').replace('notstarted', 'not started');
  }

  withStatus(name: string, date: Date): Status {
    //const pot = PotsStore.getState().pots[UIStore.getState().editPotId];
    //console.log("I see current status is " + JSON.stringify(pot.status));
    if (!date) date = new Date();
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
    console.log("The new status will be " + JSON.stringify(newFullStatus));
    return new Status(newFullStatus);
  }
}
