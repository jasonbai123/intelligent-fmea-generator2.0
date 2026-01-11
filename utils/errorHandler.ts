export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  code?: string;
  timestamp: Date;
  stack?: string;
}

export class ErrorHandler {
  static createError(
    type: ErrorType,
    message: string,
    details?: string,
    code?: string
  ): AppError {
    return {
      type,
      message,
      details,
      code,
      timestamp: new Date(),
      stack: new Error().stack
    };
  }

  static parseNetworkError(error: any): AppError {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return this.createError(
        ErrorType.NETWORK_ERROR,
        '网络连接失败，请检查网络设置',
        error.message,
        'NETWORK_CONNECTION_FAILED'
      );
    }

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return this.createError(
        ErrorType.NETWORK_ERROR,
        '无法连接到服务器，请检查服务器状态',
        error.message,
        'SERVER_UNREACHABLE'
      );
    }

    return this.createError(
      ErrorType.NETWORK_ERROR,
      '网络请求失败',
      error.message,
      'NETWORK_ERROR'
    );
  }

  static parseApiError(response: Response, errorText?: string): AppError {
    const status = response.status;
    let message = 'API请求失败';
    let code = `API_ERROR_${status}`;

    switch (status) {
      case 400:
        message = '请求参数错误';
        code = 'BAD_REQUEST';
        break;
      case 401:
        message = '未授权，请检查API密钥';
        code = 'UNAUTHORIZED';
        break;
      case 403:
        message = '访问被拒绝';
        code = 'FORBIDDEN';
        break;
      case 404:
        message = '请求的资源不存在';
        code = 'NOT_FOUND';
        break;
      case 429:
        message = '请求过于频繁，请稍后再试';
        code = 'RATE_LIMIT_EXCEEDED';
        break;
      case 500:
        message = '服务器内部错误';
        code = 'INTERNAL_SERVER_ERROR';
        break;
      case 502:
        message = '网关错误';
        code = 'BAD_GATEWAY';
        break;
      case 503:
        message = '服务暂时不可用';
        code = 'SERVICE_UNAVAILABLE';
        break;
    }

    return this.createError(
      ErrorType.API_ERROR,
      message,
      errorText,
      code
    );
  }

  static parseJsonError(error: any, jsonString?: string): AppError {
    let details = error.message;
    let code = 'JSON_PARSE_ERROR';

    if (jsonString) {
      const preview = jsonString.substring(0, 200);
      details = `${error.message}\n\n预览: ${preview}...`;
    }

    return this.createError(
      ErrorType.PARSE_ERROR,
      '数据解析失败，返回的数据格式不正确',
      details,
      code
    );
  }

  static parseValidationError(message: string, field?: string): AppError {
    const details = field ? `字段: ${field}` : undefined;
    return this.createError(
      ErrorType.VALIDATION_ERROR,
      message,
      details,
      'VALIDATION_ERROR'
    );
  }

  static parseUnknownError(error: any): AppError {
    return this.createError(
      ErrorType.UNKNOWN_ERROR,
      '发生未知错误',
      error.message || String(error),
      'UNKNOWN_ERROR'
    );
  }

  static handleError(error: any): AppError {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return this.parseNetworkError(error);
    }

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return this.parseNetworkError(error);
    }

    if (error instanceof SyntaxError) {
      return this.parseJsonError(error);
    }

    if (error instanceof Error) {
      return this.parseUnknownError(error);
    }

    return this.parseUnknownError(error);
  }

  static logError(error: AppError | Error, context?: string): void {
    const appError = error instanceof Error ? this.parseUnknownError(error) : error;
    
    const logMessage = `[${appError.type}] ${appError.message}`;
    const contextMessage = context ? ` (Context: ${context})` : '';
    
    console.error(logMessage + contextMessage);
    
    if (appError.details) {
      console.error('Details:', appError.details);
    }
    
    if (appError.code) {
      console.error('Code:', appError.code);
    }
    
    if (appError.stack) {
      console.error('Stack:', appError.stack);
    }
  }

  static getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        return '网络连接出现问题，请检查您的网络连接后重试。';
      
      case ErrorType.API_ERROR:
        if (error.code === 'UNAUTHORIZED') {
          return 'API密钥无效或已过期，请检查您的API密钥配置。';
        }
        if (error.code === 'RATE_LIMIT_EXCEEDED') {
          return '请求过于频繁，请稍等片刻后再试。';
        }
        if (error.code === 'SERVICE_UNAVAILABLE' || error.code === 'BAD_GATEWAY') {
          return '服务暂时不可用，请稍后再试。';
        }
        return `服务器错误: ${error.message}`;
      
      case ErrorType.PARSE_ERROR:
        return '数据处理失败，请重试或联系技术支持。';
      
      case ErrorType.VALIDATION_ERROR:
        return `输入验证失败: ${error.message}`;
      
      case ErrorType.AUTH_ERROR:
        return '认证失败，请重新登录。';
      
      default:
        return '发生错误，请重试或联系技术支持。';
    }
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context?: string,
    showErrorToUser: boolean = true
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const appError = this.handleError(error);
      this.logError(appError, context);

      if (showErrorToUser) {
        const userMessage = this.getUserFriendlyMessage(appError);
        alert(userMessage);
      }

      throw appError;
    }
  }
}

export const withErrorHandling = ErrorHandler.withErrorHandling.bind(ErrorHandler);