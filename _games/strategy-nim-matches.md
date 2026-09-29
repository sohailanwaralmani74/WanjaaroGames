---
layout: game
id: "strategy-nim-matches"
title: "Game of Nim"
category: "strategy-tactics"
summary: "Take 1, 2, or 3 matchsticks from the pile. Force the opponent bot to take the last match!"
scoringCriterion: "higher"
permalink: /strategy-nim-matches/
redirect_from:
  - /game/strategy-nim-matches
  - /game/strategy-nim-matches/
tags:
  - nim
  - matches
  - game-theory
  - math
---

## Overview

Take 1, 2, or 3 matchsticks from the pile. Force the opponent bot to take the last match!

## Instructions

On your turn, remove 1, 2, or 3 matchsticks from the heap. In this "misère" variation, whoever takes the very last match loses the game. Play strategically to force a win.

## Strategy & Pro Tips

The winning positions leave the heap at 5, 9, 13, 17 matches (multiples of 4 plus 1).

## Underlying Mechanics

Mathematical Nim-sum (modulo 4) game theory engine.
