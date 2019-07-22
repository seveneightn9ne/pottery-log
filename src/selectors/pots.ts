import { Pot } from '../models/Pot';
import { StatusString } from '../models/Status';

/**
 * Returns the pots sorted by date, with pickedup pots sorted in reverse
 */
export function sort(allPots: Pot[]) {
  return [...allPots].sort((potA, potB) => {
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
    if (potA.status.currentStatus() === 'pickedup') {
      cmp *= -1;
    }
    return cmp;
  });
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
