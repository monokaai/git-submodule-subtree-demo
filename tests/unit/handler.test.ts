/**
 * Unit tests for Lambda handler
 */
import { Context, APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../lambda/index';

// モック関数
jest.mock('../../lambda/../utils/helpers', () => ({
  loadConfig: jest.fn(() => ({
    app_name: 'test-app',
    version: '1.0.0',
    region: 'us-east-1',
    common_settings: {
      timeout_seconds: 30,
      memory_mb: 256,
      log_level: 'INFO'
    }
  })),
  formatResponse: jest.fn((statusCode: number, body: any) => ({
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Lambda-Version': '1.0.0'
    },
    body: JSON.stringify(body)
  })),
  logInfo: jest.fn()
}));

describe('Lambda Handler', () => {
  let mockContext: Context;
  let mockEvent: APIGatewayProxyEvent;

  beforeEach(() => {
    // Context のモック
    mockContext = {
      callbackWaitsForEmptyEventLoop: false,
      functionName: 'test-function',
      functionVersion: '$LATEST',
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test',
      memoryLimitInMB: '256',
      awsRequestId: 'test-request-123',
      logGroupName: '/aws/lambda/test',
      logStreamName: '2025/11/11/[$LATEST]test',
      getRemainingTimeInMillis: () => 30000,
      done: () => {},
      fail: () => {},
      succeed: () => {}
    };

    // Event のモック
    mockEvent = {
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'GET',
      isBase64Encoded: false,
      path: '/test',
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '/test'
    };

    // モックをクリア
    jest.clearAllMocks();
  });

  describe('正常系', () => {
    it('ハンドラーが正常にレスポンスを返す', async () => {
      const result = await handler(mockEvent, mockContext);

      expect(result).toBeDefined();
      expect(result.statusCode).toBe(200);
      expect(result.headers).toHaveProperty('Content-Type');
    });

    it('レスポンスボディが正しい構造である', async () => {
      const result = await handler(mockEvent, mockContext);
      const body = JSON.parse(result.body);

      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('management_type');
      expect(body).toHaveProperty('language');
      expect(body).toHaveProperty('config');
      expect(body).toHaveProperty('request_id');
      expect(body).toHaveProperty('event');
    });

    it('管理タイプが正しく設定される', async () => {
      const result = await handler(mockEvent, mockContext);
      const body = JSON.parse(result.body);

      expect(body.management_type).toBe('git subtree');
      expect(body.language).toBe('TypeScript / Node.js');
    });

    it('リクエストIDがコンテキストから取得される', async () => {
      const result = await handler(mockEvent, mockContext);
      const body = JSON.parse(result.body);

      expect(body.request_id).toBe(mockContext.awsRequestId);
    });

    it('イベント情報が保存される', async () => {
      const customEvent = {
        ...mockEvent,
        queryStringParameters: { test: 'value' }
      };

      const result = await handler(customEvent, mockContext);
      const body = JSON.parse(result.body);

      expect(body.event).toEqual(customEvent);
    });
  });

  describe('異なるイベントでの動作', () => {
    it('空のイベントでも正常に動作する', async () => {
      const emptyEvent = {} as APIGatewayProxyEvent;
      const result = await handler(emptyEvent, mockContext);

      expect(result.statusCode).toBe(200);
    });

    it('POSTリクエストを処理できる', async () => {
      const postEvent = {
        ...mockEvent,
        httpMethod: 'POST',
        body: JSON.stringify({ data: 'test' })
      };

      const result = await handler(postEvent, mockContext);
      expect(result.statusCode).toBe(200);
    });

    it('クエリパラメータを含むリクエストを処理できる', async () => {
      const eventWithQuery = {
        ...mockEvent,
        queryStringParameters: {
          param1: 'value1',
          param2: 'value2'
        }
      };

      const result = await handler(eventWithQuery, mockContext);
      const body = JSON.parse(result.body);

      expect(body.event.queryStringParameters).toEqual({
        param1: 'value1',
        param2: 'value2'
      });
    });
  });

  describe('異常系', () => {
    it('エラーが発生した場合に500を返す', async () => {
      const { loadConfig } = require('../../lambda/../utils/helpers');
      loadConfig.mockImplementationOnce(() => {
        throw new Error('Config load error');
      });

      const result = await handler(mockEvent, mockContext);

      expect(result.statusCode).toBe(500);
    });

    it('エラーメッセージが含まれる', async () => {
      const { loadConfig } = require('../../lambda/../utils/helpers');
      loadConfig.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const result = await handler(mockEvent, mockContext);
      const body = JSON.parse(result.body);

      expect(body).toHaveProperty('error');
      expect(body.error).toContain('Test error');
    });
  });

  describe('共通ユーティリティの利用', () => {
    it('loadConfigが呼ばれる', async () => {
      const { loadConfig } = require('../../lambda/../utils/helpers');

      await handler(mockEvent, mockContext);

      expect(loadConfig).toHaveBeenCalled();
    });

    it('logInfoが呼ばれる', async () => {
      const { logInfo } = require('../../lambda/../utils/helpers');

      await handler(mockEvent, mockContext);

      expect(logInfo).toHaveBeenCalled();
    });

    it('formatResponseが呼ばれる', async () => {
      const { formatResponse } = require('../../lambda/../utils/helpers');

      await handler(mockEvent, mockContext);

      expect(formatResponse).toHaveBeenCalledWith(
        200,
        expect.any(Object)
      );
    });
  });
});
