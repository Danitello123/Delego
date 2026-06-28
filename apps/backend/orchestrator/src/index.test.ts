import { describe, it, expect, vi, beforeEach } from "vitest";
import { persistWorkflowState, recoverWorkflowState } from "./index.js";

const mockQuery = vi.fn();
vi.mock("node:module", async (importOriginal) => {
  const original = await importOriginal<any>();
  return {
    ...original,
    createRequire: () => () => ({
      Pool: class {
        query = mockQuery;
      }
    })
  };
});

describe("Workflow Persistence", () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it("saves current machine state and context without db version (insert)", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    const context = { userId: "user-123", some: "data" };
    await persistWorkflowState("order-1", "Discovery", context);

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const queryCall = mockQuery.mock.calls[0];
    expect(queryCall[0]).toContain("INSERT INTO purchase_workflows");
    expect(queryCall[1]).toEqual(["order-1", "user-123", "Discovery", JSON.stringify(context)]);
  });

  it("saves current machine state and context with db version (update)", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    const context = { userId: "user-123", some: "data", _dbVersion: 1 };
    await persistWorkflowState("order-1", "SpendingCheck", context);

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const queryCall = mockQuery.mock.calls[0];
    expect(queryCall[0]).toContain("UPDATE purchase_workflows");
    expect(queryCall[1]).toEqual(["SpendingCheck", JSON.stringify(context), "order-1", 1]);
  });

  it("throws on optimistic concurrency failure", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 }); // no rows updated
    const context = { userId: "user-123", some: "data", _dbVersion: 1 };
    await expect(persistWorkflowState("order-1", "SpendingCheck", context))
      .rejects.toThrow("Optimistic concurrency failure: workflow order-1");
  });

  it("recovers workflow state successfully", async () => {
    const mockContext = { userId: "user-123" };
    mockQuery.mockResolvedValueOnce({
      rows: [{ state: "Discovery", context: mockContext, version: 2 }]
    });

    const result = await recoverWorkflowState("order-1");
    expect(result.state).toBe("Discovery");
    expect(result.context.userId).toBe("user-123");
    expect(result.context._dbVersion).toBe(2);
  });

  it("throws if workflow not found on recovery", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    await expect(recoverWorkflowState("order-x"))
      .rejects.toThrow("Workflow order-x not found");
  });
});
