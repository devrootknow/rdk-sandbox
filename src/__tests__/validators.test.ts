import { describe, it, expect } from "vitest";
import { CreateAgentSchema, AgentStatusEnum, MachineEnum } from "@/lib/validators";

describe("Agent Validators", () => {
  it("validates a correct agent input", () => {
    const input = {
      machine: "ns2" as const,
      port: 9089,
      role: "builder",
      status: "idle" as const,
    };
    const result = CreateAgentSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.machine).toBe("ns2");
      expect(result.data.port).toBe(9089);
      expect(result.data.role).toBe("builder");
    }
  });

  it("rejects invalid port (below 9000)", () => {
    const input = {
      machine: "ns2" as const,
      port: 80,
      role: "builder",
    };
    const result = CreateAgentSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects invalid port (above 9999)", () => {
    const input = {
      machine: "ns2" as const,
      port: 10000,
      role: "builder",
    };
    const result = CreateAgentSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects invalid machine name", () => {
    const input = {
      machine: "unknown_machine",
      port: 9089,
      role: "builder",
    };
    const result = CreateAgentSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects empty role", () => {
    const input = {
      machine: "ns2" as const,
      port: 9089,
      role: "",
    };
    const result = CreateAgentSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("applies defaults for optional fields", () => {
    const input = {
      machine: "devpc" as const,
      port: 9012,
      role: "frontend",
    };
    const result = CreateAgentSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("idle");
      expect(result.data.contextPercent).toBe(0);
      expect(result.data.errorCount).toBe(0);
      expect(result.data.isOnline).toBe(true);
    }
  });

  it("validates all machine types", () => {
    const machines = ["devpc", "ns2", "imac", "gram", "thinkpad"] as const;
    for (const machine of machines) {
      const result = MachineEnum.safeParse(machine);
      expect(result.success).toBe(true);
    }
  });

  it("validates all status types", () => {
    const statuses = ["idle", "busy", "error", "offline"] as const;
    for (const status of statuses) {
      const result = AgentStatusEnum.safeParse(status);
      expect(result.success).toBe(true);
    }
  });
});
