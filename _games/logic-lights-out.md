---
layout: game
id: "logic-lights-out"
title: "Lights Out Matrix"
category: "logic-puzzles"
summary: "Toggle cells to turn all lights off; clicking any cell flips its state and all four neighbors."
scoringCriterion: "lower"
permalink: /logic-lights-out/
redirect_from:
  - /game/logic-lights-out
  - /game/logic-lights-out/
  - /lights-out
  - /lights-out/
  - /game/lights-out
  - /game/lights-out/
tags:
  - lights
  - toggle
  - matrix
  - puzzle
---

## Overview

Toggle cells to turn all lights off; clicking any cell flips its state and all four neighbors.

## Instructions

Clicking any grid button toggles its state (on/off) and also toggles the cells directly above, below, left, and right. Solve the puzzle by extinguishing every single light in fewest moves.

## Strategy & Pro Tips

Work from the top row down to the bottom row systematically ("chasing the lights").

## Underlying Mechanics

Modulo-2 linear algebra grid toggler with solvable seed generation.
