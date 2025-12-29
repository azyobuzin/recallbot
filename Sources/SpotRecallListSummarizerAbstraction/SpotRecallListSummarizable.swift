import Foundation

/// リコール届出一覧表を解析するプロトコル
public protocol SpotRecallListSummarizable {
  func summarizeSpotRecallList(pdf: Data) async throws -> SummarizeSpotRecallListResult
}

public enum SummarizeSpotRecallListResult {
  /// 解析に成功した
  case success(SpotRecallListContent)

  /// 解析は正常に完了したが、信頼できる結果が得られなかった
  case uncertain
}
