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

  get useGrid(): boolean {
    return getRawKey("useGrid") !== "false";
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
      username = generateId("Annonyme");
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
    const err = () => {
      throw new Error("Settings are not available (localStorage not defined)");
    };
    return new Proxy(
      {},
      {
        get: err,
        set: err,
      }
    ) as any;
  }
}

export function test() {}
