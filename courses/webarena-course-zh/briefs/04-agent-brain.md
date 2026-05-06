## Module 4: The Agent's Brain

### Teaching Arc
- **Metaphor:** A chess player thinking out loud — the agent doesn't just blurt out an action. It looks at the board (the accessibility tree), reasons through the situation step by step ("Let me think... I see a search box, I should type my query"), and then announces its move. This "think out loud" strategy is called Chain-of-Thought reasoning.
- **Opening hook:** "The agent sees a page full of numbered links and buttons. How does it decide which one to click? The answer: it asks an LLM to think out loud."
- **Key insight:** The agent doesn't "understand" web pages — it converts the page into text, stuffs it into a prompt with examples and instructions, sends it to GPT/LLM, and parses the response to extract an action like "click [101]".
- **"Why should I care?":** Understanding prompt engineering for agents is the core skill. The prompt template, few-shot examples, and response parsing all directly affect whether the agent succeeds or fails.

### Screens (4)
1. **The Prompt Recipe** — How a prompt is assembled: intro (system instructions) + examples (few-shot) + current observation + objective. Show the actual prompt template.
2. **Chain-of-Thought in Action** — The actual CoT prompt with the HP Fax Machine example. Code↔English translation of the prompt structure.
3. **From LLM Response to Browser Action** — How the agent extracts the action from the LLM's response using regex. The `_extract_action` method and action splitter.
4. **The PromptAgent Loop** — Code↔English of the `next_action` method showing the full cycle: construct prompt → call LLM → parse response → retry on failure.

### Code Snippets (pre-extracted)

**Snippet 1 — The actual CoT prompt (agent/prompts/raw/p_cot_id_actree_2s.py, lines 1-42):**
```python
prompt = {
    "intro": """You are an autonomous intelligent agent tasked with navigating a web browser. You will be given web-based tasks. These tasks will be accomplished through the use of specific actions you can issue.

Here's the information you'll have:
The user's objective: This is the task you're trying to complete.
The current web page's accessibility tree: This is a simplified representation of the webpage, providing key information.
The current web page's URL: This is the page you're currently navigating.
The open tabs: These are the tabs you have open.
The previous action: This is the action you just performed.""",
```

**Snippet 2 — A few-shot example from the prompt (agent/prompts/raw/p_cot_id_actree_2s.py, lines 43-55):**
```python
    "examples": [
        (
            """OBSERVATION:
[1744] link 'HP CB782A#ABA 640 Inkjet Fax Machine (Renewed)'
        [1749] StaticText '$279.49'
        [1757] button 'Add to Cart'
URL: http://onestopmarket.com/office-products/office-electronics.html
OBJECTIVE: What is the price of HP Inkjet Fax Machine
PREVIOUS ACTION: None""",
            "Let's think step-by-step. This page list the information of HP Inkjet Fax Machine, which is the product identified in the objective. Its price is $279.49. I think I have achieved the objective. I will issue the stop action with the answer. In summary, the next action I will perform is ```stop [$279.49]```",
        ),
```

**Snippet 3 — PromptAgent.next_action (agent/agent.py, lines 118-154):**
```python
    def next_action(
        self, trajectory: Trajectory, intent: str, meta_data: dict[str, Any]
    ) -> Action:
        prompt = self.prompt_constructor.construct(
            trajectory, intent, meta_data
        )
        lm_config = self.lm_config
        n = 0
        while True:
            response = call_llm(lm_config, prompt)
            force_prefix = self.prompt_constructor.instruction[
                "meta_data"
            ].get("force_prefix", "")
            response = f"{force_prefix}{response}"
            n += 1
            try:
                parsed_response = self.prompt_constructor.extract_action(
                    response
                )
                if self.action_set_tag == "id_accessibility_tree":
                    action = create_id_based_action(parsed_response)
                elif self.action_set_tag == "playwright":
                    action = create_playwright_action(parsed_response)
                else:
                    raise ValueError(
                        f"Unknown action type {self.action_set_tag}"
                    )
                action["raw_prediction"] = response
                break
            except ActionParsingError as e:
                if n >= lm_config.gen_config["max_retry"]:
                    action = create_none_action()
                    action["raw_prediction"] = response
                    break

        return action
```

**Snippet 4 — CoT extract_action (agent/prompts/prompt_constructor.py, lines 250-260):**
```python
    def _extract_action(self, response: str) -> str:
        # find the first occurence of action
        action_splitter = self.instruction["meta_data"]["action_splitter"]
        pattern = rf"{action_splitter}((.|\n)*?){action_splitter}"
        match = re.search(pattern, response)
        if match:
            return match.group(1).strip()
        else:
            raise ActionParsingError(
                f'Cannot find the answer phrase "{self.answer_phrase}" in "{response}"'
            )
```

### Interactive Elements

- [x] **Code↔English translation** — Snippet 3 (next_action method) and Snippet 4 (extract_action)
- [x] **Group chat animation** — A conversation showing the prompt being assembled:
  1. PromptConstructor → LLM: "[SYSTEM] You are an autonomous intelligent agent..."
  2. PromptConstructor → LLM: "[EXAMPLE] Here is an observation... The correct action was stop [$279.49]"
  3. PromptConstructor → LLM: "[USER] OBSERVATION: [164] textbox Search... URL: http://openstreetmap.org... OBJECTIVE: Show me restaurants near CMU"
  4. LLM → Agent: "Let me think step-by-step. I see a search box [164]. I should type my query. In summary, the next action I will perform is ```type [164] [restaurants near CMU] [1]```"
  5. Agent (thinking): "Found the action between the ``` marks: type [164] [restaurants near CMU] [1]"
  6. Agent → Browser Env: "Execute: type [164] [restaurants near CMU] [1]"
- [x] **Step cards** — The 4 steps of prompt assembly: (1) Load intro instructions, (2) Add few-shot examples, (3) Format current observation with template, (4) Send to LLM API
- [x] **Quiz** — 3 questions, debugging style:
  1. "The agent keeps outputting 'I cannot help with that' instead of an action. Where would you look to debug this?" (answer: the prompt — the intro instructions may be too restrictive, or the few-shot examples don't match the observation format)
  2. "You want the agent to reason more carefully before acting. What would you change?" (answer: switch from DirectPromptConstructor to CoTPromptConstructor, which adds step-by-step reasoning)
  3. "The LLM returns 'click [42]' but the action parser fails. What went wrong?" (answer: the action wasn't wrapped in the expected action_splitter markers — e.g., backticks ```)
- [x] **Glossary tooltips** — Chain-of-Thought (CoT), few-shot learning, prompt engineering, prompt template, action splitter, regex, parsing, LLM (Large Language Model), API call, retry logic, force prefix, tokenizer

### Reference Files to Read
- `references/interactive-elements.md` → Code↔English Translation, Group Chat Animation, Numbered Step Cards, Multiple-Choice Quizzes, Glossary Tooltips
- `references/content-philosophy.md` → all
- `references/gotchas.md` → all

### Connections
- **Previous module:** "The Virtual Browser" — showed what the agent sees (observations) and what actions are available
- **Next module:** "The Scorekeeper" — how the evaluator determines if the agent's actions actually completed the task
- **Tone/style notes:** Teal accent. Module 4 uses `--color-bg-warm` background. Agent = actor-2 (teal), LLM = actor-3 (plum) for chat and flow animations.
