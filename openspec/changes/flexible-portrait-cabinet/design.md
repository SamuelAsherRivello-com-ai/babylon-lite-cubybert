# Design

## Context
The cabinet is a flex column with a WebGPU canvas and fixed portrait ratio.

## Goals / Non-Goals
Preserve game rules, input and isometric composition while adapting the cabinet to portrait screens. No renderer replacement is planned.

## Decisions
Use CSS to clamp the available cabinet ratio to 9:20 through 10:16. Keep the arena at its original width-to-height proportions, centered and bounded by the remaining height. Move the title into the console and remove decorative bands. The engine continues observing canvas size.

## Risks / Trade-offs
Short screens can constrain labels and buttons; verify responsive layouts and gameplay at the ratio limits and landscape sizes.
