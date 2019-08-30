import { Pot } from '../models/Pot';
import { StatusString } from '../models/Status';

type Order = 'asc' | 'desc';

/**
 * Returns the pots sorted by date, with pickedup pots sorted in reverse
 * Must only be used with a single status type, if order isn't provided
 * Because how would we know what order to put them in?
 */
export function sort(allPots: Pot[], order?: Order) {
  if (allPots.length === 0) {
    return [];
  }
  const status = allPots[0].status.currentStatus();

  debugPrint('About to sort', allPots);

  const result = [...allPots].sort((potA, potB) => {
    assertStatus(potA, status, order);
    assertStatus(potB, status, order);
    // Sort the pots by date most recent at bottom.
    // Except sort pots with that are 'Finished' most recent at top.
    const dA = potA.status.date();
    const dB = potB.status.date();
    if (!dA || !dB) {
      // one of the dates is undefined. whatever
      return 0;
    }
    const tA = dA.getTime();
    const tB = dB.getTime();
    let cmp = tA < tB ? -1 : tA > tB ? 1 : 0;
    if (
      order === 'desc' ||
      (order === undefined && potA.status.currentStatus() === 'pickedup')
    ) {
      // desc -> they get smaller -> date gets older. so newest first. 5/24 -> 5/23
      // picked up in this order because oldest at the far away bottom.
      cmp *= -1;
    }
    return cmp;
  });
  debugPrint('Did sort', result);
  return result;
}

export function filterBySearchTerm(pots: Pot[], searchTerm: string) {
  return pots.filter((pot) => {
    if (!searchTerm) {
      return true;
    }
    if (pot.title.includes(searchTerm)) {
      return true;
    }
    if (pot.notes2.includes(searchTerm)) {
      return true;
    }
    return false;
  });
}

export function filterByStatus(pots: Pot[], status: StatusString) {
  return pots.filter((pot) => pot.status.currentStatus() === status);
}

/**
 * When order is undefined the pot's status must equal the given status.
 */
function assertStatus(
  pot: Pot,
  status: StatusString,
  order: Order | undefined,
) {
  if (order === undefined) {
    if (pot.status.currentStatus() !== status) {
      throw Error('Cannot use pots.sort with multiple statuses');
    }
  }
}

const doDebug = false;
function debugPrint(msg: string, allPots: Pot[]) {
  if (doDebug) {
    console.log(
      msg + ': \n',
      allPots.map(
        (p) =>
          `${p.status.currentStatus()}\t${p.status.date()}\t${p.status
            .date()
            .getTime()}`,
      ),
    );
  }
}
