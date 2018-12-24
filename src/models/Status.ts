import _ from 'lodash';

export type StatusString = 'notstarted' | 'thrown' | 'trimmed' | 'bisqued' | 'glazed' | 'pickedup';

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type EmptyableBareStatus = {
  [k in StatusString]?: Date | undefined;
};

type EmptyStatus = {
  [k in StatusString]: undefined;
}

type BareStatus = EmptyStatus & (
  {notstarted: Date}
  | {thrown: Date}
  | {bisqued: Date}
  | {trimmed: Date}
  | {glazed: Date}
  | {pickedup: Date});

type StatusConstructor = {
  [k in StatusString]?: Date | string | number;
}

export default class Status {
  // Immutable! Functions return copies.

  // At least one field is definitely not undefined
  status: BareStatus;
/*
  private static empty(): EmptyableBareStatus {
    return {
      notstarted: undefined,
      thrown: undefined,
      bisqued: undefined,
      trimmed: undefined,
      glazed: undefined,
      pickedup: undefined,
    };
  }*/

  static prettify(name: StatusString): string {
    return name.replace('pickedup', 'picked up').replace('notstarted', 'not started');
  }

  static longterm(name: StatusString) {
    switch (name) {
      case 'bisqued': return 'bisquing';
      case 'glazed': return 'glaze firing';
      case 'pickedup': return 'finished';
      case 'notstarted': return 'not started';
      default: return name;
    }
  }

  static progressive(name: StatusString) {
    switch (name) {
      case 'thrown': return 'throwing';
      case 'trimmed': return 'trimming';
      case 'bisqued': return 'bisquing';
      case 'glazed': return 'glazing';
      case 'pickedup': return 'finished';
      default: return name;
    }
  }

  static action(name: StatusString) {
    switch (name) {
      case 'thrown': return 'throw';
      case 'trimmed': return 'trim';
      case 'bisqued': return 'bisque';
      case 'glazed': return 'glaze';
      case 'pickedup': return 'pick up';
      default: return name;
    }
  }

  static ordered(): StatusString[] {
    return ['pickedup', 'glazed', 'bisqued', 'trimmed', 'thrown', 'notstarted'];
  }

  static isValidStatus(status: EmptyableBareStatus): status is BareStatus {
    let isValid = false;
    Status.ordered().forEach(s => {
      if (status[s]) {
        isValid = true;
      }
    });
    return isValid;
  }

  constructor(from: Partial<StatusConstructor>) {

    const status: EmptyableBareStatus = {};

    _.forOwn(from, (item, _s) => {
      const s = _s as keyof EmptyableBareStatus;
      if (typeof(item) == "string" || typeof(item) == "number") {
        status[s] = new Date(item);
      } else {
        status[s] = item;
      }
    })

    if (Status.isValidStatus(status)) {
      this.status = status;
    } else {
      throw Error("Status must have a date");
    }
  }

  toObj(): BareStatus {
    return {...this.status};
  }

  toJSON(): string {
    return JSON.stringify(this.toObj());
  }

  static dateText(date: Date): string  {
    const dateStringLong = date.toDateString();
    const dateString = dateStringLong.substr(0, dateStringLong.length - 5);
    return dateString;
  }

  date(): Date {
    const date = this.status[this.currentStatus()];
    if (!date) {
      throw Error("Impossible condition: Current status must have a date.");
    }
    return date;
  }

  dateText(): string {
    return Status.dateText(this.date());
  }

  isOld(): boolean {
    const date = this.date();
    if (!date) {
      return false;
    }
    const hour = 1000 * 60 * 60;
    const week = hour * 24 * 7;
    const oneWeekIsh = week - (12 * hour);
    return new Date().getTime() - date.getTime() > oneWeekIsh && this.currentStatus() != "pickedup";
  }

  text(): string {
    const status = this.currentStatus();
    if (!status) {
      return "";
    }
    return Status.prettify(status) + " on " + this.dateText();
  }

  currentStatus(): StatusString {
    let current: StatusString | undefined = undefined;
    _.forEach(Status.ordered(), _s => {
      const s = _s as keyof BareStatus;
      if(this.status[s]) {
        current = s;
        return false;
      }
      return true;
   });
   if (current == undefined) {
    throw Error("Impossible condition: the status has no status");
   }
   return current;
  }

  withStatus(name: StatusString, date?: Date): Status {
    //const pot = PotsStore.getState().pots[UIStore.getState().editPotId];
    //console.log("I see current status is " + JSON.stringify(pot.status));
    const prevDate = this.toObj()[name];
    date = date ? date : (prevDate ? prevDate : new Date());
    const newFullStatus: BareStatus = {
      ...this.toObj(),
      [name]: date,
    }
    //console.log("newFullStatus 0 is " + JSON.stringify(newFullStatus));
    const statuses = Status.ordered();
    const prevStatus = this.currentStatus();
    if (prevStatus) {
      const oldStatusIndex = statuses.indexOf(prevStatus);
      const newStatusIndex = statuses.indexOf(name);
      for (let i = oldStatusIndex; i < newStatusIndex; i++) {
        newFullStatus[statuses[i]] = undefined;
      }
    }
    //console.log("The new status will be " + JSON.stringify(newFullStatus));
    return new Status(newFullStatus);
  }

  next(): StatusString | undefined {
    const current = this.currentStatus();
    let nextI;
    if (!current) {
      nextI = Status.ordered().length - 1;
    } else {
      const currentI = Status.ordered().indexOf(current);
      nextI = currentI - 1;
    }
    if (nextI >= 0) {
      return Status.ordered()[nextI];
    }
    return undefined;
  }

  prev(): StatusString | undefined {
    const current = this.currentStatus();
    if (!current) {
      return undefined;
    }
    const currentI = Status.ordered().indexOf(current);
    const prevI = currentI + 1;
    if (prevI < Status.ordered().length) {
      return Status.ordered()[prevI];
    }
    return undefined;
  }

  hasTimeline(): boolean {
    return this.currentStatus() != "thrown" && this.currentStatus() != "notstarted"
  }
}
