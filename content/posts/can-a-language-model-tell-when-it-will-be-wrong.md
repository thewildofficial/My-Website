---
title: "Can a Language Model Tell When It Will Be Wrong?"
date: 2026-08-07T12:00:00+05:30
draft: false
toc: true
description: "What survived an audit of my hidden-state probing experiments, what failed, and the cross-model test I want to run next."
tags:
  - AI
  - interpretability
  - research
  - epistemic-self-awareness
---

I started the Epistemic Self-Awareness project with a practical question: can a language model detect its own failures before it finishes an answer?

If it can, the signal could support routing. A small model handles a question first. A probe reads the model's hidden state and estimates whether the answer will be correct. The system keeps likely successes on the small model and sends likely failures to a stronger model or tool.

My first experiments looked much stronger than the evidence I have now.

That is the useful part of this project. Each failed claim made the next test clearer.

## Why this project exists

The present AI stack looks too much like mainframe computing. Intelligence lives in a remote data center. We rent it by the token. Every email, document, and agent action can become a request to somebody else's machine.

I want the default to be local.

Most everyday work does not need the largest model in the world. A small model on a phone or laptop can handle routine writing, file work, and tool calls. It is faster, works offline, and keeps private context on the device. A frontier model still matters for hard math, difficult code, and genuinely novel problems. It should be the escalation path, not the starting point.

I described this view in [The Edge manifesto](https://x.com/AbanHResearch/status/2059327404146090100): put a small cognitive core on every device, let it handle the everyday, and route the hard work upward.

The missing piece is the routing layer.

A local model cannot route by confidence alone. Language models often sound most certain when they are outside their depth. A useful router needs to estimate whether this specific model is likely to succeed on this prompt, under this token budget, before it spends the full generation cost.

The same problem appears when models become agents. Give a person an unclear task on an unfamiliar server and they will often inspect the machine, read the files, or ask a question before changing anything. A language model often skips that step. It commits before it has enough information.

I want an agent to have a measurable reason to pause. A low sufficiency score could make it:

- ask the user for missing context;
- inspect its environment;
- call search, retrieval, or a calculator;
- defer to a stronger model;
- abstain when no safe route exists.

Most uncertainty methods score an answer after generation or compare several sampled answers. By then, the model has already spent the compute and chosen a solution path. I am interested in the moment before that commitment, when the model has read the problem but has not generated the answer.

This is what I mean by epistemic self-awareness. I do not mean consciousness or access to objective truth. I mean an operational estimate of a model's own boundary: given this prompt, domain, and token budget, how likely is this model to succeed?

In the manifesto, I treated a strong within-task probe result as if it had already solved that handshake. The audit below shows why that was too early. The local-first goal survives. The claim about what the probe measures had to become much narrower.

That distinction is now the scientific core of the project. A signal that tracks prompt format, task identity, or answer length may still help a router. But it is not evidence that a model knows when it is wrong. The experiments below are my attempt to separate those claims.

## The first signal

I ran the experiments on Qwen3.5-4B. I trained small classifiers, called probes, on the model's internal activations. The label was simple: did the model answer the question correctly?

Within one task, several probes separated correct and incorrect answers. Held-out AUROC ranged from 0.712 to 0.950 across six tasks.

AUROC measures how often a classifier ranks a positive example above a negative one. A score of 0.5 is random. A score of 1 is perfect.

Those numbers looked promising. They also came from small test sets, often with 20 to 40 items. Most tasks had weak or failed control results. Only the TriviaQA control suite passed the recorded threshold.

The first result was real in a narrow sense. Some Qwen3.5-4B hidden states contained information about correctness within the task used to train the probe. It did not show that the same boundary would work on a new task or model.

## The 0.9962 result was leakage

One pooled experiment reported AUROC 0.9962. That number would imply an almost perfect domain-agnostic correctness probe.

An audit found that the probe had trained on the same samples used for evaluation. A reproduction of that protocol reached AUROC 1.0. Once I held out each domain before training, the mean AUROC fell to 0.4777.

The corrected result is near chance:

| Held-out task | AUROC |
|---|---:|
| ARC | 0.420 |
| HumanEval | 0.475 |
| MATH | 0.534 |
| TriviaQA | 0.483 |
| Mean | 0.478 |

I have retired 0.9962 as evidence for a universal probe. The [public evidence ledger](https://github.com/thewildofficial/epistemic-steering/blob/main/docs/evidence-ledger.md) records the correction and points to the audit files.

## A correctness direction became a task detector

I then asked whether the probes shared a small internal representation. I compressed the activations to three dimensions and tested two things.

The representation predicted the task identity with 98.7% test accuracy. But when I trained a correctness boundary without one task and transferred it to that unseen task, mean AUROC was 0.358.

The representation knew where the question came from. It did not encode one shared state of knowing.

This distinction matters. A probe can look good because it detects task, style, prompt format, answer length, or difficulty. None of those signals is the same as a model knowing that its answer is wrong.

## A temporal model tied a simple baseline

I expected the path through the hidden states to matter. A model that watched the full trajectory should have beaten a simple summary if the order carried useful information.

The trajectory transformer reached validation AUROC 0.8577. Spatial max pooling reached the same AUROC. Mean pooling reached 0.8485.

The sequence contained a correctness signal. The temporal model did not get more value from its order. For now, the simple baseline wins.

## Answer length was a confound

Another experiment compared the hidden state before generation with states from the first generated tokens. The first analysis suggested that waiting for tokens improved routing.

A larger MATH run added a held-out split and an answer-length control. The improvement became small after residualizing answer length and fell below the preregistered threshold.

Wrong answers often ran longer. A generation-time probe could exploit that pattern without learning anything about reasoning quality.

I treat this as a historical result because the current public package does not contain enough primary artifacts for a clean rerun. I will not use it as a headline claim until I recover the files or repeat the experiment.

## Detection was not control

The project began with the word "steering." The hope was that a direction which predicts error might also correct it.

An archived intervention changed hidden states along a probe direction at five strengths on 30 MATH questions. None improved accuracy.

That test was small, but it draws an important line. A diagnostic feature is not automatically a causal control knob. The current evidence does not show self-correction or end-to-end hallucination prevention.

## What survived

After the audit, I think four claims remain defensible:

1. Qwen3.5-4B hidden states can predict correctness within some tasks.
2. The result depends on the task, prompt, labels, split, and controls.
3. The low-rank representations I tested encode task identity better than unseen-task correctness.
4. The temporal model I tested did not beat spatial max pooling.

That is narrower than "models know when they are wrong." It is still enough to justify a routing experiment.

The right question is no longer whether one 4B model contains a universal correctness direction. The question is whether any useful routing signal reproduces across model families and scales under one fixed protocol.

## The next test

I want to run the same protocol across matched-size Qwen, Gemma, Mistral, and Llama-family models. I will then test scale ladders in two families and repeat the strongest result on a 70B-class model.

Each run will use:

- held-out tasks and fixed split manifests;
- audited labels and sample identifiers;
- answer-length and task-identity controls;
- bootstrap confidence intervals;
- repeat seeds;
- crash-safe artifact and compute logs.

I will publish the negative results under the same protocol as the positive ones.

## I need compute

I am an undergraduate student and independent researcher in Bangalore. I do not have access to a GPU cluster.

The first replication stage needs about 250 H100-equivalent GPU hours. The main scale study needs about 1,250 hours. A 70B-class confirmation stage could bring the total request to 2,500 hours.

The pilot can stand alone. I will publish its report and compute ledger before asking for the next stage.

I am looking for research credits, spare cluster capacity, or a research group that wants to run the replication with me. The [code and corrected technical report are public](https://github.com/thewildofficial/epistemic-steering). The [compute proposal](https://github.com/thewildofficial/epistemic-steering/blob/main/docs/compute-proposal.md) gives the staged budget and outputs.

If you can help, email [abanpersonal@gmail.com](mailto:abanpersonal@gmail.com) or contact [@AbanHResearch](https://x.com/AbanHResearch).
