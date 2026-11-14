# Task-based usability observation protocol

## Purpose and participants

Observe whether target learners can start practice, reuse a saved scenario, and find a learning helper without facilitator instructions. Recruit 5–8 Chinese- or English-speaking adult English learners across beginner and intermediate levels, including people unfamiliar with TalkSprout. Record each participant's preferred UI language and prior experience. This is a small qualitative usability study; it does not establish population-wide success rates or learning effectiveness.

## Session setup

Allow approximately 20–30 minutes per participant. Use a fresh browser profile for the first-use task, then retain that profile for reuse. Let the participant choose Chinese or English and check whether that choice persists after a reload. Explain that the product is being tested, ask them to think aloud, and obtain consent before recording. Use fictional material and avoid collecting personal conversations or account credentials. An external AI account is optional: a prepared conversation can support the return-and-review task when external access is unavailable. Clearly label prepared material as a simulation.

## Tasks

Give these goals one at a time without naming navigation controls or demonstrating the path:

1. **First-use start:** “You have five minutes to practice English about your day. Find a suitable practice option and prepare what you would use to start in your preferred AI chat.” Observe how they choose, find instructions, copy, and understand the handoff. If they use a real provider, record that separately from merely copying a prompt.
2. **Saved scenario reuse:** “Prepare a scenario you expect to practice again and save it. Leave this page, return, and start preparing the same scenario again.” Observe discovery of saving, recovery of the saved item, persistence after reload, and understanding of the selected scenario.
3. **Learning helper and return review:** “Find help improving an English expression, copy the instructions you would use, and then return to review what you practiced.” Let the participant choose a learning helper. Observe whether they distinguish helpers from conversation practice, understand where to paste, and find the return/review route. A copied prompt or a prepared conversation does not demonstrate a real AI response.

After each task, ask what they expected, what was confusing, and how confident they feel that the next step will work. At the end, ask which action they would repeat independently.

## Observation and assistance

Record task completion as independent, assisted, or not completed; record elapsed time manually, wrong turns, hesitation, and requests for help. Allow exploration before intervening. When assistance is needed, first restate the goal, then give a minimal hint, and record the hint verbatim. Separate visible behavior from the observer's interpretation. Do not count provider/network failures as product navigation failures without investigating the cause.

## Blank session record

- Participant code:
- Date / facilitator:
- Consent / recording agreement:
- Preferred language / English level / prior app experience:
- Device / browser / fresh profile used:
- Language persistence observation:
- Task: first-use start / saved scenario reuse / learning helper and return review
- Start and end time / elapsed time:
- Completion: independent / assisted / not completed
- Observed actions, wrong turns, and hesitation:
- Participant quote:
- Assistance given:
- External provider used, prepared simulation used, or copy-only:
- Expected result / observed result:
- Confidence and difficulty reported by participant:
- Observer interpretation (separate from observations):
- Follow-up question or improvement candidate:

Repeat the task portion for each of the three tasks. After all sessions, group recurring difficulties, retain contradictory observations, and prioritize changes by task impact. Report participant counts alongside qualitative findings. This document contains a protocol and blank template only; no sessions or results are claimed.

## Measurement limits

TalkSprout does not automatically track these sessions, read external AI conversations, or measure AI outcomes or learning progress. Timing, completion, and observations in this protocol are manually recorded with consent. Browser navigation evidence, copied prompt text, authored model-role simulations, and real model/API execution are separate evidence types. This study does not establish audio or provider compatibility, response quality, or improvement in English proficiency.

## Ready-to-run materials and aggregation

- [Participant task cards](usability/task-cards.md): read-aloud goals, completion criteria, assistance rules, optional crowded-home task, and a clearly labeled fictional transcript.
- [Blank session record](usability/session-record.md): copy privately for each consenting participant.
- [Task records CSV](usability/task-records.csv): one row per participant/task, headers only until sessions occur.
- [Aggregation CSV](usability/aggregation.csv): one row per task/language/app revision, headers only until observations exist.

Before recruitment, assign a facilitator and record the exact app revision and device/browser. Do not commit identifiable participant records or recordings. Keep raw records private; share only consented, de-identified findings. These materials do not recruit participants or constitute a completed human study.

For aggregation, count `independent`, `assisted`, and `not_completed` as attempted; keep `not_attempted` separate. Report counts and denominators for each task and language, including skipped optional task T2b. Calculate median elapsed seconds only from completed timed tasks, label that subset and its sample count, and retain unsuccessful attempts in the raw observations. Do not combine provider waiting time with app navigation time without labeling it. Calculate confidence medians only from numeric answers and report the sample count. Leave unavailable measurements blank, never zero. Include contradictory observations and link every proposed change to participant codes and observable behavior. With 5–8 participants, treat these as qualitative patterns rather than population estimates.

Current execution status: task materials prepared; recruitment, participant sessions, timing collection, and aggregation remain unperformed. Browser regressions and model evaluations elsewhere in this repository are separate evidence and cannot fill these participant records.

See [real-device handoff checklist](usability/device-handoff.md) for physical-device checks. It is unexecuted and must not be reported as device or provider verification.
