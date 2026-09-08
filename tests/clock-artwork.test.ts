import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { access } from "node:fs/promises";
import { clockSources } from "../lib/builder-catalog";
import { clockArtwork, clockSource, dialMarkers } from "../lib/clock-artwork";

test("Every selectable clock has an aspect-correct face inside its photographed frame", async () => {
  for (const source of clockSources) {
    const profile = clockArtwork(source.code);
    assert.ok(profile, source.code);
    const metadata = await sharp(`public${clockSource(source.code, "romen")}`).metadata();
    assert.equal(profile.aspect, metadata.width! / metadata.height!, source.code);
    assert.ok(profile.left >= 0 && profile.top >= 0);
    assert.ok(profile.width > 0 && profile.height > 0);
    assert.ok(profile.left + profile.width < 100 && profile.top + profile.height < 100);
    assert.ok(profile.pivotY > 0 && profile.pivotY < 100);
  }
});

test("Frame-specific round, narrow, dark and silver treatments stay distinct", () => {
  assert.equal(clockArtwork("10")?.silver, false);
  assert.equal(clockArtwork("04")?.silver, true);
  assert.equal(clockArtwork("48")?.narrow, true);
  assert.equal(clockArtwork("48")?.round, false);
  assert.equal(clockArtwork("53")?.round, true);
  assert.equal(clockArtwork("53")?.dark, true);
  assert.equal(clockArtwork("56")?.silver, true);
  assert.equal(clockArtwork("missing"), null);
});

test("Normal dial has four Arabic numerals and eight intermediate metal markers", () => {
  const marks = dialMarkers("normal");
  assert.equal(marks.length, 12);
  assert.deepEqual(marks.filter((mark) => mark.label).map((mark) => mark.label), ["12", "3", "6", "9"]);
  assert.equal(marks.filter((mark) => !mark.label).length, 8);
});

test("Minimal dial has twelve hour batons, four emphasized, and no numerals", () => {
  const marks = dialMarkers("minimal");
  assert.equal(marks.length, 12);
  assert.equal(marks.filter((mark) => mark.label).length, 0);
  assert.equal(marks.filter((mark) => mark.major).length, 4);
  for (const mark of marks) {
    assert.ok(mark.x >= 11 && mark.x <= 89);
    assert.ok(mark.y >= 11 && mark.y <= 89);
    assert.equal(mark.angle, mark.hour * 30);
  }
});

test("Clock surface is a local nonempty photographic material; existing cart URLs remain available", async () => {
  const surface = await sharp("public/images/builder-parts/woya/clock-glass-v2.png").stats();
  assert.ok(surface.channels.some((channel) => channel.stdev > 5));
  for (const source of clockSources) {
    for (const style of ["romen", "normal", "minimal"] as const) {
      await access(`public${clockSource(source.code, style)}`);
    }
  }
});
