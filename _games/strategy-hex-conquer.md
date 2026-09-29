---
layout: game
id: "strategy-hex-conquer"
title: "Hex Territory Conquer"
category: "strategy-tactics"
summary: "Pick a color to flood your hex territory and absorb adjacent matching hexagons."
scoringCriterion: "lower"
permalink: /strategy-hex-conquer/
redirect_from:
  - /game/strategy-hex-conquer
  - /game/strategy-hex-conquer/
tags:
  - flood
  - hex
  - territory
  - color
---

## Overview

Pick a color to flood your hex territory and absorb adjacent matching hexagons.

## Instructions

You start at the top-left hex. Choose one of 5 colors. All adjacent hexes of that color are absorbed into your growing territory. Conquer more than 50% of the board before moves expire.

## Strategy & Pro Tips

Choose the color that touches the largest number of new boundary hexagons on every move.

## Underlying Mechanics

Connected-component flood fill algorithm on hex lattice.
