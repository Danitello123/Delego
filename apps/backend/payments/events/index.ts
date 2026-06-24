import { SorobanTransactionLedger } from "../src/models/SorobanTransactionLedger.js";
import { createLogger } from "@delego/utils";

const log = createLogger("payments:events", process.env.LOG_LEVEL ?? "info");

export type PaymentEventType =
  | "escrow_created"
  | "escrow_released"
  | "escrow_refunded"
  | "settlement_complete";

export interface PaymentEvent {
  type: PaymentEventType;
  orderId: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

/** Emit payment events — TODO: Publish to event bus / analytics */
export function emitPaymentEvent(_event: PaymentEvent): void {
  // TODO: Implement event publishing
}

/**
 * Logs a new transaction submission to the ledger database with PENDING status.
 * If the transaction has already been logged, updates its details/status as needed.
 */
export async function logSubmission(
  hash: string,
  method: string,
  orderId?: string,
  contractId?: string
): Promise<SorobanTransactionLedger> {
  log.info("Logging transaction submission in ledger", { hash, method, orderId, contractId });
  try {
    const [ledgerEntry, created] = await SorobanTransactionLedger.findOrCreate({
      where: { hash },
      defaults: {
        hash,
        method,
        status: "PENDING",
        orderId: orderId || null,
        contractId: contractId || null,
        submittedAt: new Date(),
      },
    });

    if (!created) {
      log.warn("Transaction submission ledger entry already exists, updating for retry", { hash });
      ledgerEntry.status = "PENDING";
      ledgerEntry.method = method;
      if (orderId) ledgerEntry.orderId = orderId;
      if (contractId) ledgerEntry.contractId = contractId;
      await ledgerEntry.save();
    }

    return ledgerEntry;
  } catch (err) {
    log.error("Failed to log transaction submission in ledger", {
      hash,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/**
 * Updates the confirmation status of a logged transaction entry to CONFIRMED or FAILED.
 */
export async function updateLedgerStatus(
  hash: string,
  status: string,
  error?: string
): Promise<SorobanTransactionLedger> {
  log.info("Updating transaction ledger status", { hash, status, error });
  if (status !== "CONFIRMED" && status !== "FAILED") {
    throw new Error(`Invalid status update: ${status}. Must be CONFIRMED or FAILED.`);
  }

  try {
    const ledgerEntry = await SorobanTransactionLedger.findByPk(hash);
    if (!ledgerEntry) {
      log.error("Transaction ledger entry not found for update", { hash });
      throw new Error(`Transaction ledger entry not found for hash: ${hash}`);
    }

    ledgerEntry.status = status;
    if (status === "CONFIRMED") {
      ledgerEntry.confirmedAt = new Date();
      ledgerEntry.errorDetails = null;
    } else {
      ledgerEntry.errorDetails = error || "Transaction failed";
    }

    await ledgerEntry.save();
    return ledgerEntry;
  } catch (err) {
    log.error("Failed to update transaction ledger status", {
      hash,
      status,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
