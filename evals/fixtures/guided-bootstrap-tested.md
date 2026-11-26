---
name: talksprout
description: Use TalkSprout for English coaching, role-play and interview practice, conversation review, source-grounded listening/reading/writing, and learning-method explanations. Load current remote instructions when the learner asks for TalkSprout learning.
---
# TalkSprout

At the start of each new learning session, retrieve the current remote entry. If TalkSprout MCP is already connected, call get_guide and follow its returned entry path with read_document. Otherwise use the host’s public URL reader to open https://raw.githubusercontent.com/OctopusGarage/talksprout/main/content/en/start.md or https://raw.githubusercontent.com/OctopusGarage/talksprout/main/content/zh/start.md, choosing the learner’s language.

Follow that entry’s current instructions and relative catalog links; fetch only the selected material and retain it during the active task. These stable URLs intentionally follow the latest remote learning guidance, independently of the installed package version. Keep one retrieval route and its returned content identity within a task.

If the raw URL reader fails, try the same entry through https://github.com/OctopusGarage/talksprout/blob/main/content/ once. If neither route is available, explain the limitation rather than pretending to retrieve instructions. Installation does not connect MCP or grant network, audio or camera access. Do not install runtimes or execute shell commands to fetch learning content; normal host loading of this installed Skill is separate.
