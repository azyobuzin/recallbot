import { DefaultReportErrorService } from "./lib/report-error-service.mjs";

const service = DefaultReportErrorService.createDefault();

try {
  throw new Error("This is a test error");
} catch (e) {
  service.reportError(e);
}
