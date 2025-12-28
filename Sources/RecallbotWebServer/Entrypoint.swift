import Vapor

@main
enum Entrypoint {
  static func main() async throws {
    var env = try Environment.detect()
    try LoggingSystem.bootstrap(from: &env)

    let app = try await Application.make(env)
    configure(app)

    do {
      // SIGINT and SIGTERM signal handling is done in ServeCommand
      try await app.execute()
    } catch {
      // HACK: deferでawaitできないため、ここでshutdownを呼ぶ
      try? await app.asyncShutdown()
      throw error
    }

    try await app.asyncShutdown()
  }
}
