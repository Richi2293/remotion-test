# DigitalEvolution -- Remotion Cinematic Project Workflow

## Overview

This document outlines a **token-safe, production-grade workflow** for
building a cinematic Remotion project called **DigitalEvolution** using
Claude Code.

Goals: - Avoid 32k token overflow - Maintain clean architecture -
Generate files incrementally - Keep animations fully frame-based -
Follow Remotion best practices

------------------------------------------------------------------------

# Project Specs

-   Duration: 12 seconds
-   FPS: 60
-   Cinematic, futuristic style
-   Modular architecture
-   Reusable camera hook
-   Scene-based composition
-   No time-based logic (frame-based only)

------------------------------------------------------------------------

# Step 1 --- Architecture Design

## Prompt

    You are a senior creative engineer specialized in Remotion.

    Design the architecture for a cinematic Remotion project called "DigitalEvolution".

    Requirements:
    - 12 seconds
    - 60fps
    - Modular components
    - Reusable camera hook
    - Separate components for:
      - Particles
      - WireframeSphere
      - NeuralConnections
      - UIPanels
      - Logo3D
    - Scene-based structure

    IMPORTANT:
    - Do NOT write implementation code.
    - Output only:
      1. Folder structure
      2. Component list
      3. Responsibility of each file
    Keep it concise.

------------------------------------------------------------------------

# Step 2 --- Create Composition File

## Prompt

    Generate only the DigitalEvolution composition file.

    Constraints:
    - 60fps
    - 12 seconds
    - Scene-based sequencing using <Sequence>
    - Assume all components already exist
    - No implementation of child components
    - No explanations
    - Keep it concise

------------------------------------------------------------------------

# Step 3 --- Camera Hook

## Prompt

    Generate only the reusable camera hook for orbit and push animations.

    Requirements:
    - Frame-based logic
    - Use interpolation with easing
    - Clean reusable API
    - No external 3D libraries

    Do not generate other files.
    No explanations.

------------------------------------------------------------------------

# Step 4 --- Particles System

## Prompt

    Generate only the Particles component.

    Requirements:
    - Start from a single glowing particle
    - After 1 second explode into many particles
    - Frame-based animation
    - Lightweight implementation
    - No explanations

------------------------------------------------------------------------

# Step 5 --- Wireframe Sphere

## Prompt

    Generate only the WireframeSphere component.
    Rotating on its own axis.
    No camera logic.
    No explanations.

------------------------------------------------------------------------

# Step 6 --- Neural Connections

## Prompt

    Generate only the NeuralConnections component.
    Animate progressive connection lines.
    Simulate data flow animation.
    Frame-based only.
    No explanations.

------------------------------------------------------------------------

# Step 7 --- UI Panels

## Prompt

    Generate only the UIPanels component.

    Requirements:
    - Glassmorphism style
    - Staggered spring animations
    - One highlighted panel scaling up
    - Frame-based logic
    No explanations.

------------------------------------------------------------------------

# Step 8 --- Logo 3D

## Prompt

    Generate only the Logo3D component.

    Requirements:
    - 3D extruded effect (fake with CSS transforms)
    - Cinematic feel
    - Smooth scale-in
    - Final floating state
    No explanations.

------------------------------------------------------------------------

# Safety Constraint (Always Add)

To prevent token overflow, always append:

    If output becomes long, stop and wait for continuation.

Optional optimization:

    Implement a minimal functional version first.
    We will refine it later.

------------------------------------------------------------------------

# Recommended Development Flow

1.  Generate architecture
2.  Implement composition
3.  Implement camera system
4.  Build scene components incrementally
5.  Refine transitions
6.  Add cinematic polish (motion blur, DOF, glitch)

------------------------------------------------------------------------

# Why This Workflow Prevents Token Overflow

-   One file per generation
-   No full project dumps
-   No verbose explanations
-   Modular component structure
-   Controlled iterative development

------------------------------------------------------------------------

# Final Result

You will end up with:

-   A clean modular Remotion project
-   Fully frame-based animations
-   Cinematic 3D-style motion
-   Scalable architecture
-   No 32k output token errors

------------------------------------------------------------------------

End of document.
