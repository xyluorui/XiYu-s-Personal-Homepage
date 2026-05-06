## Module 2: Meet the Cast

### Teaching Arc
- **Metaphor:** A play with four actors on stage — the Browser Env is the stage (the real websites), the Agent is the performer (the AI deciding what to do), the LLM is the performer's inner voice (the reasoning engine), and the Evaluator is the judge holding the scorecard.
- **Opening hook:** "Four characters make WebArena work. Each has one job, and they pass notes to each other to get through a task."
- **Key insight:** WebArena separates concerns cleanly — the browser env handles websites, the agent handles decisions, the LLM handles reasoning, and the evaluator handles grading. This separation lets you swap any piece without touching the others.
- **"Why should I care?":** Knowing which piece does what helps you understand where things go wrong — is the agent picking bad actions, is the LLM reasoning poorly, or is the evaluator grading unfairly?

### Screens (4)
1. **The Four Characters** — Icon rows introducing Browser Env, Agent, Evaluator, LLM with one-liner descriptions.
2. **The Architecture Diagram** — Interactive architecture diagram. Click each component to see what it does. Show the folder structure as a visual file tree.
3. **How They Talk** — Group chat animation: Agent asks LLM for next action, LLM responds with reasoning, Agent tells Browser Env to execute, Browser Env returns new observation, Agent sends trajectory to Evaluator.
4. **The File Map** — Visual file tree showing the actual project structure with annotations.

### Code Snippets (pre-extracted)

**Snippet 1 — Agent class structure (agent/agent.py, lines 28-39):**
```python
class Agent:
    """Base class for the agent"""

    def __init__(self, *args: Any) -> None:
        pass

    def next_action(
        self, trajectory: Trajectory, intent: str, meta_data: Any
    ) -> Action:
        """Predict the next action given the observation"""
        raise NotImplementedError
```

**Snippet 2 — construct_agent factory (agent/agent.py, lines 160-182):**
```python
def construct_agent(args: argparse.Namespace) -> Agent:
    llm_config = lm_config.construct_llm_config(args)

    agent: Agent
    if args.agent_type == "teacher_forcing":
        agent = TeacherForcingAgent()
    elif args.agent_type == "prompt":
        with open(args.instruction_path) as f:
            constructor_type = json.load(f)["meta_data"]["prompt_constructor"]
        tokenizer = Tokenizer(args.provider, args.model)
        prompt_constructor = eval(constructor_type)(
            args.instruction_path, lm_config=llm_config, tokenizer=tokenizer
        )
        agent = PromptAgent(
            action_set_tag=args.action_set_tag,
            lm_config=llm_config,
            prompt_constructor=prompt_constructor,
        )
    else:
        raise NotImplementedError(
            f"agent type {args.agent_type} not implemented"
        )
    return agent
```

**Snippet 3 — LMConfig dataclass (llms/lm_config.py, lines 12-30):**
```python
@dataclass(frozen=True)
class LMConfig:
    """A config for a language model."""

    provider: str
    model: str
    model_cls: type | None = None
    tokenizer_cls: type | None = None
    mode: str | None = None
    gen_config: dict[str, Any] = dataclasses.field(default_factory=dict)
```

### Interactive Elements

- [x] **Code↔English translation** — Snippet 1 (Agent base class) and Snippet 3 (LMConfig)
- [x] **Icon rows** — The 4 main components with icons and descriptions
- [x] **Group chat animation** — 6 messages:
  1. Agent → LLM: "Here is what I see on the page [accessibility tree]. The user wants me to 'find the price of HP Inkjet Fax Machine.' What should I do?"
  2. LLM → Agent: "Let me think step by step... I can see the price is $279.49 next to the product. I should stop and report the answer."
  3. Agent → Browser Env: "Execute: stop [$279.49]"
  4. Browser Env → Agent: "Action executed. Task terminated."
  5. Agent → Evaluator: "Here is my full trajectory. Did I get it right?"
  6. Evaluator → Agent: "Score: 1.0. The answer matches the reference. PASS!"
- [x] **Visual file tree** — Top-level project structure
- [x] **Architecture diagram** — Browser Env, Agent, LLM, Evaluator as clickable components
- [x] **Quiz** — 3 questions:
  1. "The agent keeps clicking the same button over and over. Which component would detect this problem?" (answer: run.py's early_stop function)
  2. "You want to test a new LLM (like Claude instead of GPT). Which component would you change?" (answer: LLM/provider config, not Agent logic)
  3. "The agent gives the correct answer but gets scored 0. Where is the bug most likely?" (answer: the Evaluator or the config file's reference answer)
- [x] **Glossary tooltips** — dataclass, factory function, base class, prompt constructor, tokenizer, provider, frozen dataclass, type hints

### Reference Files to Read
- `references/interactive-elements.md` → Code↔English Translation, Icon-Label Rows, Group Chat Animation, Visual File Tree, Interactive Architecture Diagram, Multiple-Choice Quizzes, Glossary Tooltips
- `references/content-philosophy.md` → all
- `references/gotchas.md` → all

### Connections
- **Previous module:** "What Is WebArena?" — introduced the benchmark, the 6 websites, the basic observe→act→evaluate loop
- **Next module:** "The Virtual Browser" — dives deep into how the browser environment works
- **Tone/style notes:** Teal accent. Module 2 uses `--color-bg-warm` background. Actor colors: Browser Env = actor-1 (vermillion), Agent = actor-2 (teal), LLM = actor-3 (plum), Evaluator = actor-5 (forest). Keep these consistent across all modules.
