/*
 * The public surface.
 *
 * This file is the answer to "what does this package promise?" — nothing is
 * public because it happens to live in `src/`. A component is public when it is
 * exported here, and until then it is scaffolding that consumers may not import.
 *
 * That distinction is the whole point of having the file. Without it, every
 * internal helper is a de facto part of the API the moment somebody deep-imports
 * it, and the first time you move a file you break someone.
 *
 * What each export promises, and for how long, is in `VERSIONING.md`. Read it
 * before adding a line here — adding an export is a release decision, not a
 * housekeeping one, and 📦 Release's gate 3 checks that this file and the
 * intent files agree.
 */

export { Button } from './components/Button/Button';
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  ButtonState,
} from './components/Button/Button';

export { Chip } from './components/Chip/Chip';
export type { ChipProps, ChipTone, ChipSize } from './components/Chip/Chip';

export { Eyebrow } from './components/Eyebrow/Eyebrow';
export type { EyebrowProps, EyebrowTone } from './components/Eyebrow/Eyebrow';

export { IconSlot } from './components/IconSlot/IconSlot';
export type {
  IconSlotProps,
  IconSlotSize,
} from './components/IconSlot/IconSlot';

export type { ComponentIntent } from './intent';
