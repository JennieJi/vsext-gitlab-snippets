import { CMD_PREFIX } from './constants';

export type ConfigKey = 'hosts' | 'lastUseHost' | 'stared';

export default function configKey(key: ConfigKey) {
  return `${CMD_PREFIX}${key}`;
}
