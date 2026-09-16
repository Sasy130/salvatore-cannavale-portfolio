import type { OperationalRequestProcessor } from "@/features/operai/types/operational-request";
import { DemoProcessor } from "./demo-processor";

// The only provider selection point. Keep future credentials in this server layer.
export const requestProcessor: OperationalRequestProcessor =
  new DemoProcessor();
