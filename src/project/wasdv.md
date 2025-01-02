---
title: WASVD
date: '2024-02-10T00:00:00.000Z'
image: /assets/images/wasvd.png
alt: Example of WASM function visualized
summary: A WebAssembly Stack Visual Debugger
project_link: 'https://github.com/SurajSSingh/WASVD'
weight: 3
start_new_row: true
highlighted_project: true
project_info:
  demo_gif: images/gifs/WASVD-Demo.gif
  role: Primary Developer
  summary: >-
    A simple stack visualizer to allow me to learn how WebAssembly (text)
    execution happens. Learned how to interoperate between Rust and TypeScript
    (via <a href='https://tauri.app'>Tauri</a>).
  external_links:
    github: 'https://github.com/SurajSSingh/WASVD'
last_modified: 2025-01-02T05:29:00.000Z
links:
  - name: GitHub Repo
    link: 'https://github.com/SurajSSingh/WASVD'
cover_image:
  file: /assets/images/gifs/WASVD-Demo.gif
  alt_text: Demo of WASVD
additional_image:
  - link: /assets/images/wasvd.png
    alt_text: Example of WASM function visualized
    is_award: false
tech_stack:
  - Tauri
  - Rust
  - Svelte
  - SkeletonUI
skills: []
---
## Overview

A visual debugger for WebAssembly Text format. The idea is to allow one to see
how the stack works in WebAssembly, which can make it easier to understand and
write Wasm (text format). I started this to help understand how WebAssembly is
(generally) evaluated for
[Exercism's #12in23 Nibbly November](https://exercism.org/blog/nibbly-november)

### Tech Stack

- [Rust](https://www.rust-lang.org): Backend Programming Language
- [Tauri](https://tauri.app): Desktop Framework
- [TypeScript](https://www.typescriptlang.org): Frontend Programming Language
- [SvelteKit](https://kit.svelte.dev): JavaScript (Meta) Framework
- [SkeletonUI](https://www.skeleton.dev): Tailwind UI Framework

### Current Status

Version 1 finished. Reworking for version 2 to allow this to be made into a
website (by compiling Rust specific code into WebAssembly). Will also be trying
to split the WAT interpreter into a separate library for others to use.
