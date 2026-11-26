# Spec Delta

## ADDED Requirements

### Requirement: Flexible portrait cabinet
The cabinet SHALL fit a portrait aspect ratio between 9:20 and 10:16, clamping outside that range. The game area SHALL preserve its existing proportions and use the available width where possible.

#### Scenario: Supported portrait ratio
- **WHEN** available cabinet space has a ratio within the supported range
- **THEN** the cabinet uses that space within its size constraints

#### Scenario: Outside the supported range
- **WHEN** available cabinet space is taller or wider than the supported range
- **THEN** the cabinet remains centered and its ratio stays within the range

### Requirement: Compact cabinet presentation
The cabinet SHALL display a compact single-line title in the control panel and omit the top marquee and bottom decorative strip.

#### Scenario: Playing the game
- **WHEN** the game is displayed
- **THEN** the scoreboard, game area and directional controls remain visible and usable
