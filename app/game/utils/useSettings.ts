import manifest from "~~/public/assets/manifest.json";

const KEY_PREFIX = "settings_";
const getRawKey = (key: string): string | null => {
  return localStorage.getItem(KEY_PREFIX + key);
};

const setRawKey = (key: string, value: string): void => {
  localStorage.setItem(KEY_PREFIX + key, value);
};

const settings = {
  get bundle(): string {
    const requested = getRawKey("bundle");
    return requested && manifest.bundles.some((m) => m.name === requested)
      ? requested
      : "base";
  },

  get showGrid(): boolean {
    return getRawKey("showGrid") !== "false";
  },

  get showRange(): boolean {
    return getRawKey("showRange") !== "false";
  },

  get uid(): string {
    let uid = getRawKey("uid");
    if (!uid) {
      uid = generateId("u");
      setRawKey("uid", uid);
    }
    return uid;
  },

  get username(): string {
    let username = getRawKey("username");
    if (!username) {
      username = generateId("Anonyme", 2);
      setRawKey("username", username);
    }
    return username;
  },
} as const;

export type Settings = typeof settings;
export type SettingsInterface = Settings & {
  set<K extends keyof Settings>(key: K, value: Settings[K]): void;
};

export default function useSettings(): SettingsInterface {
  if ("localStorage" in globalThis) {
    const activeSettings = { ...settings };

    return {
      ...activeSettings,

      set<K extends keyof Settings>(key: K, value: Settings[K]): void {
        if (key in activeSettings) {
          setRawKey(key, value.toString());
        } else {
          throw new Error(`Invalid settings key: ${key}`);
        }
      },
    };
  } else {
    return new Proxy(
      {},
      {
        get: (_, key) => {
          throw new Error(
            `Attempted to index settings with ${String(
              key
            )} but localStorage is not defined`
          );
        },
      }
    ) as any;
  }
}

export function test() {}
