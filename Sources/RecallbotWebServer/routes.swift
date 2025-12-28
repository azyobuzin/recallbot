import Vapor

func routes(_ app: some RoutesBuilder) {
  app.get { req in
    "It works!"
  }.description("Health check endpoint")
}
