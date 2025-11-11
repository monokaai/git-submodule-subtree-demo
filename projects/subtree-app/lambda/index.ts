/**
 * TypeScript Lambda Handler (Subtree App)
 * Git subtree として管理される Lambda 関数
 */
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// 共通utilsをインポート
import { loadConfig, formatResponse, logInfo } from '../utils/helpers';

/**
 * Lambda ハンドラー関数
 *
 * このLambdaは以下を実証します：
 * - git subtree による管理
 * - 共通utils (../utils) の参照
 * - Docker コンテナでの実行
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    // 共通設定を読み込み
    const config = loadConfig();
    logInfo('Subtree App (TypeScript) Lambda started');

    // イベント情報を取得
    const requestId = context.requestId || 'local';

    // レスポンスボディを構築
    const responseBody = {
      message: 'Hello from Subtree App (TypeScript Lambda)!',
      management_type: 'git subtree',
      language: 'TypeScript / Node.js',
      config: {
        app_name: config.app_name,
        version: config.version,
        region: config.region
      },
      request_id: requestId,
      event: event
    };

    logInfo(`Processing completed successfully: ${requestId}`);

    return formatResponse(200, responseBody);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logInfo(`Error occurred: ${errorMessage}`);

    return formatResponse(500, {
      error: errorMessage,
      message: 'Internal server error'
    });
  }
};

// ローカルテスト用
if (require.main === module) {
  const testEvent = {
    test: true,
    source: 'local'
  } as any;

  const mockContext = {
    requestId: 'test-request-456',
    functionName: 'subtree-app-lambda',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test',
    memoryLimitInMB: '256',
    awsRequestId: 'test-request-456',
    logGroupName: '/aws/lambda/test',
    logStreamName: '2024/01/01/[$LATEST]test',
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {}
  } as Context;

  handler(testEvent, mockContext).then(result => {
    console.log(JSON.stringify(result, null, 2));
  });
}
