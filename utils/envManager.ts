interface EnvConfig {
  VITE_API_BASE_URL: string;
  VITE_APP_VERSION: string;
  VITE_BUILD_TIME: string;
  VITE_ENABLE_DEBUG: boolean;
  VITE_DEFAULT_LANGUAGE: string;
  VITE_MAX_FILE_SIZE: number;
  VITE_TIMEOUT: number;
}

const DEFAULT_CONFIG: EnvConfig = {
  VITE_API_BASE_URL: 'https://fmea-backend.baipj123.workers.dev',
  VITE_APP_VERSION: '1.0.0',
  VITE_BUILD_TIME: new Date().toISOString(),
  VITE_ENABLE_DEBUG: false,
  VITE_DEFAULT_LANGUAGE: 'zh-CN',
  VITE_MAX_FILE_SIZE: 10 * 1024 * 1024,
  VITE_TIMEOUT: 30000
};

export class EnvManager {
  private static config: EnvConfig = DEFAULT_CONFIG;
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) {
      return;
    }

    this.config = {
      VITE_API_BASE_URL: this.getEnv('VITE_API_BASE_URL', DEFAULT_CONFIG.VITE_API_BASE_URL),
      VITE_APP_VERSION: this.getEnv('VITE_APP_VERSION', DEFAULT_CONFIG.VITE_APP_VERSION),
      VITE_BUILD_TIME: this.getEnv('VITE_BUILD_TIME', DEFAULT_CONFIG.VITE_BUILD_TIME),
      VITE_ENABLE_DEBUG: this.getEnv('VITE_ENABLE_DEBUG', 'false') === 'true',
      VITE_DEFAULT_LANGUAGE: this.getEnv('VITE_DEFAULT_LANGUAGE', DEFAULT_CONFIG.VITE_DEFAULT_LANGUAGE),
      VITE_MAX_FILE_SIZE: parseInt(this.getEnv('VITE_MAX_FILE_SIZE', String(DEFAULT_CONFIG.VITE_MAX_FILE_SIZE)), 10),
      VITE_TIMEOUT: parseInt(this.getEnv('VITE_TIMEOUT', String(DEFAULT_CONFIG.VITE_TIMEOUT)), 10)
    };

    this.initialized = true;
    this.logConfig();
  }

  private static getEnv(key: string, defaultValue: string): string {
    const value = import.meta.env[key];
    return value !== undefined ? value : defaultValue;
  }

  private static logConfig(): void {
    if (this.config.VITE_ENABLE_DEBUG) {
      console.log('Environment Configuration:', {
        ...this.config,
        VITE_API_BASE_URL: this.maskSensitive(this.config.VITE_API_BASE_URL)
      });
    }
  }

  private static maskSensitive(value: string): string {
    if (!value || value.length < 10) {
      return value;
    }
    return value.substring(0, 8) + '***';
  }

  static get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    if (!this.initialized) {
      this.initialize();
    }
    return this.config[key];
  }

  static getAll(): Readonly<EnvConfig> {
    if (!this.initialized) {
      this.initialize();
    }
    return { ...this.config };
  }

  static isDevelopment(): boolean {
    return import.meta.env.DEV;
  }

  static isProduction(): boolean {
    return import.meta.env.PROD;
  }

  static getApiBaseUrl(): string {
    return this.get('VITE_API_BASE_URL');
  }

  static getAppVersion(): string {
    return this.get('VITE_APP_VERSION');
  }

  static getBuildTime(): string {
    return this.get('VITE_BUILD_TIME');
  }

  static isDebugEnabled(): boolean {
    return this.get('VITE_ENABLE_DEBUG');
  }

  static getDefaultLanguage(): string {
    return this.get('VITE_DEFAULT_LANGUAGE');
  }

  static getMaxFileSize(): number {
    return this.get('VITE_MAX_FILE_SIZE');
  }

  static getTimeout(): number {
    return this.get('VITE_TIMEOUT');
  }

  static validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.VITE_API_BASE_URL) {
      errors.push('VITE_API_BASE_URL is required');
    } else {
      try {
        new URL(this.config.VITE_API_BASE_URL);
      } catch {
        errors.push('VITE_API_BASE_URL must be a valid URL');
      }
    }

    if (this.config.VITE_MAX_FILE_SIZE <= 0) {
      errors.push('VITE_MAX_FILE_SIZE must be greater than 0');
    }

    if (this.config.VITE_TIMEOUT <= 0) {
      errors.push('VITE_TIMEOUT must be greater than 0');
    }

    const validLanguages = ['zh-CN', 'en', 'de', 'ru', 'vi'];
    if (!validLanguages.includes(this.config.VITE_DEFAULT_LANGUAGE)) {
      errors.push(`VITE_DEFAULT_LANGUAGE must be one of: ${validLanguages.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const env = {
  get: <K extends keyof EnvConfig>(key: K): EnvConfig[K] => EnvManager.get(key),
  getAll: () => EnvManager.getAll(),
  isDevelopment: () => EnvManager.isDevelopment(),
  isProduction: () => EnvManager.isProduction(),
  getApiBaseUrl: () => EnvManager.getApiBaseUrl(),
  getAppVersion: () => EnvManager.getAppVersion(),
  getBuildTime: () => EnvManager.getBuildTime(),
  isDebugEnabled: () => EnvManager.isDebugEnabled(),
  getDefaultLanguage: () => EnvManager.getDefaultLanguage(),
  getMaxFileSize: () => EnvManager.getMaxFileSize(),
  getTimeout: () => EnvManager.getTimeout(),
  validate: () => EnvManager.validate()
};

export default EnvManager;