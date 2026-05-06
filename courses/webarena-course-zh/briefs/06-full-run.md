## Module 6: The Full Run

### Teaching Arc
- **Metaphor:** Race day — the modules so far were like learning about the car engine, the track layout, and the rules. Now it's race day: we're watching a complete lap from start to finish. The green flag drops (run.py starts), the car navigates the course (agent loops), and the judge waves the checkered flag (evaluator scores).
- **Opening hook:** "You've met all the pieces. Now let's watch them work together — from the moment you type `python run.py` to the moment a score appears."
- **Key insight:** The main loop in run.py orchestrates everything: load config → create environment → loop (observe → act → check early stop) → evaluate → score. Understanding this loop is understanding the whole benchmark.
- **"Why should I care?":** When you run a web agent benchmark, this is what's happening behind the scenes. Knowing the full pipeline helps you diagnose issues, understand results, and design your own experiments.

### Screens (5)
1. **The Starting Line** — What happens when you run the command: argument parsing, agent construction, config file loading. Show the actual CLI command with badges for key arguments.
2. **The Main Loop** — The observe→act→evaluate cycle in run.py. Data flow animation tracing a single task through all 4 components.
3. **Early Stopping** — Why and how the benchmark stops agents early: max steps, repeated actions, parsing failures. Code↔English translation of the early_stop function.
4. **The Final Score** — How the trajectory is passed to the evaluator, how scores are aggregated, and what the output looks like. The "average score" at the end.
5. **The Big Picture** — Wrap-up: what you've learned, how all the pieces fit together, where to go next. Architecture diagram callback.

### Code Snippets (pre-extracted)

**Snippet 1 — The main loop (run.py, lines 281-329):**
```python
            agent.reset(config_file)
            trajectory: Trajectory = []
            obs, info = env.reset(options={"config_file": config_file})
            state_info: StateInfo = {"observation": obs, "info": info}
            trajectory.append(state_info)

            meta_data = {"action_history": ["None"]}
            while True:
                early_stop_flag, stop_info = early_stop(
                    trajectory, max_steps, early_stop_thresholds
                )

                if early_stop_flag:
                    action = create_stop_action(f"Early stop: {stop_info}")
                else:
                    try:
                        action = agent.next_action(
                            trajectory, intent, meta_data=meta_data
                        )
                    except ValueError as e:
                        action = create_stop_action(f"ERROR: {str(e)}")

                trajectory.append(action)

                action_str = get_action_description(
                    action,
                    state_info["info"]["observation_metadata"],
                    action_set_tag=args.action_set_tag,
                    prompt_constructor=agent.prompt_constructor
                    if isinstance(agent, PromptAgent)
                    else None,
                )
                render_helper.render(
                    action, state_info, meta_data, args.render_screenshot
                )
                meta_data["action_history"].append(action_str)

                if action["action_type"] == ActionTypes.STOP:
                    break

                obs, _, terminated, _, info = env.step(action)
                state_info = {"observation": obs, "info": info}
                trajectory.append(state_info)

                if terminated:
                    trajectory.append(create_stop_action(""))
                    break
```

**Snippet 2 — Early stop logic (run.py, lines 161-214):**
```python
def early_stop(
    trajectory: Trajectory, max_steps: int, thresholds: dict[str, int]
) -> tuple[bool, str]:
    """Check whether need to early stop"""

    num_steps = (len(trajectory) - 1) / 2
    if num_steps >= max_steps:
        return True, f"Reach max steps {max_steps}"

    last_k_actions: list[Action]
    action_seq: list[Action]

    k = thresholds["parsing_failure"]
    last_k_actions = trajectory[1::2][-k:]
    if len(last_k_actions) >= k:
        if all(
            [
                action["action_type"] == ActionTypes.NONE
                for action in last_k_actions
            ]
        ):
            return True, f"Failed to parse actions for {k} times"

    k = thresholds["repeating_action"]
    last_k_actions = trajectory[1::2][-k:]
    action_seq = trajectory[1::2]

    if len(action_seq) == 0:
        return False, ""

    last_action: Action = action_seq[-1]

    if last_action["action_type"] != ActionTypes.TYPE:
        if len(last_k_actions) >= k:
            if all(
                [
                    is_equivalent(action, last_action)
                    for action in last_k_actions
                ]
            ):
                return True, f"Same action for {k} times"
```

**Snippet 3 — Evaluation and scoring (run.py, lines 330-342):**
```python
            evaluator = evaluator_router(config_file)
            score = evaluator(
                trajectory=trajectory,
                config_file=config_file,
                page=env.page,
                client=env.get_page_client(env.page),
            )

            scores.append(score)

            if score == 1:
                logger.info(f"[Result] (PASS) {config_file}")
            else:
                logger.info(f"[Result] (FAIL) {config_file}")
```

**Snippet 4 — CLI arguments (run.py, lines 60-147, selected):**
```python
    parser.add_argument("--max_steps", type=int, default=30)
    parser.add_argument("--agent_type", type=str, default="prompt")
    parser.add_argument("--instruction_path", type=str,
        default="agents/prompts/state_action_agent.json")
    parser.add_argument("--model", type=str, default="gpt-3.5-turbo-0613")
    parser.add_argument("--temperature", type=float, default=1.0)
    parser.add_argument("--max_obs_length", type=int, default=1920)
    parser.add_argument("--test_start_idx", type=int, default=0)
    parser.add_argument("--test_end_idx", type=int, default=1000)
```

### Interactive Elements

- [x] **Code↔English translation** — Snippet 1 (the main loop) and Snippet 2 (early stop logic)
- [x] **Data flow animation** — 8 steps tracing a complete task:
  1. run.py loads config file with intent "What is the price of HP Inkjet Fax Machine"
  2. Browser Env opens the shopping site URL
  3. Observation handler captures the accessibility tree
  4. Agent sends observation + intent to LLM
  5. LLM reasons and returns "stop [$279.49]"
  6. Agent parses the action and appends to trajectory
  7. STOP action detected — loop ends
  8. Evaluator checks "$279.49" against reference — PASS!
- [x] **Badge list** — Key CLI arguments (--max_steps, --model, --agent_type, --instruction_path, --test_start_idx, --test_end_idx) with descriptions
- [x] **Step cards** — The 3 early stop conditions: (1) Max steps reached (default 30), (2) Same action repeated 3 times, (3) Action parsing failed 3 times
- [x] **Quiz** — 3 questions:
  1. "You run WebArena with --max_steps 5 on a task that requires 8 steps to complete. What happens?" (answer: the agent is force-stopped after 5 steps and the evaluator likely scores it 0)
  2. "The average score across 812 tasks is 0.14. What does this mean in plain language?" (answer: the agent successfully completed about 14% of all tasks — roughly 114 out of 812)
  3. "You want to test Claude instead of GPT on WebArena. What would you need to change?" (answer: the --provider and --model arguments, and possibly add a new provider in llms/providers/)
- [x] **Callout box** — "The trajectory is the complete record: [observation, action, observation, action, ...]. It's the agent's 'game tape' — everything it saw and everything it did. Researchers analyze trajectories to understand why agents succeed or fail."
- [x] **Glossary tooltips** — CLI (command-line interface), argument parser, trajectory, early stopping, max steps, rendering, trace, checkpoint, debug mode, batch evaluation

### Reference Files to Read
- `references/interactive-elements.md` → Code↔English Translation, Message Flow / Data Flow Animation, Permission/Config Badges, Numbered Step Cards, Multiple-Choice Quizzes, Callout Boxes, Glossary Tooltips
- `references/content-philosophy.md` → all
- `references/gotchas.md` → all

### Connections
- **Previous module:** "The Scorekeeper" — showed how evaluation works in detail
- **Next module:** None — this is the final module. Wrap up with a "big picture" view and suggest next steps.
- **Tone/style notes:** Teal accent. Module 6 uses `--color-bg-warm` background. Use all 4 actor colors in the data flow animation to show all components working together. End on an empowering note — "you now understand the full pipeline."
