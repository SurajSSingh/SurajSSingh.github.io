---
title: Super Mouse AI
date: '2025-04-04T00:00:00.000Z'
last_modified: 2025-04-11T05:21:00.000Z
summary: A tool to transcribe your voice with a click of your mouse
weight: 5
org: freelance
links:
  - name: GitHub Repo
    link: 'https://github.com/SurajSSingh/SuperMouseAI'
cover_image:
  file: /assets/images/Super-Mouse-AI-1.png
  alt_text: Screenshot of Super Mouse AI running
additional_image: []
tech_stack:
  - TypeScript
  - SvelteKit
  - Rust
  - Tauri
  - Whisper
skills:
  - Freelancing
  - GitHub
  - GitHub Actions
  - GitHub Projects
project_info:
  role: Lead Developer
highlighted_project: false
project_link: 'https://github.com/SurajSSingh/SuperMouseAI'
---

## What is it

It is an app that let's your transcribe your voice locally using
[Whisper.cpp](https://github.com/ggml-org/whisper.cpp).

I started development as a freelace developer after my work at P1 came to a
close. The client reached out to me about developing an app.

### Tools, Framework, and Libraries used

- [Rust](https://www.rust-lang.org): Backend
- [Tauri](https://tauri.app): Application framework
- [whisper-rs](https://github.com/tazz4843/whisper-rs): Wrapper for
  [whisper.cpp](https://github.com/ggerganov/whisper.cpp) project, allowing
  local use of [Whisper](https://github.com/openai/whisper) model from
  [OpenAI](https://openai.com/index/whisper/)
- [mutter](https://github.com/sigaloid/mutter): Project that wraps `whisper-rs`.
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)/[TypeScript](https://www.typescriptlang.org):
  Frontend language
- [Deno](https://deno.com): Runtime
- [Svelte/SvelteKit](https://svelte.dev): Framework/Meta-framework
- [BitsUI](https://www.bits-ui.com/docs/introduction) +
  [Shadcn-Svelte](https://www.shadcn-svelte.com): Functional components
- [TailwindCSS](https://tailwindcss.com) + [DaisyUI](https://daisyui.com): App
  styling
- [extendable-media-recorder](https://github.com/chrisguttandin/extendable-media-recorder):
  An extendable drop-in replacement for the native MediaRecorder, for record
  user voice to WAV for transcription.

## Status

Presently in alpha, still being development, aiming for Late-April/Early May for
public beta
