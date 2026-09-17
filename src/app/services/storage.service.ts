import { Injectable } from '@angular/core';
import { UserNode } from '../models/user.model';
import { Timings } from '../models/timings.model';
import { DEFAULT_TIMINGS, STORAGE_KEYS } from '../constants/instagram.constants';

declare const chrome: any;

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private hasChromeStorage(): boolean {
    return typeof chrome !== 'undefined' && !!chrome.storage?.local;
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    if (this.hasChromeStorage()) {
      return new Promise<T>((resolve) => {
        chrome.storage.local.get([key], (result: Record<string, any>) => {
          if (chrome.runtime.lastError || result[key] === undefined) {
            resolve(defaultValue);
          } else {
            resolve(result[key] as T);
          }
        });
      });
    }

    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    if (this.hasChromeStorage()) {
      return new Promise<void>((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => resolve());
      });
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  async loadWhitelist(): Promise<UserNode[]> {
    return this.get<UserNode[]>(STORAGE_KEYS.WHITELIST, []);
  }

  async saveWhitelist(whitelist: UserNode[]): Promise<void> {
    return this.set<UserNode[]>(STORAGE_KEYS.WHITELIST, whitelist);
  }

  async clearWhitelist(): Promise<void> {
    return this.set<UserNode[]>(STORAGE_KEYS.WHITELIST, []);
  }

  async loadTimings(): Promise<Timings> {
    const loaded = await this.get<Partial<Timings>>(STORAGE_KEYS.TIMINGS, DEFAULT_TIMINGS);
    return {
      timeBetweenSearchCycles: loaded.timeBetweenSearchCycles ?? DEFAULT_TIMINGS.timeBetweenSearchCycles,
      timeToWaitAfterFiveSearchCycles: loaded.timeToWaitAfterFiveSearchCycles ?? DEFAULT_TIMINGS.timeToWaitAfterFiveSearchCycles,
      timeBetweenUnfollows: loaded.timeBetweenUnfollows ?? DEFAULT_TIMINGS.timeBetweenUnfollows,
      timeToWaitAfterFiveUnfollows: loaded.timeToWaitAfterFiveUnfollows ?? DEFAULT_TIMINGS.timeToWaitAfterFiveUnfollows,
      usersPerSearchCycle: loaded.usersPerSearchCycle ?? DEFAULT_TIMINGS.usersPerSearchCycle,
    };
  }

  async saveTimings(timings: Timings): Promise<void> {
    return this.set<Timings>(STORAGE_KEYS.TIMINGS, timings);
  }

  async loadMockMode(): Promise<boolean> {
    return this.get<boolean>(STORAGE_KEYS.MOCK_MODE, false);
  }

  async saveMockMode(enabled: boolean): Promise<void> {
    return this.set<boolean>(STORAGE_KEYS.MOCK_MODE, enabled);
  }

  exportWhitelistAsJson(users: UserNode[]): void {
    if (users.length === 0) {
      alert('No hay usuarios en la lista blanca para exportar.');
      return;
    }
    const blob = new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instagram-whitelist-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  importWhitelistFromJson(file: File, current: UserNode[], mode: 'merge' | 'replace'): Promise<UserNode[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (!Array.isArray(parsed)) {
            return reject(new Error('Formato inválido: se esperaba una lista de usuarios.'));
          }
          const validUsers = parsed.filter((u) => u && typeof u.id === 'string' && typeof u.username === 'string');
          if (validUsers.length === 0 && parsed.length > 0) {
            return reject(new Error('Los usuarios del archivo no tienen los campos requeridos (id, username).'));
          }

          if (mode === 'replace') {
            resolve(validUsers);
          } else {
            const existingIds = new Set(current.map((u) => u.id));
            const newUsers = validUsers.filter((u) => !existingIds.has(u.id));
            resolve([...current, ...newUsers]);
          }
        } catch (err: any) {
          reject(new Error(`Error al leer archivo JSON: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
      reader.readAsText(file);
    });
  }

  exportUsersAsJson(users: UserNode[], filename = 'instagram_unfollowers.json'): void {
    const blob = new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  exportUsersAsCsv(users: UserNode[], filename = 'instagram_unfollowers.csv'): void {
    const headers = ['id', 'username', 'full_name', 'is_verified', 'is_private', 'profile_pic_url'];
    const rows = users.map((u) => [
      u.id,
      u.username,
      `"${(u.full_name || '').replace(/"/g, '""')}"`,
      u.is_verified,
      u.is_private,
      u.profile_pic_url,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}
