// @flow
import { AsyncStorage } from 'react-native';

// Coprocessor for decoupling and serializing async functions.
// Executes f on each queued item.
// - f(item):
//     Async function which processes an item.
//     Executions of f will never overlap in time.
export class Sync {
	constructor(f) {
		this.queue = [];
		this.running = false;
		this.f = f;
	}

	// Push an item. (sync)
	push(item) {
		this.queue.push(item);
		this._kick();
	}

	_kick() {
		if (this.running) {
			return;
		}
		this.running = true;
		this._loop();
	}

	_loop() {
		if (this.queue.length == 0) {
			this.running = false;
			return;
		}

		const item = this.queue.shift();
		this.f(item).then(
			() => this._loop()
		);
	}
}

export const StorageWriter = new Sync(async (action) => {
	switch (action.type) {
		case 'put':
			//console.log("AsyncStorage set " + action.key + "...");
			await AsyncStorage.setItem(action.key, action.value);
			//console.log("AsyncStorage set done.");
			return;
		case 'delete':
			await AsyncStorage.removeItem(action.key);
			return;
		default:
			console.log("StorageWriter received unknown action ", action);
			return;
	}
});
StorageWriter.put = function(key: string, value: string) {
	this.push({type: 'put', key, value});
}
StorageWriter.delete = function(key: string) {
	this.push({type: 'delete', key});
}
