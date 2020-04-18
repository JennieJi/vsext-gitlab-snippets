import { Memento } from 'vscode';
import configKey, { ConfigKey } from './configKey';

export default function listManager<T>(
  _key: ConfigKey,
  getId: (item: T) => string,
  state: Memento
) {
  const key = configKey(_key);
  const get = () => {
    const existing = (state.get(key) || []) as T[];
    return existing.filter((item) => !!getId(item));
  };
  const getById = (id: string) => get().find((item) => getId(item) === id);
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
    getById,
    add,
    remove,
  };
}
