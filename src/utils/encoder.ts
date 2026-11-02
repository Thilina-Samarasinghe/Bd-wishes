import { isThemeId, type CardMode, type ThemeId } from '@/lib/themes';
import { isMusicTrack, type CardLang, type MusicTrack } from '@/lib/cardText';

export interface CardConfig {
  name: string;
  age?: string;
  wishes: string;
  theme: ThemeId;
  music: MusicTrack;
  effects: ('balloons' | 'candles' | 'confetti')[];
  imageUrl?: string;
  /** Language of the card itself. Older links do not have this. */
  lang?: CardLang;
  /** Dark or light look of the card itself. Older links keep the theme's native look. */
  mode?: CardMode;
}

export const DEFAULT_CONFIG: CardConfig = {
  name: "Alex",
  age: "",
  wishes: "Wishing you a day filled with laughter, love, and all your favorite things. May this year bring you endless joy and success!",
  theme: "gold",
  music: "music-box",
  effects: ["balloons", "candles", "confetti"],
  imageUrl: "",
  lang: "en",
  mode: "dark",
};

// Encodes the card config to a Base64 string
export function encodeConfig(config: CardConfig): string {
  try {
    const jsonStr = JSON.stringify(config);
    // encodeURIComponent + unescape + btoa handles Unicode characters (like emojis) properly
    const base64 = btoa(unescape(encodeURIComponent(jsonStr)));
    // Make it URL safe by replacing characters: + to -, / to _, and removing padding =
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (error) {
    console.error("Failed to encode configuration:", error);
    return "";
  }
}

// Decodes the CardConfig from a Base64 string
export function decodeConfig(str: string): CardConfig | null {
  if (!str) return null;
  try {
    // Restore URL-safe characters back to standard Base64
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding back if necessary
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = decodeURIComponent(escape(atob(base64)));
    const parsed = JSON.parse(jsonStr) as CardConfig;
    
    // Validate fields to ensure it adheres to CardConfig interface
    if (typeof parsed.name !== 'string') return null;
    if (typeof parsed.wishes !== 'string') return null;
    if (!isThemeId(parsed.theme)) parsed.theme = 'gold';
    if (!isMusicTrack(parsed.music)) parsed.music = 'none';
    if (parsed.lang !== 'en' && parsed.lang !== 'si') delete parsed.lang;
    if (parsed.mode !== 'dark' && parsed.mode !== 'light') delete parsed.mode;
    if (!Array.isArray(parsed.effects)) parsed.effects = ['balloons', 'candles', 'confetti'];
    
    return parsed;
  } catch (error) {
    console.error("Failed to decode configuration:", error);
    return null;
  }
}
