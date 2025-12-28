.PHONY: all fmt

SOURCES := Package.swift Package.resolved $(shell find Sources -type f -name '*.swift')

all: .build/debug/RecallbotWebServer

.build/debug/RecallbotWebServer: $(SOURCES)
	swift build -c debug --target RecallbotWebServer

.build/release/RecallbotWebServer: $(SOURCES)
	swift build -c release --target RecallbotWebServer

fmt:
	swift format --recursive --in-place .
