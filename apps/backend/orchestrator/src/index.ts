import { createLogger, startHttpServer } from "@delego/utils";
import { createRequire } from "node:module";
import { restorePurchaseWorkflow } from "../workflows/purchase/index.js";
import type { TransitionHook } from "../state/index.js";
import type { WorkflowSnapshot as MachineSnapshot, PurchaseState } from "../state/index.js";

const _require = createRequire(import.meta.url);
const SERVICE_NAME = "orchestrator";
const DEFAULT_PORT = 3010;

const logLevel = process.env.LOG_LEVEL ?? "info";
const log = createLogger(SERVICE_NAME, logLevel);
const port = Number(process.env.ORCHESTRATOR_PORT ?? DEFAULT_PORT);

let _pool: any = null;
function getPool() {
  if (!_pool) {
    const { Pool } = _require("pg") as typeof import("pg");
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return _pool;
}

export interface WorkflowSnapshot {
  orderId: string;
  userId: string;
  state: string;
  context: Record<string, unknown>;
  version: number;
  updatedAt: string;
}

/** Saves current machine state and context. */
export async function persistWorkflowState(
  orderId: string,
  state: string,
  context: Record<string, any>
): Promise<void> {
  const pool = getPool();
  const userId = context.userId;
  const expectedVersion = context._dbVersion as number | undefined;

  if (expectedVersion !== undefined) {
    const res = await pool.query(
      `UPDATE purchase_workflows
       SET state = $1, context = $2, version = version + 1, updated_at = CURRENT_TIMESTAMP
       WHERE order_id = $3 AND version = $4`,
      [state, JSON.stringify(context), orderId, expectedVersion]
    );
    if (res.rowCount === 0) {
      throw new Error(`Optimistic concurrency failure: workflow ${orderId}`);
    }
  } else {
    await pool.query(
      `INSERT INTO purchase_workflows (order_id, user_id, state, context, version)
       VALUES ($1, $2, $3, $4, 1)
       ON CONFLICT (order_id) DO UPDATE SET
         state = EXCLUDED.state,
         context = EXCLUDED.context,
         version = purchase_workflows.version + 1,
         updated_at = CURRENT_TIMESTAMP`,
      [orderId, userId, state, JSON.stringify(context)]
    );
  }
}

/** Retrieves context on restart. */
export async function recoverWorkflowState(
  orderId: string
): Promise<{ state: string; context: Record<string, any> }> {
  const pool = getPool();
  const res = await pool.query(
    `SELECT state, context, version FROM purchase_workflows WHERE order_id = $1`,
    [orderId]
  );
  if (res.rows.length === 0) {
    throw new Error(`Workflow ${orderId} not found`);
  }
  const row = res.rows[0];
  const context = row.context;
  context._dbVersion = row.version;
  return {
    state: row.state,
    context,
  };
}

const onTransition: TransitionHook = async (record) => {
  await persistWorkflowState(record.workflowId, record.toState, record.context);
};

async function startup() {
  log.info("Starting orchestrator", { port });
  
  try {
    const pool = getPool();
    const res = await pool.query(
      `SELECT order_id, state, context, version 
       FROM purchase_workflows 
       WHERE state NOT IN ('Completed', 'Refunded')`
    );
    for (const row of res.rows) {
      const context = row.context;
      context._dbVersion = row.version;
      const snapshot: MachineSnapshot = {
        workflowId: row.order_id,
        currentState: row.state as PurchaseState,
        context: context,
        history: [],
        version: 1
      };
      restorePurchaseWorkflow(snapshot, onTransition);
      log.info("Recovered unfinished workflow", { orderId: row.order_id, state: row.state });
    }
  } catch (err: any) {
    log.warn("Failed to recover workflows on startup", { error: err.message });
  }

  startHttpServer({
    port,
    serviceName: SERVICE_NAME,
    routes: [
      // TODO: Register workflow trigger endpoints
    ],
  });
}

// Start only if not imported by tests
if (process.argv[1] && process.argv[1].endsWith("index.ts")) {
  startup().catch((err) => {
    log.error("Failed to start orchestrator", { error: err.message });
    process.exit(1);
  });
} else if (process.env.NODE_ENV !== 'test' && !process.argv[1]?.includes('vitest')) {
  // ESM equivalent to require.main === module is checking argv sometimes, but we'll try to just start it.
  startup().catch(console.error);
}

// Export workflows and state machine for internal use (issue #7)
export { purchaseWorkflow, restorePurchaseWorkflow } from "../workflows/purchase/index.js";
export { PurchaseWorkflowMachine } from "../state/index.js";
export type { PurchaseState, PurchaseEvent } from "../state/index.js";
