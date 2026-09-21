import assert from "node:assert/strict";
import test from "node:test";
import {
  COPY_FALLBACK_MESSAGE,
  COPY_MESSAGE,
  copyDemoLink,
  webSharePayload,
  whatsappMessage,
  whatsappUrls
} from "../src/lib/share.js";

const demo = "https://androidkrayze.github.io/jimmys-barber-demo/";

test("copies a demo link and confirms it", async () => {
  const writes = [];
  const result = await copyDemoLink(demo, {
    writeText: async (value) => {
      writes.push(value);
    }
  });
  assert.equal(result.ok, true);
  assert.equal(result.fallback, false);
  assert.equal(result.message, COPY_MESSAGE);
  assert.equal(result.message, "Demo link copied");
  assert.deepEqual(writes, [demo]);
});

test("falls back when the clipboard API is unavailable or rejects", async () => {
  const missing = await copyDemoLink(demo, null);
  assert.equal(missing.fallback, true);
  assert.equal(missing.ok, false);
  assert.equal(missing.text, demo);
  assert.equal(missing.message, COPY_FALLBACK_MESSAGE);

  const commands = [];
  const documentRef = {
    body: {
      appendChild() {},
    },
    createElement() {
      return {
        value: "",
        setAttribute() {},
        select() {},
        remove() {}
      };
    },
    execCommand(command) {
      commands.push(command);
      return true;
    }
  };
  const rejected = await copyDemoLink(demo, {
    writeText: async () => {
      throw new Error("denied");
    }
  }, documentRef);
  assert.equal(rejected.fallback, true);
  assert.equal(rejected.ok, true);
  assert.equal(rejected.message, "Demo link copied");
  assert.deepEqual(commands, ["copy"]);
});

test("WhatsApp messages use the business name and encode Jimmy's", () => {
  const message = whatsappMessage("Jimmy's Barber", demo);
  assert.equal(message, `Hello, we created a website demonstration for Jimmy's Barber.

You can view it here:
${demo}

If you like it, we can publish and manage it for your business.`);

  const urls = whatsappUrls(message);
  const encoded = encodeURIComponent(message).replaceAll("'", "%27");
  assert.equal(urls.mobile, `https://wa.me/?text=${encoded}`);
  assert.equal(urls.web, `https://web.whatsapp.com/send?text=${encoded}`);
  assert.match(urls.mobile, /Jimmy%27s%20Barber/);
  assert.match(urls.web, /Jimmy%27s%20Barber/);
  assert.doesNotMatch(urls.mobile, / /);
  assert.equal(decodeURIComponent(new URL(urls.mobile).searchParams.get("text")), message);
  assert.equal(decodeURIComponent(new URL(urls.web).searchParams.get("text")), message);

  const payload = webSharePayload("Jimmy's Barber", demo);
  assert.equal(payload.title, "Jimmy's Barber");
  assert.equal(payload.url, demo);
  assert.equal(payload.text, message);
});
