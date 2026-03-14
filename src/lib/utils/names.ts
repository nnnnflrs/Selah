const ADJECTIVES = [
  "Hushed",
  "Silent",
  "Wandering",
  "Distant",
  "Fading",
  "Glowing",
  "Drifting",
  "Quiet",
  "Sleepy",
  "Gentle",
  "Hidden",
  "Lonely",
  "Pale",
  "Misty",
  "Velvet",
  "Dusky",
];

const NOUNS = [
  "Owl",
  "Fox",
  "Star",
  "Moon",
  "Wave",
  "Cloud",
  "Ember",
  "Moth",
  "Crow",
  "Reef",
  "Dove",
  "Fern",
  "Haze",
  "Lynx",
  "Petal",
  "Shade",
];

export function generateAnonymousName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${adj} ${noun} #${num}`;
}

export function generateVoiceId(): string {
  return "Voice #" + crypto.randomUUID().slice(0, 4).toUpperCase();
}
