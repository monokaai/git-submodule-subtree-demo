/**
 * E2E tests for Lambda integration
 * 実際の環境に近い形でテスト
 */
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { handler } from '../../lambda/index';

describe('Lambda E2E Integration Tests', () => {
  let realContext: Context;

  beforeEach(() => {
    // 実際のLambda contextに近いモック
    realContext = {
      callbackWaitsForEmptyEventLoop: false,
      functionName: 'subtree-app-e2e',
      functionVersion: '$LATEST',
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:subtree-app',
      memoryLimitInMB: '512',
      awsRequestId: 'e2e-test-request-789',
      logGroupName: '/aws/lambda/subtree-app',
      logStreamName: '2025/11/11/[$LATEST]e2e-test',
      getRemainingTimeInMillis: () => 60000,
      done: jest.fn(),
      fail: jest.fn(),
      succeed: jest.fn()
    };
  });

  describe('完全な実行フロー', () => {
    it('Lambdaの完全な実行が成功する', async () => {
      const event: APIGatewayProxyEvent = {
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
        requestContext: {
          accountId: '123456789012',
          apiId: 'test-api',
          protocol: 'HTTP/1.1',
          httpMethod: 'GET',
          path: '/test',
          stage: 'prod',
          requestId: 'test-request',
          requestTime: '11/Nov/2025:00:00:00 +0000',
          requestTimeEpoch: 1730419200000,
          identity: {
            accessKey: null,
            accountId: null,
            apiKey: null,
            apiKeyId: null,
            caller: null,
            clientCert: null,
            cognitoAuthenticationProvider: null,
            cognitoAuthenticationType: null,
            cognitoIdentityId: null,
            cognitoIdentityPoolId: null,
            principalOrgId: null,
            sourceIp: '127.0.0.1',
            user: null,
            userAgent: 'Mozilla/5.0',
            userArn: null,
            vpcId: null,
            vpceId: null
          },
          domainName: 'test.execute-api.us-east-1.amazonaws.com',
          domainPrefix: 'test',
          authorizer: undefined,
          resourceId: 'test',
          resourcePath: '/test'
        },
        resource: '/test'
      };

      const result = await handler(event, realContext);

      // レスポンス構造の検証
      expect(result).toBeDefined();
      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('headers');
      expect(result).toHaveProperty('body');

      // ステータスコードの検証
      expect(result.statusCode).toBe(200);

      // ボディの検証
      const body = JSON.parse(result.body);
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('management_type', 'git subtree');
      expect(body).toHaveProperty('language', 'TypeScript / Node.js');
      expect(body).toHaveProperty('config');
      expect(body).toHaveProperty('request_id', realContext.awsRequestId);
    });
  });

  describe('API Gateway統合', () => {
    it('API Gateway Proxyイベントを正しく処理する', async () => {
      const apiGatewayEvent: APIGatewayProxyEvent = {
        body: JSON.stringify({ test: true }),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        multiValueHeaders: {},
        httpMethod: 'POST',
        isBase64Encoded: false,
        path: '/api/test',
        pathParameters: { id: '123' },
        queryStringParameters: { filter: 'active' },
        multiValueQueryStringParameters: null,
        stageVariables: { env: 'prod' },
        requestContext: {} as any,
        resource: '/api/test'
      };

      const result = await handler(apiGatewayEvent, realContext);

      expect(result.statusCode).toBe(200);

      const body = JSON.parse(result.body);
      expect(body.event.httpMethod).toBe('POST');
      expect(body.event.path).toBe('/api/test');
      expect(body.event.queryStringParameters?.filter).toBe('active');
    });

    it('GETリクエストを処理できる', async () => {
      const getEvent: APIGatewayProxyEvent = {
        body: null,
        headers: {},
        multiValueHeaders: {},
        httpMethod: 'GET',
        isBase64Encoded: false,
        path: '/items',
        pathParameters: null,
        queryStringParameters: { page: '1', limit: '10' },
        multiValueQueryStringParameters: null,
        stageVariables: null,
        requestContext: {} as any,
        resource: '/items'
      };

      const result = await handler(getEvent, realContext);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.event.queryStringParameters).toEqual({
        page: '1',
        limit: '10'
      });
    });
  });

  describe('パフォーマンステスト', () => {
    it('コールドスタートが合理的な時間で完了する', async () => {
      const event: APIGatewayProxyEvent = {
        body: null,
        headers: {},
        multiValueHeaders: {},
        httpMethod: 'GET',
        isBase64Encoded: false,
        path: '/perf-test',
        pathParameters: null,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        stageVariables: null,
        requestContext: {} as any,
        resource: '/perf-test'
      };

      const startTime = Date.now();
      const result = await handler(event, realContext);
      const duration = Date.now() - startTime;

      expect(result.statusCode).toBe(200);
      expect(duration).toBeLessThan(5000); // 5秒以内

      console.log(`Execution time: ${duration}ms`);
    });

    it('連続実行でも安定して動作する', async () => {
      const event: APIGatewayProxyEvent = {
        body: null,
        headers: {},
        multiValueHeaders: {},
        httpMethod: 'GET',
        isBase64Encoded: false,
        path: '/stability-test',
        pathParameters: null,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        stageVariables: null,
        requestContext: {} as any,
        resource: '/stability-test'
      };

      const iterations = 10;
      const results: APIGatewayProxyResult[] = [];

      for (let i = 0; i < iterations; i++) {
        const result = await handler(event, realContext);
        results.push(result);
      }

      // すべて成功することを確認
      expect(results.every(r => r.statusCode === 200)).toBe(true);

      // レスポンスの一貫性を確認
      const bodies = results.map(r => JSON.parse(r.body));
      expect(bodies.every(b => b.management_type === 'git subtree')).toBe(true);
    });
  });

  describe('エラーシナリオ', () => {
    it('大きなペイロードを処理できる', async () => {
      const largePayload = {
        data: 'x'.repeat(10000),
        nested: { deep: { value: 'test' } }
      };

      const event: APIGatewayProxyEvent = {
        body: JSON.stringify(largePayload),
        headers: {},
        multiValueHeaders: {},
        httpMethod: 'POST',
        isBase64Encoded: false,
        path: '/large',
        pathParameters: null,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        stageVariables: null,
        requestContext: {} as any,
        resource: '/large'
      };

      const result = await handler(event, realContext);
      expect(result.statusCode).toBe(200);
    });

    it('空のイベントでも動作する', async () => {
      const emptyEvent = {} as APIGatewayProxyEvent;
      const result = await handler(emptyEvent, realContext);

      expect(result.statusCode).toBe(200);
    });
  });

  describe('共通設定の統合', () => {
    it('共通設定が正しく読み込まれる', async () => {
      const event: APIGatewayProxyEvent = {
        body: null,
        headers: {},
        multiValueHeaders: {},
        httpMethod: 'GET',
        isBase64Encoded: false,
        path: '/config-test',
        pathParameters: null,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        stageVariables: null,
        requestContext: {} as any,
        resource: '/config-test'
      };

      const result = await handler(event, realContext);
      const body = JSON.parse(result.body);

      expect(body.config).toBeDefined();
      expect(body.config).toHaveProperty('app_name');
      expect(body.config).toHaveProperty('version');
      expect(body.config).toHaveProperty('region');

      // 値の妥当性チェック
      expect(typeof body.config.app_name).toBe('string');
      expect(body.config.version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});
