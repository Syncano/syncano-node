/// <reference types="node" />

declare module 'watchr' {
  import {Stats, FSWatcher} from 'fs';
  import {EventEmitter} from 'events';

  export type ChangeType = 'update' | 'create' | 'delete';

  export type State = 'pending' | 'active' | 'deleted' | 'closed';

  export type Method = 'watch' | 'watchFile';

  export type ErrorCallback = (error?: Error) => void;

  export type StatCallback = (error?: Error, stat?: Stats) => void;

  export type ChangeListener = (changeType: ChangeType, fullPath: string, currentStat: Stats, prevStat: Stats) => void;

  export interface ResetOpts {
      reset?: boolean
  }

  export interface IgnoreOpts {
      ignorePaths?: boolean,
      ignoreHiddenFiles?: boolean,
      ignoreCommonPatterns?: boolean,
      ignoreCustomPatterns?: RegExp
  }

  export type WatcherOpts = IgnoreOpts & {
      stat?: Stats,
      interval?: number,
      persistent?: boolean,
      catchupDelay?: number,
      preferredMethods?: Method[],
      followLinks?: boolean
  }

  export interface WatcherConfig {
      stat?: Stats,
      interval: number,
      persistent: boolean,
      catchupDelay: number,
      preferredMethods: Method[],
      followLinks: boolean,
      ignorePaths: false | Array<string>,
      ignoreHiddenFiles: boolean,
      ignoreCommonPatterns: boolean,
      ignoreCustomPatterns?: RegExp
  }

  export class Stalker extends EventEmitter {
      watcher: Watcher;
      watchers: {[key: string]: Watcher};

      close(reason: string): Stalker;

      setConfig(...args: any[]): Stalker;

      watch(...args: any[]): Stalker;
  }

  export class Watcher extends EventEmitter {
      stalkers: Stalker[];
      path: string;
      stat: Stats;
      fswatcher: FSWatcher;
      children: {[key: string]: Stalker};
      state: State;
      listenerTaskGroup: any;
      listenerTimeout: number;
      config: WatcherConfig;

      setConfig(opts: WatcherOpts): Watcher;

      log(...args: any[]): Watcher;

      getStat(opts: ResetOpts, next: StatCallback): Watcher;

      close(reason?: string): Watcher;

      watch(next: Function): Watcher;
      watch(opts: ResetOpts, next: Function): Watcher;
  }

  export function open(path: string, changeListener: ChangeListener, next: ErrorCallback): Stalker;

  export function create(...args: any[]): Stalker;
}
