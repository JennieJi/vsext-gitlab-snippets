import { Memento } from 'vscode';
import configKey, { ConfigKey } from './configKey';

export default function listManager<T>(
  _key: ConfigKey,
  getId: (item: T) => string,
  state: Memento
) {
  const key = configKey(_key);
  const get = () => (state.get(key) || {}) as T[];
  const add = (item: T) => {
    const existing = get();
    const id = getId(item);
    return state.update(key, [
      item,
      ...existing.filter((item) => getId(item) !== id),
    ]);
  };
  const remove = (item: T) => {
    const id = getId(item);
    return state.update(
      key,
      get().filter((item) => getId(item) !== id)
    );
  };
  return {
    key,
    get,
    add,
    remove,
  };
}
