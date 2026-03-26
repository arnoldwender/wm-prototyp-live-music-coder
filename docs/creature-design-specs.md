# Beatling Creature Design Specs

## Design Principles Applied
- Shape Language: each species has a unique silhouette from a different base shape
- Squash & Stretch: all creatures compress/expand on beats
- Follow-through: eyes and appendages lag behind body movement
- Audio-reactive: every visual property maps to an audio feature
- Bezier bodies: organic shapes, not plain circles

---

## 1. Beatling (Rhythm/Percussion)

### Identity
- Role: The drummer — reacts to beats and rhythm
- Personality: Energetic, bouncy, cheerful, extroverted
- Shape Language: **Circle** (friendly) + squash-stretch (dynamic)

### Visual Spec
- Base Shape: Round blob with 6-point bezier, wobbles on beats
- Color: #f97316 (orange)
- Eyes: Big round eyes, dilate on beats, sparkle
- Mouth: Open "O" on beats, big smile between beats
- Appendages: Two small round "ears" on top that bounce independently
- Size: Medium (base unit 1.0)

### Animation
- Movement: Strong vertical bounce synced to BPM, slight horizontal sway
- Beat Reaction: **Squash flat then spring tall** — most dramatic of all species
- Frequency Reaction: Bounces higher on louder beats
- Idle: Gentle breathing pulse, occasional head tilt

---

## 2. Looplet (Pattern/Loops)

### Identity
- Role: The sequencer — responds to pattern complexity
- Personality: Hypnotic, graceful, meditative, repetitive
- Shape Language: **Oval/Ellipse** (flowing) + rotation

### Visual Spec
- Base Shape: Horizontal oval that rotates slowly, bezier with 4 points
- Color: #a855f7 (purple)
- Eyes: Half-closed dreamy eyes, slow blink
- Mouth: Gentle permanent smile, widens with complexity
- Appendages: Circular orbit trail (afterimage rings)
- Size: Slightly smaller (0.9x)

### Animation
- Movement: Smooth circular orbit around center point
- Beat Reaction: Orbit speed pulses faster momentarily
- Frequency Reaction: Orbit radius grows with complexity
- Idle: Slow rotation, fading trail

---

## 3. Synthling (Melody/Synths)

### Identity
- Role: The singer — responds to high frequencies and melody
- Personality: Elegant, dreamy, ethereal, emotional
- Shape Language: **Teardrop/Vertical oval** (elegant, floating)

### Visual Spec
- Base Shape: Teardrop pointing up — wider at bottom, narrow at top
- Color: #3b82f6 (blue)
- Eyes: Large sparkling eyes with star-shaped highlights
- Mouth: Small "o" when singing (high freq), serene smile otherwise
- Appendages: Flowing sine-wave "hair" on top that waves with melody
- Size: Tall and slender (1.1x height, 0.8x width)

### Animation
- Movement: Graceful side-to-side float, like a jellyfish
- Beat Reaction: Subtle vertical stretch (elongates upward)
- Frequency Reaction: Hair waves faster with higher frequencies
- Idle: Gentle float with slow hair wave

---

## 4. Glitchbit (Noise/Distortion)

### Identity
- Role: The noise maker — responds to peaks and distortion
- Personality: Chaotic, mischievous, unpredictable, glitchy
- Shape Language: **Angular/Star** (dangerous, sharp, erratic)

### Visual Spec
- Base Shape: Irregular polygon with 5-7 vertices that jitter
- Color: #ef4444 (red)
- Eyes: Asymmetric — one big, one small. Twitch randomly
- Mouth: Jagged zigzag grin
- Appendages: Pixel debris orbiting body, occasional "glitch frame" (duplicate offset)
- Size: Small and compact (0.8x)

### Animation
- Movement: Random teleport-like jitter, never smooth
- Beat Reaction: "Glitch frame" — body duplicates with RGB offset for 2 frames
- Frequency Reaction: More pixel debris when peak is high
- Idle: Occasional twitch, pixels slowly orbit

---

## 5. Wavelet (Bass/Sub-frequencies)

### Identity
- Role: The bass — responds to low frequencies
- Personality: Calm, deep, heavy, zen, powerful
- Shape Language: **Wide horizontal oval** (grounded, heavy, stable)

### Visual Spec
- Base Shape: Wide flat oval, bezier with gentle undulation
- Color: #22c55e (green)
- Eyes: Small half-closed eyes (zen/sleepy), slow movement
- Mouth: Slight content smile, barely moves
- Appendages: Expanding ripple rings from body center
- Size: Wide and flat (0.7x height, 1.3x width)

### Animation
- Movement: Deep slow vertical wave, like floating on bass
- Beat Reaction: Body ripples outward (shockwave from center)
- Frequency Reaction: Deeper bass = stronger ripple, body gets wider
- Idle: Barely moves, just breathes slowly. Most still of all species.

---

## 6. Codefly (Code Activity)

### Identity
- Role: The coder — responds to user typing
- Personality: Quick, tiny, curious, buzzy, nervous
- Shape Language: **Small triangle** (fast, pointed) + wings (flying)

### Visual Spec
- Base Shape: Small rounded triangle (wider at bottom, point at top)
- Color: #fbbf24 (yellow/amber)
- Eyes: Tiny but very active — dart around constantly
- Mouth: Tiny, usually open in concentration "o"
- Appendages: Two translucent oval wings that buzz rapidly
- Size: Smallest creature (0.6x)

### Animation
- Movement: Fast erratic buzzing, figure-8 patterns
- Beat Reaction: Barely reacts to audio — mainly reacts to typing
- Typing Reaction: Flies faster, wings buzz more, leaves code-character trail
- Idle: Hovers in place with gentle wing buzz, occasionally darts to a new spot
