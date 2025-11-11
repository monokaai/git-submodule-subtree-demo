/**
 * CDK for Terraform - Lambda Deployment
 *
 * このスタックは以下をデプロイします：
 * 1. Submodule-app (Python Lambda) - git submodule で管理
 * 2. Subtree-app (TypeScript Lambda) - git subtree で管理
 *
 * 両方の Lambda は projects/utils の共通設定を参照します
 */
import { Construct } from "constructs";
import { App, TerraformStack, TerraformOutput } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment";
import { LambdaFunction } from "@cdktf/provider-aws/lib/lambda-function";
import { EcrRepository } from "@cdktf/provider-aws/lib/ecr-repository";

class LambdaStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // AWS Provider
    new AwsProvider(this, "AWS", {
      region: "us-east-1",
    });

    // Lambda 実行ロール
    const lambdaRole = new IamRole(this, "lambda-role", {
      name: "git-demo-lambda-role",
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Action: "sts:AssumeRole",
            Principal: {
              Service: "lambda.amazonaws.com",
            },
            Effect: "Allow",
          },
        ],
      }),
    });

    // Lambda 基本実行ポリシーをアタッチ
    new IamRolePolicyAttachment(this, "lambda-basic-execution", {
      policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
      role: lambdaRole.name,
    });

    // ECR リポジトリ - Submodule App (Python)
    const submoduleEcr = new EcrRepository(this, "submodule-app-ecr", {
      name: "git-demo-submodule-app",
      imageTagMutability: "MUTABLE",
      imageScanningConfiguration: {
        scanOnPush: true,
      },
      forceDelete: true,
    });

    // ECR リポジトリ - Subtree App (TypeScript)
    const subtreeEcr = new EcrRepository(this, "subtree-app-ecr", {
      name: "git-demo-subtree-app",
      imageTagMutability: "MUTABLE",
      imageScanningConfiguration: {
        scanOnPush: true,
      },
      forceDelete: true,
    });

    // Lambda Function - Submodule App (Python)
    // 注: 実際のデプロイ時は、Docker イメージをビルドして ECR にプッシュする必要があります
    const submoduleLambda = new LambdaFunction(this, "submodule-lambda", {
      functionName: "git-demo-submodule-app",
      role: lambdaRole.arn,
      packageType: "Image",
      imageUri: `${submoduleEcr.repositoryUrl}:latest`,
      timeout: 60,
      memorySize: 512,
      environment: {
        variables: {
          MANAGEMENT_TYPE: "git-submodule",
          LANGUAGE: "Python",
        },
      },
    });

    // Lambda Function - Subtree App (TypeScript)
    const subtreeLambda = new LambdaFunction(this, "subtree-lambda", {
      functionName: "git-demo-subtree-app",
      role: lambdaRole.arn,
      packageType: "Image",
      imageUri: `${subtreeEcr.repositoryUrl}:latest`,
      timeout: 60,
      memorySize: 512,
      environment: {
        variables: {
          MANAGEMENT_TYPE: "git-subtree",
          LANGUAGE: "TypeScript",
        },
      },
    });

    // Outputs
    new TerraformOutput(this, "submodule-ecr-url", {
      value: submoduleEcr.repositoryUrl,
      description: "Submodule App ECR Repository URL",
    });

    new TerraformOutput(this, "subtree-ecr-url", {
      value: subtreeEcr.repositoryUrl,
      description: "Subtree App ECR Repository URL",
    });

    new TerraformOutput(this, "submodule-lambda-arn", {
      value: submoduleLambda.arn,
      description: "Submodule Lambda Function ARN",
    });

    new TerraformOutput(this, "subtree-lambda-arn", {
      value: subtreeLambda.arn,
      description: "Subtree Lambda Function ARN",
    });
  }
}

const app = new App();
new LambdaStack(app, "git-demo-lambda");
app.synth();
