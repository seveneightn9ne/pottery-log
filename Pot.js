// @flow

export interface Pot {
  title: string,
  status: Status,
  images: string[],
  uuid: string,
}

/*export class Pot {
  title: string;
  status: Status;
  images: string[];
  uuid: string;

  constructor(uuid = String(Math.random()).substring(2)) {
    this.uuid = uuid;
    this.status = {};
    this.title = "";
    this.images = [];
  }
}*/

export function statusText(potStatus: Status): string {
    const orderedStatuses = ['pickedup', 'glazed', 'bisqued', 'trimmed', 'thrown'];
    for (let i=0; i < orderedStatuses.length; i++) {
      const status = orderedStatuses[i];
      if (potStatus[status]) {
        const date = potStatus[status];
        const dateStringLong = date.toDateString();
        const dateString = dateStringLong.substr(0, dateStringLong.length - 5);
        return status + ' on ' + dateString;
      }
    }
    return '(status unknown)';
  }

export const PotStatus = {
  thrown: 'thrown',
  trimmed: 'trimmed',
  bisqued: 'bisqued',
  glazed: 'glazed',
  pickedup: 'pickedup',
}

export interface Status {
  thrown: Date;
  trimmed: Date;
  bisqued: Date;
  glazed: Date;
  pickedup: Date;
}
