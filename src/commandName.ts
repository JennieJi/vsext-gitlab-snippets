import { CMD_PREFIX } from './constants';

type Command =
  | 'showStared'
  | 'addHost'
  | 'publish'
  | 'download'
  | 'star'
  | 'unstar'
  | 'view';

export default function commandName(shorthand: Command) {
  return `${CMD_PREFIX}${shorthand}`;
}
