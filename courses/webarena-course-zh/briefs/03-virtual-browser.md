## Module 3: The Virtual Browser

### Teaching Arc
- **Metaphor:** A flight simulator — just like a flight simulator gives pilots a cockpit with real instruments and a realistic world outside the windshield, WebArena gives the AI agent a real browser with real websites. The agent sees the same buttons and links a human would, but through a simplified "instrument panel" (the accessibility tree).
- **Opening hook:** "When you browse a website, you see colors, images, and layout. When the AI browses the same website, it sees a numbered list of buttons and links. Same page, radically different view."
- **Key insight:** The browser environment translates the visual complexity of a web page into structured text (the accessibility tree) that an AI can process, and translates the AI's text commands (like "click [101]") back into real browser actions.
- **"Why should I care?":** Understanding how the agent "sees" the web is essential for understanding why it succeeds or fails. Most agent failures come from the observation being too large, elements not being visible in the viewport, or actions being parsed incorrectly.

### Screens (5)
1. **What the Agent Sees** — Layer toggle demo: show the same GitLab page as (1) a screenshot, (2) HTML source, (3) accessibility tree. The accessibility tree is what the agent actually works with.
2. **The Action Menu** — Pattern cards showing the action types: click, type, scroll, hover, press, goto, new_tab, tab_focus, close_tab, go_back, go_forward, stop. Each with a one-liner.
3. **How Actions Execute** — Code↔English translation of the execute_action function showing how a "click [101]" command gets turned into a real browser click via Playwright.
4. **The ScriptBrowserEnv** — Code↔English translation of the environment class showing the Gym interface (reset, step). Show how it launches Chromium, sets up the viewport, and handles cookies.
5. **The Config File** — Show what a task config contains: intent, start_url, evaluation criteria, storage_state (cookies). Badge list format.

### Code Snippets (pre-extracted)

**Snippet 1 — ActionTypes enum (browser_env/actions.py, lines 240-271):**
```python
class ActionTypes(IntEnum):
    """Valid action types for browser env."""

    NONE = 0
    SCROLL = 1
    KEY_PRESS = 2
    MOUSE_CLICK = 3
    KEYBOARD_TYPE = 4
    MOUSE_HOVER = 5
    CLICK = 6
    TYPE = 7
    HOVER = 8
    PAGE_FOCUS = 9
    NEW_TAB = 10
    GO_BACK = 11
    GO_FORWARD = 12
    GOTO_URL = 13
    PAGE_CLOSE = 14
    CHECK = 15
    SELECT_OPTION = 16
    STOP = 17
```

**Snippet 2 — create_id_based_action parsing (browser_env/actions.py, lines 1504-1518):**
```python
def create_id_based_action(action_str: str) -> Action:
    """Main function to return individual id based action"""
    action_str = action_str.strip()
    action = (
        action_str.split("[")[0].strip()
        if "[" in action_str
        else action_str.split()[0].strip()
    )
    match action:
        case "click":
            match = re.search(r"click ?\[(\d+)\]", action_str)
            if not match:
                raise ActionParsingError(f"Invalid click action {action_str}")
            element_id = match.group(1)
            return create_click_action(element_id=element_id)
```

**Snippet 3 — ScriptBrowserEnv.step (browser_env/envs.py, lines 231-269):**
```python
def step(
    self, action: Action
) -> tuple[dict[str, Observation], float, bool, bool, dict[str, Any]]:
    if not self.reset_finished:
        raise RuntimeError("Call reset first before calling step.")

    success = False
    fail_error = ""
    try:
        self.page = execute_action(
            action,
            self.page,
            self.context,
            self.observation_handler.action_processor,
        )
        success = True
    except Exception as e:
        fail_error = str(e)

    if self.sleep_after_execution > 0:
        time.sleep(self.sleep_after_execution)

    observation = self._get_obs()
    observation_metadata = self._get_obs_metadata()

    info = {
        "page": DetachedPage(self.page.url, self.page.content()),
        "fail_error": fail_error,
        "observation_metadata": observation_metadata,
    }
    msg = (
        observation,
        float(success),
        False,
        False,
        info,
    )
    return msg
```

**Snippet 4 — env_config.py websites and accounts (browser_env/env_config.py, lines 1-51):**
```python
REDDIT = os.environ.get("REDDIT", "")
SHOPPING = os.environ.get("SHOPPING", "")
SHOPPING_ADMIN = os.environ.get("SHOPPING_ADMIN", "")
GITLAB = os.environ.get("GITLAB", "")
WIKIPEDIA = os.environ.get("WIKIPEDIA", "")
MAP = os.environ.get("MAP", "")
HOMEPAGE = os.environ.get("HOMEPAGE", "")

ACCOUNTS = {
    "reddit": {"username": "MarvelsGrantMan136", "password": "test1234"},
    "gitlab": {"username": "byteblaze", "password": "hello1234"},
    "shopping": {
        "username": "emma.lopez@gmail.com",
        "password": "Password.123",
    },
    "shopping_admin": {"username": "admin", "password": "admin1234"},
}
```

### Interactive Elements

- [x] **Code↔English translation** — Snippet 2 (action parsing) and Snippet 3 (env.step)
- [x] **Layer toggle** — 3 layers showing the same page as: screenshot → HTML → accessibility tree
- [x] **Pattern cards** — The action types grouped by category (Page Operations, Tab Management, URL Navigation, Completion)
- [x] **Badge list** — Config file fields (intent, start_url, storage_state, eval, reference_answers, etc.)
- [x] **Data flow animation** — 5 steps: (1) Config file loads, (2) Browser opens start URL, (3) Observation handler captures accessibility tree, (4) Agent sends action, (5) Browser executes action and returns new observation
- [x] **Quiz** — 3 questions:
  1. "The agent types 'click [999]' but element 999 doesn't exist on the page. What happens?" (answer: execute_action throws an exception, step returns success=False)
  2. "Why does the environment use an accessibility tree instead of raw HTML?" (answer: the accessibility tree is a simplified, structured representation — much smaller and easier for an LLM to process than full HTML)
  3. "The agent needs to log into GitLab before performing a task. How does WebArena handle this?" (answer: via storage_state cookies in the config file, pre-generated by auto_login.py)
- [x] **Glossary tooltips** — Playwright, Chromium, accessibility tree, DOM, viewport, CDP (Chrome DevTools Protocol), environment variable, enum, IntEnum, Gymnasium, headless browser, regex, TypedDict

### Reference Files to Read
- `references/interactive-elements.md` → Code↔English Translation, Layer Toggle Demo, Pattern/Feature Cards, Permission/Config Badges, Message Flow / Data Flow Animation, Multiple-Choice Quizzes, Glossary Tooltips
- `references/content-philosophy.md` → all
- `references/gotchas.md` → all

### Connections
- **Previous module:** "Meet the Cast" — introduced the 4 components at a high level
- **Next module:** "The Agent's Brain" — how the agent constructs prompts and decides what action to take
- **Tone/style notes:** Teal accent. Module 3 uses `--color-bg` background. Browser Env = actor-1 color for highlights.
