---
layout: game
id: "perception-shadow-match"
title: "Shadow Silhouette Match"
category: "perception-vision"
summary: "Given a geometric 3D object, select which 2D shadow silhouette it casts."
scoringCriterion: "higher"
permalink: /perception-shadow-match/
redirect_from:
  - /game/perception-shadow-match
  - /game/perception-shadow-match/
tags:
  - shadow
  - silhouette
  - 3d
  - projection
---

## Overview

Given a geometric 3D object, select which 2D shadow silhouette it casts.

## Instructions

A rotating 3D polygon is presented in perspective. Choose the exact 2D projection shadow it would cast onto the floor from the four candidate silhouettes.

## Strategy & Pro Tips

Count the vertices and check for distinctive acute angles that must appear in the projected shadow.

## Underlying Mechanics

Orthographic projection shadow simulator with distractor generation.
