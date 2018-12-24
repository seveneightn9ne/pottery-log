import Status, {StatusString} from './Status';

type BareNotes = {
  [key in StatusString]: string | undefined;
};

export default class Notes {

  public static empty(): BareNotes {
    return {
      notstarted: undefined,
      thrown: undefined,
      bisqued: undefined,
      trimmed: undefined,
      glazed: undefined,
      pickedup: undefined,
    };
  }
  // Immutable! Functions return copies.

  public notes: BareNotes;

  constructor(notes?: BareNotes) {
    if (!notes) {
      notes = Notes.empty();
    }

    this.notes = {...notes};
  }

  public toObj() {
    return {...this.notes};
  }

  public toJSON(): string {
    return JSON.stringify(this.toObj());
  }

  public isEmpty(): boolean {
    let empty = true;
    Status.ordered().forEach((s) => {
      if (this.notes[s]) {
        empty = false;
      }
    });
    return empty;
  }

  public withNoteForStatus(status: StatusString, note: string): Notes {
    return new Notes({...this.toObj(), [status]: note});
  }

  public forStatus(status: Status): string {
    const currentStatus = status.currentStatus();
    if (!currentStatus) {
      return '';
    }
    return this.notes[currentStatus] || '';
  }

  // Used for searching
  public includes(text: string): boolean {
    let contains = false;
    Status.ordered().forEach((s) => {
      const note = this.notes[s];
      if (note && note.includes(text)) {
        contains = true;
      }
    });
    return contains;
  }

}
