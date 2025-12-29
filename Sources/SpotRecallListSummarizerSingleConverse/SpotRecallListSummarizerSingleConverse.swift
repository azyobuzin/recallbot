import AWSBedrockRuntime
import Foundation
import Smithy
import SmithyJSON
import SpotRecallListSummarizerAbstraction

/// 1回のBedrock Converse API 呼び出しでリコール届出一覧表を解析する実装
public struct SpotRecallListSummarizerSingleConverse: SpotRecallListSummarizable {
  let client: BedrockRuntimeClient
  let modelId: String

  public init(client: BedrockRuntimeClient, modelId: String) {
    self.client = client
    self.modelId = modelId
  }

  public func summarizeSpotRecallList(pdf: Data) async throws -> SummarizeSpotRecallListResult {
    // ユーザーメッセージを構築
    let message = BedrockRuntimeClientTypes.Message(
      content: [
        .text(prompt1),
        .document(
          BedrockRuntimeClientTypes.DocumentBlock(
            format: .pdf,
            name: "RecallList",
            source: .bytes(pdf)
          )
        ),
        .text(prompt2),
      ],
      role: .user
    )

    // ツール設定
    let toolConfig = BedrockRuntimeClientTypes.ToolConfiguration(
      tools: [outputResultTool, fallbackTool]
    )

    // Converse API 呼び出し
    let input = ConverseInput(
      messages: [message],
      modelId: modelId,
      toolConfig: toolConfig
    )

    let response = try await client.converse(input: input)

    // レスポンスからツール呼び出しを抽出
    guard case .message(let responseMessage) = response.output else {
      throw Error.unexpectedResponse
    }

    guard let contentBlocks = responseMessage.content else {
      throw Error.unexpectedResponse
    }

    // ツール呼び出しを探す
    for block in contentBlocks {
      if case .tooluse(let toolUse) = block {
        if toolUse.name == "OutputResult" {
          // 結果を抽出
          let content = try parseOutputResult(input: toolUse.input)
          return .success(content)
        } else if toolUse.name == "Fallback" {
          return .uncertain
        }
      }
    }

    throw Error.noToolUseFound
  }

  // TODO: テスト書く
  private func parseOutputResult(input: Smithy.Document?) throws -> SpotRecallListContent {
    guard let input = input else {
      throw Error.invalidToolInput
    }

    // Document から各フィールドを抽出
    let obj = try input.asStringMap()

    // component
    guard let componentDoc = obj["component"] else {
      throw Error.missingField("component")
    }
    let component = try componentDoc.asString()

    // situation
    guard let situationDoc = obj["situation"] else {
      throw Error.missingField("situation")
    }
    let situation = try situationDoc.asString()

    // numCars - 整数または文字列として来る可能性がある
    guard let numCarsDoc = obj["numCars"] else {
      throw Error.missingField("numCars")
    }

    let numCars: Int
    if numCarsDoc.type == .integer {
      numCars = try numCarsDoc.asInteger()
    } else if numCarsDoc.type == .string {
      // "9,972台" のような文字列をパース
      let s = try numCarsDoc.asString()
      let cleaned = s.replacingOccurrences(of: ",", with: "")
        .replacingOccurrences(of: "台", with: "")
      guard let n = Int(cleaned) else {
        throw Error.invalidNumCars(s)
      }
      numCars = n
    } else {
      throw Error.invalidNumCarsType
    }

    return SpotRecallListContent(
      component: component,
      situation: situation,
      numCars: numCars
    )
  }
}

extension SpotRecallListSummarizerSingleConverse {
  public enum Error: Swift.Error {
    case unexpectedResponse
    case noToolUseFound
    case invalidToolInput
    case missingField(String)
    case invalidNumCars(String)
    case invalidNumCarsType
  }
}

// MARK: - プロンプト定数

private let prompt1 = "次のドキュメントは国土交通省が公開する自動車のリコール情報です。"

private let prompt2 = """
  ドキュメントから次の項目を読み取り、原文のまま抽出してください

  * 不具合の部位（部品名）
  * 基準不適合状態にあると認める構造、装置又は性能の状況及びその原因
  * リコール対象車の台数 合計

  結果が得られたらOutputResultを呼び出してください。ドキュメントを読み取れなかったらFallbackを呼び出してください
  """

// MARK: - ツール定義

private let outputResultTool: BedrockRuntimeClientTypes.Tool = .toolspec(
  BedrockRuntimeClientTypes.ToolSpecification(
    description: "抽出結果を出力",
    inputSchema: .json(
      [
        "type": "object",
        "properties": [
          "component": [
            "type": "string",
            "description": "不具合の部位（部品名）",
          ],
          "situation": [
            "type": "string",
            "description": "基準不適合状態にあると認める構造、装置又は性能の状況及びその原因",
          ],
          "numCars": [
            "type": "integer",
            "description": "リコール対象車の台数 合計",
          ],
        ],
        "required": ["component", "situation", "numCars"],
      ] as Smithy.Document
    ),
    name: "OutputResult"
  )
)

private let fallbackTool: BedrockRuntimeClientTypes.Tool = .toolspec(
  BedrockRuntimeClientTypes.ToolSpecification(
    description: "ドキュメントを読み取れなかったことを通知",
    inputSchema: .json(
      [
        "type": "object"
      ] as Smithy.Document
    ),
    name: "Fallback"
  )
)
