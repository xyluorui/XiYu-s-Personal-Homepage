## Module 5: The Scorekeeper

### Teaching Arc
- **Metaphor:** Three different judges at a talent show — one checks if you sang the right lyrics (StringEvaluator), one checks if you ended up on the right stage (URLEvaluator), and one goes backstage to verify you actually changed the scenery (HTMLContentEvaluator). Each judge has their own scoring method, and you need to pass ALL of them.
- **Opening hook:** "The agent says it found the answer. But did it really? WebArena doesn't trust the agent's word — it checks the receipts."
- **Key insight:** Automated evaluation of web tasks is surprisingly hard. You can't just check the agent's final answer — sometimes you need to check the URL the browser landed on, or inspect the actual HTML of the page to verify the agent changed something.
- **"Why should I care?":** Understanding evaluation is crucial for understanding benchmark scores. A "35% success rate" means the evaluator judged 35% of trajectories as correct — but the evaluator itself has design choices that affect what counts as "correct."

### Screens (4)
1. **Three Ways to Grade** — Pattern cards for the 3 evaluator types: StringEvaluator (check the answer text), URLEvaluator (check the final URL), HTMLContentEvaluator (inspect page content). Each with examples of when they're used.
2. **The String Evaluator** — How exact_match, must_include, and fuzzy_match work. Code↔English translation of the matching logic. The LLM-as-judge fallback for fuzzy matching.
3. **Checking the Page** — How HTMLContentEvaluator navigates to a URL, runs JavaScript to select elements, and checks if required content is present. This is how WebArena verifies the agent actually changed something (e.g., posted a comment, added an item to cart).
4. **The Evaluator Router** — How the config file specifies which evaluators to use, and how EvaluatorComb multiplies scores together (all must pass).

### Code Snippets (pre-extracted)

**Snippet 1 — StringEvaluator methods (evaluation_harness/evaluators.py, lines 71-111):**
```python
class StringEvaluator(Evaluator):
    """Check whether the answer is correct with:
    exact match: the answer is exactly the same as the reference answer
    must include: each phrase in the reference answer must be included in the answer
    fuzzy match: the answer is similar to the reference answer, using LLM judge
    """

    @staticmethod
    def clean_answer(answer: str) -> str:
        answer = answer.strip()
        if answer.startswith("'") and answer.endswith("'"):
            answer = answer[1:-1]
        elif answer.startswith('"') and answer.endswith('"'):
            answer = answer[1:-1]
        return answer.lower()

    @staticmethod
    def exact_match(ref: str, pred: str) -> float:
        return float(
            StringEvaluator.clean_answer(pred)
            == StringEvaluator.clean_answer(ref)
        )

    @staticmethod
    def must_include(ref: str, pred: str, tokenize: bool = False) -> float:
        clean_ref = StringEvaluator.clean_answer(ref)
        clean_pred = StringEvaluator.clean_answer(pred)
        if (
            tokenize
            and len(clean_ref) == 1
            and len(word_tokenize(clean_ref)) == 1
        ):
            tok_pred = word_tokenize(clean_pred)
            return float(clean_ref in tok_pred)
        else:
            return float(clean_ref in clean_pred)
```

**Snippet 2 — evaluator_router (evaluation_harness/evaluators.py, lines 355-374):**
```python
def evaluator_router(config_file: Path | str) -> EvaluatorComb:
    """Router to get the evaluator class"""
    with open(config_file, "r") as f:
        configs = json.load(f)

    eval_types = configs["eval"]["eval_types"]
    evaluators: list[Evaluator] = []
    for eval_type in eval_types:
        match eval_type:
            case "string_match":
                evaluators.append(StringEvaluator())
            case "url_match":
                evaluators.append(URLEvaluator())
            case "program_html":
                evaluators.append(HTMLContentEvaluator())
            case _:
                raise ValueError(f"eval_type {eval_type} is not supported")

    return EvaluatorComb(evaluators)
```

**Snippet 3 — EvaluatorComb multiply scores (evaluation_harness/evaluators.py, lines 336-352):**
```python
class EvaluatorComb:
    def __init__(self, evaluators: list[Evaluator]) -> None:
        self.evaluators = evaluators

    def __call__(
        self,
        trajectory: Trajectory,
        config_file: Path | str,
        page: Page | PseudoPage,
        client: CDPSession,
    ) -> float:
        score = 1.0
        for evaluator in self.evaluators:
            cur_score = evaluator(trajectory, config_file, page, client)
            score *= cur_score
        return score
```

### Interactive Elements

- [x] **Code↔English translation** — Snippet 1 (StringEvaluator methods) and Snippet 3 (EvaluatorComb)
- [x] **Pattern cards** — The 3 evaluator types with icons and "when it's used" descriptions
- [x] **Flow diagram** — The evaluation pipeline: Config file → evaluator_router → [StringEvaluator, URLEvaluator, HTMLContentEvaluator] → multiply scores → final score (0 or 1)
- [x] **Quiz** — 3 questions, scenario style:
  1. "The agent correctly navigates to a product page and reports the price as '$279.49', but the reference answer is '279.49' (no dollar sign). Does it pass?" (answer: yes, the clean_answer method strips quotes and lowercases, and must_include checks substring containment)
  2. "A task requires the agent to post a comment on Reddit. Which evaluator type would check if the comment actually appeared?" (answer: HTMLContentEvaluator — it navigates to the page and inspects the DOM)
  3. "A task uses both url_match and string_match evaluators. The agent gets the URL right but the answer wrong. What's the final score?" (answer: 0, because EvaluatorComb multiplies scores: 1.0 × 0.0 = 0.0)
- [x] **Callout box** — "Why multiply instead of average? Multiplying means ALL evaluators must pass. If any single check fails, the whole task fails. This is strict on purpose — a half-right web task is usually wrong."
- [x] **Glossary tooltips** — evaluator, router, reference answer, exact match, fuzzy match, tokenize, trajectory, DOM inspection, JavaScript locator, score multiplication, PseudoPage

### Reference Files to Read
- `references/interactive-elements.md` → Code↔English Translation, Pattern/Feature Cards, Flow Diagrams, Multiple-Choice Quizzes, Callout Boxes, Glossary Tooltips
- `references/content-philosophy.md` → all
- `references/gotchas.md` → all

### Connections
- **Previous module:** "The Agent's Brain" — showed how the agent decides what action to take
- **Next module:** "The Full Run" — traces a complete evaluation from config file to final score
- **Tone/style notes:** Teal accent. Module 5 uses `--color-bg` background. Evaluator = actor-5 (forest green) for highlights.
