import { Memento } from 'vscode';
import configKey, { ConfigKey } from './configKey';

export default function listManager<T>(_key: ConfigKey, state: Memento) {
  const key = configKey(_key);
  const get = () => (state.get(key) || []) as T[];
  const add = (item: T) => state.update(key, [item, ...get()]);
  const remove = (index: number) =>
    state.update(
      key,
      get().filter((item, i) => i !== index)
    );
  return {
    key,
    get,
    add,
    remove,
  };
}
