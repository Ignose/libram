import {
  cliExecute,
  getLocketMonsters,
  Monster,
  runCombat,
  setAutoAttack,
  toMonster,
} from "kolmafia";
import { Macro } from "../..";
import { have as haveItem } from "../../lib";
import { get } from "../../property";
import { $item } from "../../template-string";
import { clamp } from "../../utils";

// eslint-disable-next-line libram/verify-constants
export const locket = $item`Combat Lover's Locket`;

export function have(): boolean {
  return haveItem(locket);
}

/**
 * Filters the set of all unlocked locket monsters to only the ones available to be locketed right now.
 * @returns An array consisting of all Monsters you can fight with your locket right now.
 */
export function availableLocketMonsters(): Monster[] {
  if (reminiscesLeft() === 0) return [];
  return Object.entries(getLocketMonsters())
    .filter(([, unused]) => unused)
    .map(([name]) => toMonster(name));
}

/**
 * Parses getLocketMonsters and returns the collection of all Monsters as an Array.
 * @returns An array consisting of all Monsters you can hypothetically fight, regardless of whether they've been fought today.
 */
export function unlockedLocketMonsters(): Monster[] {
  return Object.entries(getLocketMonsters()).map(([name]) => toMonster(name));
}

/**
 * Determines how many reminisces remain by parsing the _locketMonstersFought property.
 * @returns The number of reminisces a player has available; 0 if they lack the Locket.
 */
export function reminiscesLeft(): number {
  return have()
    ? clamp(3 - get("_locketMonstersFought").split(",").length, 0, 3)
    : 0;
}

export function monstersReminisced(): Monster[] {
  return get("_locketMonstersFought")
    .split(",")
    .map((id) => toMonster(parseInt(id)));
}

/**
 * Fight a Monster using the Combat Lover's Locket
 * @param monster The Monster to fight
 * @param macro A Macro or Macro-extending-class-instance used to dictate our actions during this combat
 * @param useAuto Whether we should use an autoattack to resolve this combat
 * @returns false if we are unable to reminisce about this monster. Else, returns whether, at the end of all things, we have reminisced about this monster.
 */
export function reminisce<T extends Macro>(
  monster: Monster,
  macro: T,
  useAuto = false
): boolean {
  if (
    !have() ||
    reminiscesLeft() === 0 ||
    !availableLocketMonsters().includes(monster)
  ) {
    return false;
  }

  setAutoAttack(0);
  if (useAuto) macro.setAutoAttack();
  macro.save();

  try {
    cliExecute(`reminisce ${monster}`);
    runCombat();
  } finally {
    Macro.clearSaved();
    if (useAuto) setAutoAttack(0);
  }

  return monstersReminisced().includes(monster);
}
