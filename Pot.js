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
