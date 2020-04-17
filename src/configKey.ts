import { CMD_PREFIX } from './constants';

type Key = 'hosts';

export default function configKey(key: Key) {
  return `${CMD_PREFIX}${key}`;
}
