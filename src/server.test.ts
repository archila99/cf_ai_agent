import { describe, expect, it } from "vitest";
import { env } from "cloudflare:test";
import { getAgentByName } from "agents";

describe("CounterAgent", () => {
  it("increment increments and returns the new count", async () => {
    const agent = await getAgentByName(env.CounterAgent, "counter-test-1");

    await agent.reset();
    expect(await agent.increment()).toBe(1);
    expect(await agent.increment()).toBe(2);
  });

  it("reset sets the counter back to zero", async () => {
    const agent = await getAgentByName(env.CounterAgent, "counter-test-2");

    await agent.increment();
    await agent.increment();
    await agent.reset();

    expect(await agent.increment()).toBe(1);
  });
});
