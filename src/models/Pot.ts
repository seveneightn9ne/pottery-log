import Notes from "./Notes";
import Status from "./Status";

export interface Pot {
  title: string;
  status: Status;
  // images: string[],
  // images2: Image2[],
  images3: string[];
  uuid: string;
  // notes: string,
  notes2: Notes;
}

export interface Image2 {
  localUri: string;
  remoteUri?: string;
}

// Includes all the old things
export interface IntermediatePot extends Pot {
  images: string[];
  images2: Image2[];
  notes: string;
}

export function newPot() {
  return {
    uuid: String(Math.random()).substring(2),
    title: "New Pot",
    images3: [],
    status: new Status({ thrown: new Date() }),
    notes2: new Notes()
  };
}
