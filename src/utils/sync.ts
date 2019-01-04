import { AsyncStorage } from 'react-native';

// Coprocessor for decoupling and serializing async functions.
// Executes f on each queued item.
// - f(item):
//     Async function which processes an item.
//     Executions of f will never overlap in time.
export class Sync<A> {
  private queue: A[];
  private running: boolean;
  private f: (a: A) => Promise<void>;
  constructor(f: (a: A) => Promise<void>) {
    this.queue = [];
    this.running = false;
    this.f = f;
  }

  // Push an item. (sync)
  public push(item: A) {
    this.queue.push(item);
    this.kick();
  }

  private kick() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.loop();
  }

  private loop() {
    const item = this.queue.shift();

    if (item === undefined) {
      this.running = false;
      return;
    }

    this.f(item).then(
      () => this.loop(),
    );
  }
}

type SWAction = Put | Delete;
interface Put {
  type: 'put';
  key: string;
  value: string;
}
interface Delete {
  type: 'delete';
  key: string;
}

// tslint:disable-next-line:max-classes-per-file
class CStorageWriter extends Sync<SWAction> {
  constructor() {
    super(async (action) => {
      switch (action.type) {
        case 'put':
          // console.log("AsyncStorage set " + action.key + "...");
          await AsyncStorage.setItem(action.key, action.value);
          // console.log("AsyncStorage set done.");
          return;
        case 'delete':
          await AsyncStorage.removeItem(action.key);
          return;
        default:
          console.log('StorageWriter received unknown action ', action);
          return;
      }
    });
  }

  public put(key: string, value: string) {
    this.push({type: 'put', key, value});
  }

  public delete(key: string) {
    this.push({type: 'delete', key});
  }
}

export const StorageWriter = new CStorageWriter();
