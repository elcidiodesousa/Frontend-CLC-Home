import { Injectable } from '@angular/core';

export type ThemeMode = 'dark' | 'light';
export type ThemePalette = 'original' | 'violet' | 'blue' | 'emerald' | 'amber' | 'rose';

export interface ClcThemeSettings {
  mode: ThemeMode;
  palette: ThemePalette;
  compact: boolean;
  name: string;
  slogan: string;
}

@Injectable({providedIn: 'root'})
export class ThemeService {
  private readonly key = 'clc_settings_v17_1';
  private readonly defaults: ClcThemeSettings = {
    mode: 'light',
    palette: 'original',
    compact: false,
    name: 'CLC Home',
    slogan: 'Gestão de eventos e talentos'
  };

  load(): ClcThemeSettings {
    try {
      const stored = JSON.parse(localStorage.getItem(this.key) || '{}');
      return {...this.defaults, ...stored};
    } catch {
      return {...this.defaults};
    }
  }

  apply(settings: Partial<ClcThemeSettings> = this.load()): ClcThemeSettings {
    const resolved = {...this.defaults, ...settings};
    const root = document.documentElement;
    root.dataset['theme'] = resolved.mode;
    root.dataset['palette'] = resolved.palette;
    root.classList.toggle('compact-navigation', !!resolved.compact);
    return resolved;
  }

  save(settings: ClcThemeSettings): void {
    localStorage.setItem(this.key, JSON.stringify(settings));
    this.apply(settings);
  }
}
