# recallbot

国土交通省が公開する自動車リコール情報を取得し、Pleroma/Mastodon 互換のサーバーへ投稿する AWS Lambda 用のアプリケーションです。TypeScript で実装され、Docker イメージとしてデプロイします。

実際に稼働しているアカウントは [@recallbot@xxx.azyobuzi.net](https://xxx.azyobuzi.net/recallbot) にあります。

## 特徴

- `pressrelease.rdf` から RSS フィードを取得し、"リコールの届出について" または "少数台数のリコール届出の公表について" を含むエントリーを抽出します。
- 未投稿の URL は DynamoDB で管理し、重複投稿を防止します。
- プレスリリースページに添付された PDF からリコール情報を抽出します。主に AWS Bedrock（Claude 3 Haiku）と Azure Document Intelligence を利用します。
- PDF を PNG 画像に変換して Mastodon へアップロードし、本文と合わせてトゥートします。
- エラーが発生した場合は SNS トピックへ通知する仕組みを持ちます（任意設定）。

## 主要な環境変数

| 変数名 | 必須 | 説明 |
| --- | --- | --- |
| `RECALLBOT_POSTED_URLS_TABLE_NAME` | いいえ | 投稿済み URL を保存する DynamoDB テーブル名。既定値: `recallbot_dev_posted_urls` |
| `RECALLBOT_DOCUMENT_INTELLIGENCE_ENDPOINT` | いいえ | Azure Document Intelligence のエンドポイント URL。既定値: `https://japaneast.api.cognitive.microsoft.com/` |
| `RECALLBOT_DOCUMENT_INTELLIGENCE_API_KEY` | はい | Document Intelligence の API キー |
| `RECALLBOT_BEDROCK_MODEL_ID` | いいえ | Bedrock の Inference Profile。既定値: `us.anthropic.claude-3-haiku-20240307-v1:0` |
| `RECALLBOT_BEDROCK_REGION` | いいえ | Bedrock のリージョン。既定値: `us-east-2` |
| `RECALLBOT_MASTODON_BASE_URL` | いいえ | 投稿先 Pleroma/Mastodon サーバーの URL。既定値: `https://xxx.azyobuzi.net/` |
| `RECALLBOT_MASTODON_ACCESS_TOKEN` | はい | 投稿に使用するアクセストークン |
| `RECALLBOT_ERROR_TOPIC_ARN` | いいえ | エラー通知に利用する SNS トピック ARN |

## ビルド

```bash
npm ci        # 依存関係をインストール
npm run build # esbuild で index.mjs を生成
```

`Dockerfile` では上記のビルドを行った後、AWS Lambda ランタイム用のイメージを作成します。

## テスト

```bash
npm test
```

`biome`, `tsc`, `tsx --test` を順に実行して静的解析と単体テストを行います。

## ローカル実行例

開発中は `debug-run.ts` を実行してワークフローを手元で試すことができます。

```bash
npx tsx debug-run.ts
```

## デプロイ

本番環境では Docker イメージ化した Lambda 関数を AWS に配置します。EventBridge のスケジュールで 1 日 1 回起動し、国土交通省の RSS フィードを取得して Mastodon へ投稿します。投稿済み URL は DynamoDB に保存され、重複投稿を防止します。実行中にエラーが発生した場合は SNS トピックへ通知します。

```
EventBridge -> Lambda -> Mastodon
                   |
                   +-> DynamoDB
                   +-> SNS (errors)
```

## ライセンス

MIT License
