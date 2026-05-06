## Module 1: What Is WebArena?

### Teaching Arc
- **Metaphor:** A driving test for AI — just like a driving test puts you behind a real wheel on real roads (not a simulator), WebArena puts AI agents on real websites to see if they can actually get things done.
- **Opening hook:** "Imagine handing a web browser to an AI and saying: 'Go buy the cheapest red jacket on this shopping site.' How would you know if it actually did it right?"
- **Key insight:** WebArena is a benchmark — a standardized test — that puts AI agents in front of real websites (shopping, Reddit, GitLab, Wikipedia, maps) and grades whether they completed real tasks.
- **"Why should I care?":** Understanding how benchmarks work helps you evaluate AI claims ("our agent scores 35% on WebArena") and understand what web agents can and can't do.

### Screens (4)
1. **The Big Idea** — What WebArena is in one sentence. The driving test metaphor. Why testing AI on real websites matters vs. toy demos.
2. **The Six Websites** — Pattern cards for each website: Shopping (e-commerce), Shopping Admin (CMS backend), Reddit (social forum), GitLab (code hosting), Map (OpenStreetMap), Wikipedia. Each with a one-liner about what tasks happen there.
3. **What a Task Looks Like** — Show a real task config: intent ("What is the price of HP Inkjet Fax Machine"), start URL, evaluation criteria. Use a code↔English translation block.
4. **The OpenAI Gym Loop** — The observe→act→evaluate cycle. Show the minimal_example.py code with translation.

### Code Snippets (pre-extracted)

**Snippet 1 — The Gym-style interaction (minimal_example.py, lines 89-105):**
```python
env = ScriptBrowserEnv(
    headless=False,
    slow_mo=100,
    observation_type="accessibility_tree",
    current_viewport_only=True,
    viewport_size={"width": 1280, "height": 720},
)

config_file = "config_files/156.json"
trajectory: Trajectory = []

obs, info = env.reset(options={"config_file": config_file})
actree_obs = obs["text"]
print(actree_obs)
```

**Snippet 2 — What an accessibility tree observation looks like (minimal_example.py, lines 108-119):**
```
[4] RootWebArea 'Projects · Dashboard · GitLab' focused: True
        [12] link 'Skip to content'
        [28] link 'Dashboard'
        [2266] button '' hasPopup: menu expanded: False
        [63] textbox 'Search GitLab' required: False
        [61] generic 'Use the shortcut key <kbd>/</kbd> to start a search'
        [79] link 'Create new...'
        [95] link 'Issues'
                [97] generic '13 assigned issues'
        [101] link 'Merge requests'
                [104] generic '8 merge requests'
```

**Snippet 3 — The step loop (minimal_example.py, lines 127-138):**
```python
match = re.search(r"\[(\d+)\] link 'Merge requests'", actree_obs).group(1)
click_action = create_id_based_action(f"click [{match}]")
trajectory.append(click_action)

obs, _, terminated, _, info = env.step(click_action)
actree_obs = obs["text"]
```

### Interactive Elements

- [x] **Code↔English translation** — Snippet 1 (the env setup + reset) and Snippet 3 (the action step loop)
- [x] **Pattern cards** — The 6 websites (Shopping, Shopping Admin, Reddit, GitLab, Map, Wikipedia) with icons and one-liners
- [x] **Quiz** — 3 questions, scenario style:
  1. "An AI agent is trying to find a product on the shopping site but keeps scrolling past it. What type of observation might help it 'see' the page better?" (answer: accessibility_tree vs html vs image)
  2. "Why does WebArena use real websites instead of simple mock pages?" (answer: real websites have complex, unpredictable UI)
  3. "A researcher claims their agent 'solves 50% of WebArena tasks.' What does that actually mean in practice?" (answer: the agent completed 50% of 812 tasks correctly per the evaluator)
- [x] **Glossary tooltips** — benchmark, agent, environment, accessibility tree, trajectory, observation, action, config file, Playwright, Gym/Gymnasium, viewport, headless browser

### Reference Files to Read
- `references/interactive-elements.md` → Code↔English Translation Blocks, Pattern/Feature Cards, Multiple-Choice Quizzes, Glossary Tooltips
- `references/design-system.md` → Module Structure, Color Palette (actor colors)
- `references/content-philosophy.md` → all (content rules)
- `references/gotchas.md` → all (checklist)

### Connections
- **Previous module:** None — this is the first module
- **Next module:** "Meet the Cast" — introduces the 4 main code components (Browser Env, Agent, Evaluator, LLM)
- **Tone/style notes:** Accent color is teal (#2A7B9B). Module 1 uses `--color-bg` background. Keep it exciting and accessible — this is the learner's first contact with the project. Use the driving test metaphor throughout.
