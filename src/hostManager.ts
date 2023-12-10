import listManager from './listManager';
import { Host, HostRegistry } from './types';
import { Memento } from 'vscode';
import SnippetRegistry from './SnippetRegistry';
import configKey from './configKey';

const LAST_USE = configKey('lastUseHost');

export default function hostManager(state: Memento) {
  const helpers = listManager<Host>('hosts', (host: Host) => host.host, state);
  const registries: {
    [host: string]: SnippetRegistry
  } = {};
  const initRegistry = (host: Host) => {
    registries[host.host] = new SnippetRegistry(host);
  }
  const getById = (host: string): HostRegistry| undefined => {
    const item = helpers.getById(host);
    if (!item) { return; }
    if (!registries[host]) {
      initRegistry(item as Host);
    }
    return {
      ...item,
      registry: registries[host]
    };
  };
  const getLastUse = (): string => (state.get(LAST_USE) || helpers.get()?.[0]?.host || "");
  const setLastUse = (host: string) => {
    state.update(LAST_USE, host);
  }
  const add = (host: Host) => {
    helpers.add(host);
    initRegistry(host);
    setLastUse(host.host);
    return getById(host.host) as HostRegistry;
  };
  const remove = (host: string) => {
    helpers.remove(host);
    delete registries[host];
    if (getLastUse() === host) {
      setLastUse("");
    }
  };
  const update = (host: string, updatedItem: Partial<Host>) => {
    helpers.update(host, updatedItem);
    initRegistry(helpers.getById(host) as Host);
    return getById(host);
  }
  return {
    ...helpers,
    getById,
    add,
    remove,
    update,
    getLastUse,
    setLastUse
  };
}
