# TypeScript Lambda Docker Image
# Git subtree として管理されるアプリケーション
FROM public.ecr.aws/lambda/nodejs:20 AS builder

# 作業ディレクトリを設定
WORKDIR /build

# 共通utilsをコピー（../utils から参照）
# Docker build context は projects/ ディレクトリから実行することを想定
COPY utils/ /build/utils/

# Lambda関数コードをコピー
COPY subtree-app/lambda/package*.json /build/lambda/
COPY subtree-app/lambda/tsconfig.json /build/lambda/
COPY subtree-app/lambda/index.ts /build/lambda/

# 依存関係をインストールしてビルド
WORKDIR /build/lambda
RUN npm install
RUN npm run build

# 実行用イメージ
FROM public.ecr.aws/lambda/nodejs:20

# ビルド成果物をコピー
COPY --from=builder /build/lambda/dist/ ${LAMBDA_TASK_ROOT}/
COPY --from=builder /build/lambda/node_modules/ ${LAMBDA_TASK_ROOT}/node_modules/
COPY --from=builder /build/utils/ ${LAMBDA_TASK_ROOT}/utils/

# ハンドラーを設定
CMD ["index.handler"]
