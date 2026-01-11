import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EnvManager, env } from '../../utils/envManager';

describe('EnvManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    EnvManager['initialized'] = false;
    EnvManager['config'] = {
      VITE_API_BASE_URL: 'https://test.example.com',
      VITE_APP_VERSION: '2.0.0',
      VITE_BUILD_TIME: '2024-01-01T00:00:00.000Z',
      VITE_ENABLE_DEBUG: true,
      VITE_DEFAULT_LANGUAGE: 'en',
      VITE_MAX_FILE_SIZE: 5 * 1024 * 1024,
      VITE_TIMEOUT: 15000
    };
    EnvManager['initialized'] = true;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialize', () => {
    it('should initialize configuration from environment variables', () => {
      EnvManager['initialized'] = false;
      EnvManager.initialize();

      expect(EnvManager['initialized']).toBe(true);
      expect(EnvManager.get('VITE_API_BASE_URL')).toBeDefined();
    });

    it('should not reinitialize if already initialized', () => {
      EnvManager['initialized'] = true;
      const originalConfig = { ...EnvManager['config'] };

      EnvManager.initialize();

      expect(EnvManager['config']).toEqual(originalConfig);
    });
  });

  describe('get', () => {
    it('should return value for valid key', () => {
      const value = EnvManager.get('VITE_API_BASE_URL');
      expect(value).toBe('https://test.example.com');
    });

    it('should return value for app version', () => {
      const value = EnvManager.get('VITE_APP_VERSION');
      expect(value).toBe('2.0.0');
    });

    it('should return boolean for enable debug', () => {
      const value = EnvManager.get('VITE_ENABLE_DEBUG');
      expect(value).toBe(true);
    });

    it('should return number for max file size', () => {
      const value = EnvManager.get('VITE_MAX_FILE_SIZE');
      expect(value).toBe(5 * 1024 * 1024);
    });

    it('should return number for timeout', () => {
      const value = EnvManager.get('VITE_TIMEOUT');
      expect(value).toBe(15000);
    });

    it('should initialize if not already initialized', () => {
      EnvManager['initialized'] = false;
      const value = EnvManager.get('VITE_DEFAULT_LANGUAGE');
      expect(value).toBeDefined();
      expect(EnvManager['initialized']).toBe(true);
    });
  });

  describe('getAll', () => {
    it('should return all configuration values', () => {
      const config = EnvManager.getAll();

      expect(config).toHaveProperty('VITE_API_BASE_URL');
      expect(config).toHaveProperty('VITE_APP_VERSION');
      expect(config).toHaveProperty('VITE_BUILD_TIME');
      expect(config).toHaveProperty('VITE_ENABLE_DEBUG');
      expect(config).toHaveProperty('VITE_DEFAULT_LANGUAGE');
      expect(config).toHaveProperty('VITE_MAX_FILE_SIZE');
      expect(config).toHaveProperty('VITE_TIMEOUT');
    });

    it('should return a copy of the config', () => {
      const config1 = EnvManager.getAll();
      const config2 = EnvManager.getAll();

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2);
    });
  });

  describe('isDevelopment', () => {
    it('should return true in development mode', () => {
      const isDev = EnvManager.isDevelopment();
      expect(typeof isDev).toBe('boolean');
    });
  });

  describe('isProduction', () => {
    it('should return false in development mode', () => {
      const isProd = EnvManager.isProduction();
      expect(typeof isProd).toBe('boolean');
    });
  });

  describe('getApiBaseUrl', () => {
    it('should return API base URL', () => {
      const url = EnvManager.getApiBaseUrl();
      expect(url).toBe('https://test.example.com');
    });
  });

  describe('getAppVersion', () => {
    it('should return app version', () => {
      const version = EnvManager.getAppVersion();
      expect(version).toBe('2.0.0');
    });
  });

  describe('getBuildTime', () => {
    it('should return build time', () => {
      const buildTime = EnvManager.getBuildTime();
      expect(buildTime).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('isDebugEnabled', () => {
    it('should return true when debug is enabled', () => {
      const enabled = EnvManager.isDebugEnabled();
      expect(enabled).toBe(true);
    });

    it('should return false when debug is disabled', () => {
      EnvManager['config'].VITE_ENABLE_DEBUG = false;
      const enabled = EnvManager.isDebugEnabled();
      expect(enabled).toBe(false);
    });
  });

  describe('getDefaultLanguage', () => {
    it('should return default language', () => {
      const language = EnvManager.getDefaultLanguage();
      expect(language).toBe('en');
    });
  });

  describe('getMaxFileSize', () => {
    it('should return max file size', () => {
      const maxSize = EnvManager.getMaxFileSize();
      expect(maxSize).toBe(5 * 1024 * 1024);
    });
  });

  describe('getTimeout', () => {
    it('should return timeout', () => {
      const timeout = EnvManager.getTimeout();
      expect(timeout).toBe(15000);
    });
  });

  describe('validate', () => {
    it('should return valid for correct configuration', () => {
      EnvManager['config'].VITE_API_BASE_URL = 'https://valid.example.com';
      EnvManager['config'].VITE_MAX_FILE_SIZE = 10 * 1024 * 1024;
      EnvManager['config'].VITE_TIMEOUT = 30000;
      EnvManager['config'].VITE_DEFAULT_LANGUAGE = 'zh-CN';

      const result = EnvManager.validate();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid for missing API base URL', () => {
      EnvManager['config'].VITE_API_BASE_URL = '';

      const result = EnvManager.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('VITE_API_BASE_URL is required');
    });

    it('should return invalid for invalid API base URL', () => {
      EnvManager['config'].VITE_API_BASE_URL = 'not-a-valid-url';

      const result = EnvManager.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('VITE_API_BASE_URL must be a valid URL');
    });

    it('should return invalid for zero max file size', () => {
      EnvManager['config'].VITE_MAX_FILE_SIZE = 0;

      const result = EnvManager.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('VITE_MAX_FILE_SIZE must be greater than 0');
    });

    it('should return invalid for negative max file size', () => {
      EnvManager['config'].VITE_MAX_FILE_SIZE = -100;

      const result = EnvManager.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('VITE_MAX_FILE_SIZE must be greater than 0');
    });

    it('should return invalid for zero timeout', () => {
      EnvManager['config'].VITE_TIMEOUT = 0;

      const result = EnvManager.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('VITE_TIMEOUT must be greater than 0');
    });

    it('should return invalid for negative timeout', () => {
      EnvManager['config'].VITE_TIMEOUT = -1000;

      const result = EnvManager.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('VITE_TIMEOUT must be greater than 0');
    });

    it('should return invalid for invalid language', () => {
      EnvManager['config'].VITE_DEFAULT_LANGUAGE = 'invalid-lang';

      const result = EnvManager.validate();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('VITE_DEFAULT_LANGUAGE must be one of: zh-CN, en, de, ru, vi');
    });

    it('should return multiple errors for multiple invalid values', () => {
      EnvManager['config'].VITE_API_BASE_URL = '';
      EnvManager['config'].VITE_MAX_FILE_SIZE = 0;
      EnvManager['config'].VITE_TIMEOUT = -1000;
      EnvManager['config'].VITE_DEFAULT_LANGUAGE = 'invalid';

      const result = EnvManager.validate();

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('maskSensitive', () => {
    it('should mask long values', () => {
      const masked = (EnvManager as any).maskSensitive('https://very-long-url.example.com/path/to/resource');
      expect(masked).toBe('https://***');
    });

    it('should not mask short values', () => {
      const masked = (EnvManager as any).maskSensitive('short');
      expect(masked).toBe('short');
    });

    it('should handle empty values', () => {
      const masked = (EnvManager as any).maskSensitive('');
      expect(masked).toBe('');
    });

    it('should handle undefined values', () => {
      const masked = (EnvManager as any).maskSensitive(undefined);
      expect(masked).toBeUndefined();
    });
  });

  describe('logConfig', () => {
    it('should log configuration when debug is enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      EnvManager['config'].VITE_ENABLE_DEBUG = true;

      (EnvManager as any).logConfig();

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Environment Configuration:',
        expect.objectContaining({
          VITE_API_BASE_URL: expect.stringContaining('***')
        })
      );

      consoleSpy.mockRestore();
    });

    it('should not log configuration when debug is disabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      EnvManager['config'].VITE_ENABLE_DEBUG = false;

      (EnvManager as any).logConfig();

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});

describe('env (exported object)', () => {
  beforeEach(() => {
    EnvManager['initialized'] = false;
    EnvManager['config'] = {
      VITE_API_BASE_URL: 'https://test.example.com',
      VITE_APP_VERSION: '2.0.0',
      VITE_BUILD_TIME: '2024-01-01T00:00:00.000Z',
      VITE_ENABLE_DEBUG: true,
      VITE_DEFAULT_LANGUAGE: 'en',
      VITE_MAX_FILE_SIZE: 5 * 1024 * 1024,
      VITE_TIMEOUT: 15000
    };
  });

  it('should provide get method', () => {
    const value = env.get('VITE_APP_VERSION');
    expect(value).toBe('1.0.0');
  });

  it('should provide getAll method', () => {
    const config = env.getAll();
    expect(config).toHaveProperty('VITE_API_BASE_URL');
  });

  it('should provide isDevelopment method', () => {
    const isDev = env.isDevelopment();
    expect(typeof isDev).toBe('boolean');
  });

  it('should provide isProduction method', () => {
    const isProd = env.isProduction();
    expect(typeof isProd).toBe('boolean');
  });

  it('should provide getApiBaseUrl method', () => {
    const url = env.getApiBaseUrl();
    expect(url).toBe('https://fmea-backend.baipj123.workers.dev');
  });

  it('should provide getAppVersion method', () => {
    const version = env.getAppVersion();
    expect(version).toBe('1.0.0');
  });

  it('should provide getBuildTime method', () => {
    const buildTime = env.getBuildTime();
    expect(buildTime).toBeDefined();
  });

  it('should provide isDebugEnabled method', () => {
    const enabled = env.isDebugEnabled();
    expect(enabled).toBe(false);
  });

  it('should provide getDefaultLanguage method', () => {
    const language = env.getDefaultLanguage();
    expect(language).toBe('zh-CN');
  });

  it('should provide getMaxFileSize method', () => {
    const maxSize = env.getMaxFileSize();
    expect(maxSize).toBe(10485760);
  });

  it('should provide getTimeout method', () => {
    const timeout = env.getTimeout();
    expect(timeout).toBe(30000);
  });

  it('should provide validate method', () => {
    const result = env.validate();
    expect(result).toHaveProperty('valid');
    expect(result).toHaveProperty('errors');
  });
});