---
name: vfd-segment-display
description: Architecture, coordinate paths, and phosphor physics for 14-segment alphanumeric Vacuum Fluorescent Displays (VFD) used in retro electronics.
---

# 14-Segment VFD Display Guide

## Physical Layout

The 14-segment alphanumeric display extends standard 7-segment numeric displays to support full English capital letters and symbols:

```text
       -- a --
     |\   |   /|
     f h  i  j b
     |  \ | /  |
     --g1-+-g2--
     |  / | \  |
     e k  l  m c
     |/   |   \|
       -- d --   (dp)
```

## Optical and Phosphor Emulation

- **Color**: Luminous cyan-green (`#2bffcd` with intense core `#ffffff` and bloom `rgba(43, 255, 205, 0.85)`).
- **Substrate**: Dark acrylic smoky window (`#091a16`) with subtle scanline overlay.
- **Unlit Traces**: Unlit segments remain faintly visible (`rgba(10, 55, 45, 0.25)`) replicating real physical filaments in evacuated glass tubes.
- **Blinking Cursor**: Underline segment `d` pulses at ~450ms intervals during user entry.
