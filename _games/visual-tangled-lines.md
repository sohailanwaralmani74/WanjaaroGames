---
layout: game
id: "visual-tangled-lines"
title: "Planar Graph Untangler"
category: "visual-geometry"
summary: "Drag circular vertices around the canvas until no connecting edge lines cross each other."
scoringCriterion: "lower"
permalink: /visual-tangled-lines/
redirect_from:
  - /game/visual-tangled-lines
  - /game/visual-tangled-lines/
tags:
  - tangled
  - graph
  - topology
  - planar
---

## Overview

Drag circular vertices around the canvas until no connecting edge lines cross each other.

## Instructions

A graph of interconnected vertices begins in a tangled knot with crossing red lines. Drag the nodes until every line turns blue and no two lines intersect. A pure topology puzzle.

## Strategy & Pro Tips

Move vertices with the highest number of connecting edges to the outer perimeter of the circle.

## Underlying Mechanics

Line segment intersection sweep-line algorithm (Bentley-Ottmann) for planar graph embedding.
