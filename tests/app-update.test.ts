import { test, mock } from "node:test";
import assert from "node:assert/strict";
import {
  createAppUpdateManager,
  type AppUpdateSnapshot,
} from "../src/app-update";

function harness(initiallyControlled = true) {
  class Worker extends EventTarget {
    state: ServiceWorkerState = "installed";
    messages = 0;
    throws = false;
    postMessage() {
      this.messages++;
      if (this.throws) throw Error("Worker is gone");
    }
  }
  const old = new Worker();
  old.state = "activated";
  const next = new Worker();
  const registration = Object.assign(new EventTarget(), {
    waiting: next as Worker | null,
    installing: null as Worker | null,
    active: old as Worker | null,
    updates: 0,
    update: async () => {
      registration.updates++;
      return registration;
    },
  });
  const container = Object.assign(new EventTarget(), {
    controller: initiallyControlled ? old : (null as Worker | null),
    register: async () => registration,
  });
  let snapshot: AppUpdateSnapshot = { phase: "idle" };
  let reloads = 0;
  const manager = createAppUpdateManager({
    container: container as unknown as ServiceWorkerContainer,
    onChange: (s) => (snapshot = s),
    reload: () => reloads++,
    onRegistrationError: () => {},
  });
  return {
    old,
    next,
    registration,
    container,
    manager,
    get snapshot() {
      return snapshot;
    },
    get reloads() {
      return reloads;
    },
    activate(events = true) {
      next.state = "activated";
      registration.active = next;
      registration.waiting = null;
      if (events) next.dispatchEvent(new Event("statechange"));
    },
  };
}

test("acceptance gives immediate feedback and blocks duplicate requests", async () => {
  const h = harness();
  await h.manager.start("sw.js");
  assert.equal(h.snapshot.phase, "available");
  h.manager.request();
  h.manager.request();
  assert.equal(h.snapshot.phase, "applying");
  assert.equal(h.next.messages, 1);
  h.manager.dispose();
});
test("activation without controllerchange or statechange still reloads exactly once", async () => {
  mock.timers.enable({ apis: ["setTimeout", "setInterval"] });
  const h = harness();
  await h.manager.start("sw.js");
  h.manager.request();
  h.activate(false);
  mock.timers.tick(500);
  assert.equal(h.reloads, 1);
  h.container.controller = h.next;
  h.container.dispatchEvent(new Event("controllerchange"));
  h.next.dispatchEvent(new Event("statechange"));
  mock.timers.tick(20000);
  assert.equal(h.reloads, 1);
  h.manager.dispose();
  mock.timers.reset();
});
test("timeout keeps an actionable state and resume detects late activation", async () => {
  mock.timers.enable({ apis: ["setTimeout", "setInterval"] });
  const h = harness();
  await h.manager.start("sw.js");
  h.manager.request();
  mock.timers.tick(12000);
  assert.equal(h.snapshot.phase, "stalled");
  assert.equal(h.reloads, 0);
  h.manager.request();
  assert.equal(h.next.messages, 2);
  mock.timers.tick(12000);
  h.activate(false);
  h.manager.resume();
  assert.equal(h.reloads, 1);
  h.manager.dispose();
  mock.timers.reset();
});
test("an already activated offered worker recovers on tap, but the old active worker never qualifies", async () => {
  const h = harness();
  await h.manager.start("sw.js");
  h.activate(false);
  h.manager.request();
  assert.equal(h.reloads, 1);
  h.manager.dispose();
  const stale = harness();
  await stale.manager.start("sw.js");
  stale.registration.waiting = null;
  stale.next.state = "redundant";
  stale.manager.request();
  assert.equal(stale.reloads, 0);
  assert.equal(stale.snapshot.phase, "error");
  stale.manager.dispose();
});
test("send failure and redundant activation recover through retry", async () => {
  const h = harness();
  await h.manager.start("sw.js");
  h.next.throws = true;
  h.manager.request();
  assert.equal(h.snapshot.phase, "error");
  h.next.throws = false;
  h.manager.request();
  assert.equal(h.snapshot.phase, "applying");
  h.next.state = "redundant";
  h.next.dispatchEvent(new Event("statechange"));
  assert.equal(h.snapshot.phase, "error");
  assert.equal(h.reloads, 0);
  h.manager.dispose();
});
test("the first worker claim never reloads and disposal cancels activation observers", async () => {
  const h = harness();
  h.container.controller = null;
  h.registration.waiting = null;
  await h.manager.start("sw.js");
  h.container.controller = h.old;
  h.container.dispatchEvent(new Event("controllerchange"));
  assert.equal(h.reloads, 0);
  h.registration.waiting = h.next;
  h.registration.dispatchEvent(new Event("updatefound"));
  h.manager.request();
  h.manager.dispose();
  h.activate();
  h.container.controller = h.next;
  h.container.dispatchEvent(new Event("controllerchange"));
  assert.equal(h.reloads, 0);
});

test("the initial cache installation never advertises an app update", async () => {
  const h = harness(false);
  h.registration.active = null;
  await h.manager.start("sw.js");
  assert.equal(h.snapshot.phase, "idle");
  h.activate(false);
  h.container.controller = h.next;
  h.container.dispatchEvent(new Event("controllerchange"));
  assert.equal(h.snapshot.phase, "idle");
  assert.equal(h.reloads, 0);
  h.manager.dispose();
});
