public struct SpotRecallListContent: Equatable, Sendable {
  /// 不具合の部位（部品名）
  public let component: String

  /// 基準不適合状態にあると認める構造、装置又は性能の状況及びその原因
  public let situation: String

  /// リコール対象車の台数 合計
  public let numCars: Int

  public init(
    component: String,
    situation: String,
    numCars: Int
  ) {
    self.component = component
    self.situation = situation
    self.numCars = numCars
  }
}
