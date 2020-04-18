import { CMD_PREFIX } from './constants';

export type Command =
  | 'addHost'
  | 'publish'
  | 'download'
  | 'star'
  | 'unstar'
  | 'viewSnippet'
  | 'toggleHost'
  | 'exploreMore';

export default function commandName(shorthand: Command) {
  return `${CMD_PREFIX}${shorthand}`;
}
