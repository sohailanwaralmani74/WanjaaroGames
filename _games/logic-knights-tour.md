---
layout: game
id: "logic-knights-tour"
title: "Knight's Leap Puzzle"
category: "logic-puzzles"
summary: "Move the chess knight across the 5x5 board visiting maximum squares without repeats."
scoringCriterion: "higher"
permalink: /logic-knights-tour/
redirect_from:
  - /game/logic-knights-tour
  - /game/logic-knights-tour/
tags:
  - knight
  - chess
  - tour
  - graph
---

## Overview

Move the chess knight across the 5x5 board visiting maximum squares without repeats.

## Instructions

Click any valid L-shaped knight move (2 squares along one axis, 1 square perpendicular). Visit as many distinct chessboard squares as possible. Can you touch all 25 squares?

## Strategy & Pro Tips

Warnsdorff's rule: Always choose the move that leads to a square with the FEWEST remaining onward moves.

## Underlying Mechanics

Warnsdorff's heuristic graph traversal on 5x5 chess grid.
