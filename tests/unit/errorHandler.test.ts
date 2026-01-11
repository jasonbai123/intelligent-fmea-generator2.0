import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ErrorHandler, ErrorType, withErrorHandling } from '../../utils/errorHandler';

describe('ErrorHandler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createError', () => {
    it('should create an error with all required fields', () => {
      const error = ErrorHandler.createError(
        ErrorType.NETWORK_ERROR,
        'Network failed',
        'Connection timeout',
        'NET_TIMEOUT'
      );

      expect(error.type).toBe(ErrorType.NETWORK_ERROR);
      expect(error.message).toBe('Network failed');
      expect(error.details).toBe('Connection timeout');
      expect(error.code).toBe('NET_TIMEOUT');
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
    });

    it('should create error without optional fields', () => {
      const error = ErrorHandler.createError(
        ErrorType.UNKNOWN_ERROR,
        'Unknown error'
      );

      expect(error.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(error.message).toBe('Unknown error');
      expect(error.details).toBeUndefined();
      expect(error.code).toBeUndefined();
    });
  });

  describe('parseNetworkError', () => {
    it('should parse fetch TypeError as network error', () => {
      const error = new TypeError('Failed to fetch');
      const parsed = ErrorHandler.parseNetworkError(error);

      expect(parsed.type).toBe(ErrorType.NETWORK_ERROR);
      expect(parsed.message).toBe('网络连接失败，请检查网络设置');
      expect(parsed.code).toBe('NETWORK_CONNECTION_FAILED');
    });

    it('should parse connection error as network error', () => {
      const error = new TypeError('Network request failed');
      const parsed = ErrorHandler.parseNetworkError(error);

      expect(parsed.type).toBe(ErrorType.NETWORK_ERROR);
      expect(parsed.message).toBe('网络请求失败');
    });
  });

  describe('parseApiError', () => {
    it('should parse 401 error as unauthorized', () => {
      const response = new Response(null, { status: 401 });
      const parsed = ErrorHandler.parseApiError(response);

      expect(parsed.type).toBe(ErrorType.API_ERROR);
      expect(parsed.message).toBe('未授权，请检查API密钥');
      expect(parsed.code).toBe('UNAUTHORIZED');
    });

    it('should parse 404 error as not found', () => {
      const response = new Response(null, { status: 404 });
      const parsed = ErrorHandler.parseApiError(response);

      expect(parsed.type).toBe(ErrorType.API_ERROR);
      expect(parsed.message).toBe('请求的资源不存在');
      expect(parsed.code).toBe('NOT_FOUND');
    });

    it('should parse 500 error as internal server error', () => {
      const response = new Response(null, { status: 500 });
      const parsed = ErrorHandler.parseApiError(response);

      expect(parsed.type).toBe(ErrorType.API_ERROR);
      expect(parsed.message).toBe('服务器内部错误');
      expect(parsed.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('should parse 429 error as rate limit exceeded', () => {
      const response = new Response(null, { status: 429 });
      const parsed = ErrorHandler.parseApiError(response);

      expect(parsed.type).toBe(ErrorType.API_ERROR);
      expect(parsed.message).toBe('请求过于频繁，请稍后再试');
      expect(parsed.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('parseJsonError', () => {
    it('should parse JSON parse error with preview', () => {
      const error = new SyntaxError('Unexpected token');
      const jsonString = '{"invalid": json}';
      const parsed = ErrorHandler.parseJsonError(error, jsonString);

      expect(parsed.type).toBe(ErrorType.PARSE_ERROR);
      expect(parsed.message).toBe('数据解析失败，返回的数据格式不正确');
      expect(parsed.details).toContain('Unexpected token');
      expect(parsed.details).toContain('{"invalid": json}');
    });

    it('should parse JSON parse error without preview', () => {
      const error = new SyntaxError('Unexpected token');
      const parsed = ErrorHandler.parseJsonError(error);

      expect(parsed.type).toBe(ErrorType.PARSE_ERROR);
      expect(parsed.details).toBe('Unexpected token');
    });
  });

  describe('parseValidationError', () => {
    it('should parse validation error with field', () => {
      const parsed = ErrorHandler.parseValidationError('Invalid email format', 'email');

      expect(parsed.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(parsed.message).toBe('Invalid email format');
      expect(parsed.details).toBe('字段: email');
    });

    it('should parse validation error without field', () => {
      const parsed = ErrorHandler.parseValidationError('Required field missing');

      expect(parsed.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(parsed.message).toBe('Required field missing');
      expect(parsed.details).toBeUndefined();
    });
  });

  describe('parseUnknownError', () => {
    it('should parse unknown error from Error object', () => {
      const error = new Error('Something went wrong');
      const parsed = ErrorHandler.parseUnknownError(error);

      expect(parsed.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(parsed.message).toBe('发生未知错误');
      expect(parsed.details).toBe('Something went wrong');
    });

    it('should parse unknown error from string', () => {
      const parsed = ErrorHandler.parseUnknownError('String error');

      expect(parsed.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(parsed.details).toBe('String error');
    });

    it('should parse unknown error from object', () => {
      const parsed = ErrorHandler.parseUnknownError({ custom: 'error' });

      expect(parsed.type).toBe(ErrorType.UNKNOWN_ERROR);
      expect(parsed.details).toBe('[object Object]');
    });
  });

  describe('handleError', () => {
    it('should handle network TypeError', () => {
      const error = new TypeError('Failed to fetch');
      const parsed = ErrorHandler.handleError(error);

      expect(parsed.type).toBe(ErrorType.NETWORK_ERROR);
    });

    it('should handle SyntaxError', () => {
      const error = new SyntaxError('Unexpected token');
      const parsed = ErrorHandler.handleError(error);

      expect(parsed.type).toBe(ErrorType.PARSE_ERROR);
    });

    it('should handle generic Error', () => {
      const error = new Error('Generic error');
      const parsed = ErrorHandler.handleError(error);

      expect(parsed.type).toBe(ErrorType.UNKNOWN_ERROR);
    });

    it('should handle unknown error type', () => {
      const parsed = ErrorHandler.handleError('string error');

      expect(parsed.type).toBe(ErrorType.UNKNOWN_ERROR);
    });
  });

  describe('logError', () => {
    it('should log AppError with context', () => {
      const error = ErrorHandler.createError(
        ErrorType.NETWORK_ERROR,
        'Network failed',
        'Details',
        'CODE'
      );

      ErrorHandler.logError(error, 'API Request');

      expect(console.error).toHaveBeenCalledWith(
        '[NETWORK_ERROR] Network failed (Context: API Request)'
      );
      expect(console.error).toHaveBeenCalledWith('Details:', 'Details');
      expect(console.error).toHaveBeenCalledWith('Code:', 'CODE');
    });

    it('should log Error object', () => {
      const error = new Error('Test error');

      ErrorHandler.logError(error);

      expect(console.error).toHaveBeenCalledWith('[UNKNOWN_ERROR] 发生未知错误');
    });
  });

  describe('getUserFriendlyMessage', () => {
    it('should return friendly message for network error', () => {
      const error = ErrorHandler.createError(ErrorType.NETWORK_ERROR, 'Network failed');
      const message = ErrorHandler.getUserFriendlyMessage(error);

      expect(message).toBe('网络连接出现问题，请检查您的网络连接后重试。');
    });

    it('should return friendly message for unauthorized error', () => {
      const error = ErrorHandler.createError(ErrorType.API_ERROR, 'Unauthorized', undefined, 'UNAUTHORIZED');
      const message = ErrorHandler.getUserFriendlyMessage(error);

      expect(message).toBe('API密钥无效或已过期，请检查您的API密钥配置。');
    });

    it('should return friendly message for rate limit error', () => {
      const error = ErrorHandler.createError(ErrorType.API_ERROR, 'Rate limit', undefined, 'RATE_LIMIT_EXCEEDED');
      const message = ErrorHandler.getUserFriendlyMessage(error);

      expect(message).toBe('请求过于频繁，请稍等片刻后再试。');
    });

    it('should return friendly message for parse error', () => {
      const error = ErrorHandler.createError(ErrorType.PARSE_ERROR, 'Parse failed');
      const message = ErrorHandler.getUserFriendlyMessage(error);

      expect(message).toBe('数据处理失败，请重试或联系技术支持。');
    });

    it('should return friendly message for validation error', () => {
      const error = ErrorHandler.createError(ErrorType.VALIDATION_ERROR, 'Invalid input');
      const message = ErrorHandler.getUserFriendlyMessage(error);

      expect(message).toBe('输入验证失败: Invalid input');
    });

    it('should return friendly message for auth error', () => {
      const error = ErrorHandler.createError(ErrorType.AUTH_ERROR, 'Auth failed');
      const message = ErrorHandler.getUserFriendlyMessage(error);

      expect(message).toBe('认证失败，请重新登录。');
    });

    it('should return friendly message for unknown error', () => {
      const error = ErrorHandler.createError(ErrorType.UNKNOWN_ERROR, 'Unknown');
      const message = ErrorHandler.getUserFriendlyMessage(error);

      expect(message).toBe('发生错误，请重试或联系技术支持。');
    });
  });

  describe('withErrorHandling', () => {
    it('should return result when operation succeeds', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await ErrorHandler.withErrorHandling(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
    });

    it('should handle error and throw', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Test error'));
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      await expect(ErrorHandler.withErrorHandling(operation)).rejects.toThrow();
      expect(alertSpy).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('发生错误'));

      alertSpy.mockRestore();
    });

    it('should not show alert when showErrorToUser is false', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Test error'));
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      await expect(ErrorHandler.withErrorHandling(operation, undefined, false)).rejects.toThrow();
      expect(alertSpy).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('should log error with context', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Test error'));
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      await expect(ErrorHandler.withErrorHandling(operation, 'Test Context')).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Test Context'));

      alertSpy.mockRestore();
    });
  });

  describe('withErrorHandling (exported function)', () => {
    it('should work as exported function', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await withErrorHandling(operation);

      expect(result).toBe('success');
    });
  });
});