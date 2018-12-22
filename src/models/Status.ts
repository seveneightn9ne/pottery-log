
export type StatusString = 'notstarted' | 'thrown' | 'trimmed' | 'bisqued' | 'glazed' | 'pickedup';

(String.prototype as any).capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

type StatusFromJson = {
  [k: string]: number | string | Date | undefined;
  //[k in StatusString]: number | string | Date | undefined;
}
type BareStatus = {
  [k in StatusString]: Date | undefined;
}

export default class Status {
  // Immutable! Functions return copies.

  status: BareStatus;

  static empty(): BareStatus {
    return {
      notstarted: undefined,
      thrown: undefined,
      bisqued: undefined,
      trimmed: undefined,
      glazed: undefined,
      pickedup: undefined,
    };
  }

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

  constructor(from:
    {json: string}
    | {parsedJson: StatusFromJson}
    | {bareStatus: BareStatus}
   = {parsedJson: {}}) {

    if ('bareStatus' in from) {
      this.status = {...from.bareStatus};
      return;
    }

    this.status = Status.empty();
    let pullFrom: StatusFromJson;
    if ('json' in from) {
      try {
        pullFrom = JSON.parse(from.json);
      } catch (e) {
        console.log("Status failed to parse: " + from.json);
        console.warn(e);
        pullFrom = {};
      }
    } else {
      pullFrom = from.parsedJson;
    }

    Status.ordered().forEach(s => {
      const item = pullFrom[s];
      if (item != undefined) {
        this.status[s] = new Date(item);
      }
    });
  }

  toObj(): BareStatus {
    return {...this.status};
  }

  toJSON(): string {
    return JSON.stringify(this.toObj());
  }

  static dateText(date: Date | undefined): string | undefined  {
    if (date) {
      const dateStringLong = date.toDateString();
      const dateString = dateStringLong.substr(0, dateStringLong.length - 5);
      return dateString;
    }
    return undefined;
  }

  date(): Date | undefined {
    const status = this.currentStatus();
    return status ? this.status[status] : undefined;
  }

  dateText(): string | undefined {
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

  currentStatus(): StatusString | undefined {
   const statuses = Status.ordered();
    for (let i=0; i < statuses.length; i++) {
      if (this.status[statuses[i]]) {
        return statuses[i];
      }
    }
    return undefined;
  }

  withStatus(name: StatusString, date: Date): Status {
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
    return new Status({bareStatus: newFullStatus});
  }

  next(pretty: boolean = false): string | undefined {
    const current = this.currentStatus();
    let nextI;
    if (!current) {
      nextI = Status.ordered().length - 1;
    } else {
      const currentI = Status.ordered().indexOf(current);
      nextI = currentI - 1;
    }
    if (nextI >= 0) {
      return pretty ?
        Status.prettify(Status.ordered()[nextI]) :
        Status.ordered()[nextI];
    }
    return undefined;
  }

  prev(pretty: boolean = false): string | undefined {
    const current = this.currentStatus();
    if (!current) {
      return undefined;
    }
    const currentI = Status.ordered().indexOf(current);
    const prevI = currentI + 1;
    if (prevI < Status.ordered().length) {
      return pretty ?
        Status.prettify(Status.ordered()[prevI]) :
        Status.ordered()[prevI];
    }
    return undefined;
  }

  hasTimeline(): boolean {
    return this.currentStatus() != "thrown" && this.currentStatus() != "notstarted"
  }
}
