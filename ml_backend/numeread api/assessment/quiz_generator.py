import random
from typing import Dict, List, Any, Optional, Tuple

class QuizGenerator:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.question_bank: Dict[str, List[Dict[str, Any]]] = {}
        
    def add_questions(self, concept: str, questions: List[Dict[str, Any]]):
        if concept not in self.question_bank:
            self.question_bank[concept] = []
        self.question_bank[concept].extend(questions)
    
    def store_game_items(self, activity_id: str, difficulty: str, items: List[Dict[str, Any]], student_id: Optional[str] = None) -> str:
        """Store personalized or standard game items in the test bank storage repository."""
        key = f"{activity_id}:{difficulty}:{student_id or 'global'}"
        self.question_bank[key] = items
        return key

    def get_stored_game_items(self, activity_id: str, difficulty: str, student_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieve stored game items from the test bank storage."""
        if student_id:
            key = f"{activity_id}:{difficulty}:{student_id}"
            if key in self.question_bank and self.question_bank[key]:
                return self.question_bank[key]
        global_key = f"{activity_id}:{difficulty}:global"
        return self.question_bank.get(global_key, [])

    def generate_adaptive_quiz(self, student_profile: Dict[str, Any],
                             target_concepts: List[str],
                             num_questions: int = 10) -> List[Dict[str, Any]]:
        knowledge_state = student_profile.get('knowledge_state', {})
        learning_style = student_profile.get('learning_style', 'reading_writing')
        
        quiz_questions = []
        concept_weights = self.calculate_concept_weights(target_concepts, knowledge_state)
        
        for concept in target_concepts:
            weight = concept_weights.get(concept, 1.0)
            num_concept_questions = max(1, int(num_questions * weight))
            
            if concept in self.question_bank:
                available_questions = self.question_bank[concept]
                selected_questions = self.select_questions_by_style(
                    available_questions, learning_style, num_concept_questions
                )
                quiz_questions.extend(selected_questions)
        
        if len(quiz_questions) > num_questions:
            quiz_questions = random.sample(quiz_questions, num_questions)
        
        random.shuffle(quiz_questions)
        return quiz_questions
    
    def calculate_concept_weights(self, concepts: List[str], knowledge_state: Dict[str, float]) -> Dict[str, float]:
        weights = {}
        for concept in concepts:
            knowledge_level = knowledge_state.get(concept, 0)
            weights[concept] = 1.0 - knowledge_level
        return weights
    
    def select_questions_by_style(self, questions: List[Dict[str, Any]],
                                learning_style: str,
                                num_questions: int) -> List[Dict[str, Any]]:
        style_preferences = {
            'visual': ['diagram', 'image_based'],
            'auditory': ['audio_question', 'listening'],
            'kinesthetic': ['interactive', 'simulation'],
            'reading_writing': ['text', 'multiple_choice']
        }
        preferred_types = style_preferences.get(learning_style, ['multiple_choice'])
        preferred_questions = [q for q in questions if q.get('type') in preferred_types]
        other_questions = [q for q in questions if q.get('type') not in preferred_types]
        
        selected = preferred_questions[:num_questions]
        if len(selected) < num_questions:
            selected.extend(other_questions[:num_questions - len(selected)])
        return selected
    
    def evaluate_quiz_performance(self, quiz_questions: List[Dict[str, Any]],
                                student_answers: Dict[int, Any]) -> Dict[str, Any]:
        correct_count = 0
        concept_performance = {}
        total_questions = len(quiz_questions)
        
        for i, question in enumerate(quiz_questions):
            correct_answer = question.get('correct_answer')
            student_answer = student_answers.get(i)
            
            is_correct = student_answer == correct_answer
            if is_correct:
                correct_count += 1
            
            concept = question.get('concept', 'general')
            if concept not in concept_performance:
                concept_performance[concept] = {'correct': 0, 'total': 0}
            
            concept_performance[concept]['total'] += 1
            if is_correct:
                concept_performance[concept]['correct'] += 1
        
        overall_score = correct_count / total_questions if total_questions > 0 else 0
        concept_mastery = {}
        for concept, stats in concept_performance.items():
            concept_mastery[concept] = stats['correct'] / stats['total']
        
        return {
            'overall_score': overall_score,
            'correct_count': correct_count,
            'total_questions': total_questions,
            'concept_mastery': concept_mastery,
            'recommended_remediation': self.identify_remediation_needs(concept_mastery)
        }
    
    def identify_remediation_needs(self, concept_mastery: Dict[str, float]) -> List[str]:
        return [concept for concept, mastery in concept_mastery.items() if mastery < 0.6]

    # =========================================================================
    # UNIVERSAL PERSONALIZED GAME ITEM GENERATOR (ALL 12 GAMES)
    # =========================================================================

    def _choices(self, answer: Any, distractors: List[Any], count: int = 4) -> List[Any]:
        """Ensure choices list has exactly count unique items and contains answer."""
        seen = {str(answer)}
        clean_distractors = []
        for d in distractors:
            s = str(d)
            if s not in seen:
                seen.add(s)
                clean_distractors.append(d)
        all_choices = [answer] + clean_distractors[:(count - 1)]
        while len(all_choices) < count:
            try:
                num = int(answer)
                extra = num + len(all_choices)
                if str(extra) not in seen:
                    seen.add(str(extra))
                    all_choices.append(extra)
                else:
                    extra = num - len(all_choices)
                    if str(extra) not in seen:
                        seen.add(str(extra))
                        all_choices.append(extra)
            except Exception:
                fallback = f"Option {len(all_choices) + 1}"
                if fallback not in seen:
                    seen.add(fallback)
                    all_choices.append(fallback)
        random.shuffle(all_choices)
        return all_choices

    def generate_personalized_game_items(
        self,
        activity_id: str = "",
        difficulty: str = "medium",
        student_profile: Optional[Dict[str, Any]] = None,
        count: int = 10,
        subtopic_override: Optional[str] = None,
        student_id: Optional[str] = None,
        skill_gap: Optional[str] = None,
        mastery_levels: Optional[Dict[str, float]] = None,
        target_count: Optional[int] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Universal personalized game item generator supporting all 12 games in NumeRead.
        Dynamically adapts item parameters and instructional scaffolding based on the
        exact cognitive obstacle or difficulty friction the student encounters.
        """
        if not activity_id and kwargs.get("activity"):
            activity_id = kwargs.get("activity")

        if student_profile is None:
            student_profile = {}
        if student_id:
            student_profile["id"] = student_id
            student_profile["student_id"] = student_id
        if skill_gap:
            gaps = student_profile.get("gaps", [])
            if skill_gap not in gaps:
                gaps.append(skill_gap)
            student_profile["gaps"] = gaps
        if mastery_levels:
            current_mastery = student_profile.get("mastery_levels", {})
            current_mastery.update(mastery_levels)
            student_profile["mastery_levels"] = current_mastery
        if target_count is not None:
            count = target_count

        norm_diff = (difficulty or "medium").lower()
        if norm_diff == "hard":
            norm_diff = "advanced"
        elif norm_diff == "medium":
            norm_diff = "intermediate"

        stud_id = student_profile.get("id") or student_profile.get("student_id") or "anonymous_student"
        mastery = student_profile.get("mastery_levels", {})
        gaps = [str(g).lower() for g in student_profile.get("gaps", [])]
        failed_attempts = int(student_profile.get("failed_attempts", 0))
        recent_performance = float(student_profile.get("recent_performance", 1.0))
        struggling = bool(student_profile.get("struggling", False))

        # ---------------------------------------------------------------------
        # 1. SUBTRACTION SPRINT
        # ---------------------------------------------------------------------
        if activity_id == "subtraction-sprint":
            sub_mastery = float(mastery.get("Subtraction", 50))
            sub_gap = any("subtraction" in g for g in gaps)
            is_struggling = struggling or sub_gap or sub_mastery < 65 or failed_attempts > 0 or recent_performance < 0.75

            subtopic = subtopic_override or ""
            if not subtopic:
                if sub_mastery < 45 or norm_diff == "easy":
                    subtopic = "Counting back within 10 and 20"
                    focus_type = "counting_back"
                elif sub_mastery < 70 or norm_diff in ["average", "intermediate"]:
                    subtopic = "Subtracting across ten bridging strategy"
                    focus_type = "across_ten"
                else:
                    subtopic = "Two-digit subtraction with regrouping decomposition"
                    focus_type = "regrouping"
            else:
                focus_type = "across_ten" if "across" in subtopic.lower() or "bridge" in subtopic.lower() else (
                    "regrouping" if "regroup" in subtopic.lower() or "two-digit" in subtopic.lower() else "counting_back"
                )

            items = []
            for i in range(count):
                item_id = f"pers-ss-{stud_id}-{norm_diff}-{i + 1}"
                if focus_type == "counting_back":
                    a = random.randint(5, 12)
                    b = random.randint(1, min(4, a - 1))
                    answer = a - b
                    prompt = f"{a} - {b}"
                    tip = f"Hop backward {b} steps on the number line: start at {a}, count back {b} to land on {answer}."
                    distractors = [max(0, answer - 1), answer + 1, a + b]
                elif focus_type == "across_ten":
                    ones = random.randint(1, 6)
                    a = 10 + ones
                    b = ones + random.randint(2, min(5, 9 - ones))
                    answer = a - b
                    prompt = f"{a} - {b}"
                    step2 = b - ones
                    tip = f"Bridge through 10: {a} - {ones} = 10, then take away {step2} more to get {answer}!"
                    distractors = [max(0, answer - 1), answer + 1, 10 + abs(ones - step2), answer + 2]
                else:
                    tens_a = random.randint(2, 6)
                    ones_a = random.randint(1, 4)
                    a = tens_a * 10 + ones_a
                    b = random.randint(ones_a + 2, 9)
                    answer = a - b
                    prompt = f"{a} - {b}"
                    tip = f"Decompose: borrow 1 ten so the ones column becomes {ones_a + 10} - {b} = {answer % 10}, leaving {answer}."
                    distractors = [answer - 1, answer + 1, (tens_a * 10) - (b - ones_a)]

                items.append({
                    "id": item_id,
                    "prompt": prompt,
                    "a": a,
                    "b": b,
                    "answer": answer,
                    "choices": self._choices(answer, distractors),
                    "tip": tip,
                    "scaffold": f"Number line start: {a}, jump back: {b}",
                    "targetSubtopic": subtopic,
                    "isPersonalized": True
                })
            reason = "Personalized items generated to remediate subtraction difficulty." if is_struggling else "Adaptive subtraction practice items."

        # ---------------------------------------------------------------------
        # 2. DIVISION DASH
        # ---------------------------------------------------------------------
        elif activity_id == "division-dash":
            div_mastery = float(mastery.get("Division", 50))
            div_gap = any("division" in g for g in gaps)
            is_struggling = struggling or div_gap or div_mastery < 65 or failed_attempts > 0 or recent_performance < 0.75

            subtopic = subtopic_override or ""
            if not subtopic:
                if div_mastery < 50 or norm_diff == "easy":
                    subtopic = "Equal sharing and grouping with friendly divisors"
                    focus_type = "equal_groups"
                elif div_mastery < 75 or norm_diff in ["average", "intermediate"]:
                    subtopic = "Fact families connecting multiplication to division"
                    focus_type = "fact_families"
                else:
                    subtopic = "Division facts with larger divisors"
                    focus_type = "multi_digit"
            else:
                focus_type = "equal_groups" if "equal" in subtopic.lower() or "shar" in subtopic.lower() else (
                    "fact_families" if "fact" in subtopic.lower() or "mult" in subtopic.lower() else "multi_digit"
                )

            items = []
            for i in range(count):
                item_id = f"pers-dd-{stud_id}-{norm_diff}-{i + 1}"
                if focus_type == "equal_groups":
                    b = random.choice([2, 3, 4, 5])
                    quotient = random.randint(2, 6)
                    a = b * quotient
                    answer = quotient
                    prompt = f"{a} ÷ {b}"
                    tip = f"Equal sharing: {a} items shared equally into {b} groups gives {answer} in each group."
                    distractors = [max(1, answer - 1), answer + 1, max(1, a - b)]
                elif focus_type == "fact_families":
                    b = random.choice([3, 4, 5, 6, 8])
                    quotient = random.randint(3, 9)
                    a = b * quotient
                    answer = quotient
                    prompt = f"{a} ÷ {b}"
                    tip = f"Think multiplication: {b} × ? = {a}. Since {b} × {answer} = {a}, {a} ÷ {b} = {answer}!"
                    distractors = [max(1, answer - 1), answer + 1, answer + 2]
                else:
                    b = random.choice([6, 7, 8, 9, 10, 12])
                    quotient = random.randint(4, 12)
                    a = b * quotient
                    answer = quotient
                    prompt = f"{a} ÷ {b}"
                    tip = f"Division is finding how many groups of {b} fit into {a}. Answer: {answer}."
                    distractors = [max(1, answer - 1), answer + 1, answer + 2]

                items.append({
                    "id": item_id,
                    "prompt": prompt,
                    "a": a,
                    "b": b,
                    "answer": answer,
                    "choices": self._choices(answer, distractors),
                    "tip": tip,
                    "scaffold": f"{a} shared into {b} groups",
                    "targetSubtopic": subtopic,
                    "isPersonalized": True
                })
            reason = "Personalized items generated to remediate division understanding." if is_struggling else "Adaptive division dash items."

        # ---------------------------------------------------------------------
        # 3. MATH NINJA (ADDITION FACTS)
        # ---------------------------------------------------------------------
        elif activity_id == "math-ninja":
            add_mastery = float(mastery.get("Addition facts", 50))
            is_struggling = struggling or add_mastery < 65 or failed_attempts > 0
            subtopic = subtopic_override or ("Making ten facts" if add_mastery < 55 else ("Doubles facts" if add_mastery < 70 else "Addition with regrouping"))

            items = []
            for i in range(count):
                item_id = f"pers-mn-{stud_id}-{norm_diff}-{i + 1}"
                if "ten" in subtopic.lower():
                    a = random.randint(2, 8)
                    b = 10 - a
                    answer = 10
                    tip = f"Make 10 strategy: {a} + {b} = 10. Find the friendly ten first."
                    distractors = [9, 11, 12]
                elif "double" in subtopic.lower():
                    a = random.randint(2, 9)
                    b = a
                    answer = a + b
                    tip = f"Doubles fact: {a} + {a} = {answer}. Use doubles as an anchor."
                    distractors = [answer - 1, answer + 1, answer + 2]
                else:
                    a = random.randint(12, 38)
                    b = random.randint(11, 29)
                    answer = a + b
                    tip = f"Add ones then tens: {a % 10} + {b % 10} = {(a % 10) + (b % 10)}, then combine with tens to get {answer}."
                    distractors = [answer - 1, answer + 1, answer - 10]
                items.append({
                    "id": item_id,
                    "prompt": f"{a} + {b}",
                    "a": a,
                    "b": b,
                    "answer": answer,
                    "choices": self._choices(answer, distractors),
                    "tip": tip,
                    "targetSubtopic": subtopic,
                    "isPersonalized": True
                })
            reason = "Personalized addition facts generated to bridge mastery gap." if is_struggling else "Adaptive addition items."

        # ---------------------------------------------------------------------
        # 4. MULTIPLICATION MOUNTAIN
        # ---------------------------------------------------------------------
        elif activity_id in ["multiplication-mountain", "multiplication"]:
            mult_mastery = float(mastery.get("Multiplication", 50))
            subtopic = subtopic_override or ("Skip counting and repeated addition" if mult_mastery < 55 or norm_diff == "easy" else ("Fact families and square facts" if mult_mastery < 75 else "Distributive property and mental multiplication"))
            items = []
            for i in range(count):
                item_id = f"pers-mm-{stud_id}-{norm_diff}-{i + 1}"
                if "skip" in subtopic.lower() or "repeated" in subtopic.lower():
                    b = random.choice([2, 5, 10])
                    a = random.randint(2, 9)
                    answer = a * b
                    prompt = f"{a} × {b}"
                    tip = f"Skip counting: count by {b}s {a} times to reach {answer}."
                    distractors = [max(2, answer - b), answer + b, answer + 1]
                elif "square" in subtopic.lower():
                    a = random.randint(3, 9)
                    b = a
                    answer = a * b
                    prompt = f"{a} × {b}"
                    tip = f"Square numbers fact: {a} groups of {a} equals {answer}."
                    distractors = [answer - a, answer + a, a + b]
                else:
                    a = random.choice([6, 7, 8, 9, 11, 12])
                    b = random.randint(3, 9)
                    answer = a * b
                    prompt = f"{a} × {b}"
                    tip = f"Break apart: {a} × {b} = ({a-2} × {b}) + (2 × {b}) = {answer}."
                    distractors = [answer - b, answer + b, answer + 2]
                items.append({
                    "id": item_id,
                    "prompt": prompt,
                    "a": a,
                    "b": b,
                    "answer": answer,
                    "choices": self._choices(answer, distractors),
                    "tip": tip,
                    "targetSubtopic": subtopic,
                    "isPersonalized": True
                })
            reason = "Personalized multiplication facts items."

        # ---------------------------------------------------------------------
        # 5. PLACE VALUE BUILDER
        # ---------------------------------------------------------------------
        elif activity_id == "place-value-builder":
            pv_mastery = float(mastery.get("Place value", 50))
            subtopic = subtopic_override or ("Tens and ones representation" if pv_mastery < 65 or norm_diff == "easy" else "Hundreds, tens, and ones base-10 structure")
            items = []
            for i in range(count):
                item_id = f"pers-pv-{stud_id}-{norm_diff}-{i + 1}"
                hundreds = random.randint(1, 4) if (norm_diff in ["intermediate", "advanced"] and pv_mastery >= 50) else 0
                tens = random.randint(1, 9)
                ones = random.randint(0, 9)
                answer = hundreds * 100 + tens * 10 + ones
                desc = f"{hundreds} hundred{'s' if hundreds > 1 else ''}, {tens} ten{'s' if tens > 1 else ''}, and {ones} one{'s' if ones != 1 else ''}" if hundreds else f"{tens} ten{'s' if tens > 1 else ''} and {ones} one{'s' if ones != 1 else ''}"
                items.append({
                    "id": item_id,
                    "prompt": f"Build the number with {desc}.",
                    "answer": answer,
                    "hundreds": hundreds,
                    "tens": tens,
                    "ones": ones,
                    "choices": self._choices(answer, [answer + 10, max(1, answer - 10), answer + 1, int(f'{ones}{tens}')]),
                    "tip": f"Remember: {tens} tens equals {tens * 10}. Combine tens and ones to find the number.",
                    "targetSubtopic": subtopic,
                    "isPersonalized": True
                })
            reason = "Personalized place value builder items."

        # ---------------------------------------------------------------------
        # 6. FRACTION PIZZA
        # ---------------------------------------------------------------------
        elif activity_id == "fraction-pizza":
            frac_mastery = float(mastery.get("Fractions", 50))
            subtopic = subtopic_override or ("Equal slices of a whole" if frac_mastery < 60 else "Numerator and denominator identification")
            items = []
            for i in range(count):
                item_id = f"pers-fp-{stud_id}-{norm_diff}-{i + 1}"
                den = random.randint(2, 6 if norm_diff == "easy" else 10)
                num = random.randint(1, den - 1)
                answer = f"{num}/{den}"
                items.append({
                    "id": item_id,
                    "type": "visual",
                    "num": num,
                    "den": den,
                    "prompt": f"Which fraction shows {num} out of {den} equal slices?",
                    "subPrompt": f"The numerator is {num} and the denominator is {den}.",
                    "answer": answer,
                    "choices": self._choices(answer, [f"{max(1, num - 1)}/{den}", f"{min(den, num + 1)}/{den}", f"{den}/{num}"]),
                    "tip": f"Count {num} shaded slices out of {den} total equal slices. Top number = parts, bottom = whole.",
                    "targetSubtopic": subtopic,
                    "isPersonalized": True
                })
            reason = "Personalized fraction pizza items."

        # ---------------------------------------------------------------------
        # 7. WORD PROBLEM BAKERY
        # ---------------------------------------------------------------------
        elif activity_id == "word-bakery":
            wp_mastery = float(mastery.get("Word problems", 50))
            subtopic = subtopic_override or "Identifying addition vs subtraction operations"
            items = []
            pastries = ["cookies", "cupcakes", "muffins", "rolls", "croissants"]
            for i in range(count):
                item_id = f"pers-wb-{stud_id}-{norm_diff}-{i + 1}"
                pastry = pastries[i % len(pastries)]
                num1 = random.randint(8, 25)
                num2 = random.randint(2, max(3, num1 // 2))
                is_sub = i % 2 == 1
                answer = num1 - num2 if is_sub else num1 + num2
                story = (f"The bakery had {num1} {pastry}. A customer bought {num2} of them. How many {pastry} are left?"
                         if is_sub else
                         f"The baker baked {num1} {pastry} in the morning and {num2} more in the afternoon. How many are there in all?")
                items.append({
                    "id": item_id,
                    "story": story,
                    "prompt": story,
                    "num1": num1,
                    "num2": num2,
                    "item": pastry,
                    "correctOp": "subtract" if is_sub else "add",
                    "answer": answer,
                    "choices": self._choices(answer, [max(0, answer - 1), answer + 1, answer + 2]),
                    "tip": "Look for clues: 'bought / left' means subtract; 'more / in all' means add.",
                    "targetSubtopic": subtopic,
                    "isPersonalized": True
                })
            reason = "Personalized word problem items."

        # ---------------------------------------------------------------------
        # 8. READING BRIDGE (BLENDS & PHONICS)
        # ---------------------------------------------------------------------
        elif activity_id == "reading-bridge":
            blend_mastery = float(mastery.get("Blends", 50))
            subtopic = subtopic_override or ("Beginning consonant blends" if blend_mastery < 60 or norm_diff == "easy" else "Three-letter and complex blends")
            blend_pools = {
                "beginning": [
                    ("bl", "blue", ["sun", "cat", "dog"]),
                    ("br", "brush", ["fish", "pen", "cup"]),
                    ("cl", "clap", ["hat", "ball", "tree"]),
                    ("cr", "crab", ["star", "milk", "book"]),
                    ("dr", "drum", ["bird", "frog", "ship"]),
                    ("fl", "flag", ["moon", "cake", "ring"]),
                    ("fr", "frog", ["bell", "nest", "rock"]),
                    ("gl", "glad", ["leaf", "wind", "rain"]),
                    ("gr", "green", ["snow", "fire", "gold"]),
                    ("pl", "plane", ["bear", "duck", "kite"])
                ],
                "complex": [
                    ("str", "street", ["block", "house", "road"]),
                    ("scr", "screen", ["paper", "glass", "board"]),
                    ("spl", "splash", ["water", "wave", "drop"]),
                    ("spr", "spring", ["summer", "fall", "winter"]),
                    ("thr", "three", ["four", "five", "six"]),
                    ("shr", "shrink", ["grow", "rise", "expand"]),
                    ("squ", "square", ["circle", "triangle", "line"])
                ]
            }
            pool = blend_pools["beginning"] if "beginning" in subtopic.lower() or norm_diff in ["easy", "average"] else blend_pools["complex"]
            items = []
            for i in range(count):
                blend, word, distractors = pool[i % len(pool)]
                items.append({
                    "id": f"pers-rb-{stud_id}-{norm_diff}-{i + 1}",
                    "blend": blend,
                    "prompt": blend,
                    "answer": word,
                    "choices": self._choices(word, distractors),
                    "lesson": f"Slide the blend '{blend}' smoothly: {blend} -> {word}.",
                    "tip": f"Listen to the first two sounds: '{blend}'. Which word begins with {blend}?",
                    "targetSubtopic": subtopic,
                    "isPersonalized": True
                })
            reason = "Personalized phonics and blends items."

        # ---------------------------------------------------------------------
        # 9. SENTENCE BUILDER (READING FLUENCY & GRAMMAR)
        # ---------------------------------------------------------------------
        elif activity_id == "sentence-builder":
            subtopic = subtopic_override or "Subject and action detail identification"
            pairs = [
                ("The cat", "runs fast outside", "The cat"),
                ("The happy girl", "reads a colorful book", "reads a colorful book"),
                ("A curious dog", "barks at the friendly puppy", "A curious dog"),
                ("The young student", "writes a thoughtful note", "writes a thoughtful note"),
                ("Our teacher", "shares an interesting story", "Our teacher"),
                ("The bright sun", "shines warm in the sky", "shines warm in the sky")
            ]
            items = []
            for i in range(count):
                subj, verb, ans = pairs[i % len(pairs)]
                sentence = f"{subj} {verb}."
                items.append({
                    "id": f"pers-sb-{stud_id}-{norm_diff}-{i + 1}",
                    "words": sentence.replace(".", "").split(" "),
                    "sentence": sentence,
                    "prompt": f"Identify the key part in: '{sentence}'",
                    "question": "What is the key detail in this sentence?",
                    "answer": ans,
                    "choices": self._choices(ans, ["A different detail", "Something else", "No one"]),
                    "hint": "Read the complete sentence and look for who or what is performing the action.",
                    "tip": "Good readers pause at the end of each phrase to check meaning.",
                    "targetSubtopic": subtopic,
                    "isPersonalized": True
                })
            reason = "Personalized sentence builder fluency items."

        # ---------------------------------------------------------------------
        # 10. VOCAB QUEST (VOCABULARY & CONTEXT CLUES)
        # ---------------------------------------------------------------------
        elif activity_id == "vocab-quest":
            vocab_mastery = float(mastery.get("Vocabulary", 50))
            subtopic = subtopic_override or ("Using context clues to find word meaning" if vocab_mastery < 65 else "Academic vocabulary in daily context")
            vocab_pool = [
                ("tiny", "Very small", "The puppy was tiny and could easily fit in a basket.", "fit in a basket"),
                ("courageous", "Brave and bold", "Paolo was courageous and spoke up when his friend needed help.", "spoke up to help"),
                ("ancient", "From long ago", "Grandpa showed us an ancient coin kept for hundreds of years.", "kept for hundreds of years"),
                ("generous", "Willing to share", "Lina was generous and shared her markers with the class.", "shared her markers"),
                ("rapid", "Very quick", "The river had a rapid current that moved fast.", "moved fast"),
                ("patient", "Able to wait calmly", "Mark was patient and waited without complaining.", "waited without complaining")
            ]
            items = []
            for i in range(count):
                word, answer, sentence, clue = vocab_pool[i % len(vocab_pool)]
                items.append({
                    "id": f"pers-vq-{stud_id}-{norm_diff}-{i + 1}",
                    "word": word,
                    "phonics": f"[{word}]",
                    "sentence": sentence,
                    "prompt": f"What does '{word}' mean in: '{sentence}'?",
                    "clue": clue,
                    "answer": answer,
                    "choices": self._choices(answer, ["Very noisy", "Something strange", "The opposite idea"]),
                    "tip": f"Context clue alert: Look around the sentence. The clue '{clue}' tells you what '{word}' means.",
                    "targetSubtopic": subtopic,
                    "isPersonalized": True
                })
            reason = "Personalized vocabulary items with explicit context clues."

        # ---------------------------------------------------------------------
        # 11. COMPREHENSION TRAIL (READING COMPREHENSION)
        # ---------------------------------------------------------------------
        elif activity_id == "comprehension-trail":
            comp_mastery = float(mastery.get("Comprehension", 50))
            subtopic = subtopic_override or ("Locating direct story evidence" if comp_mastery < 60 else "Character actions and causes")
            passages = [
                ("Lito found a dry leaf on his desk before class began. He put it gently in his science folder.", "What did Lito do with the leaf?", "put it in his science folder", ["threw it away", "lost it outside", "ignored it"]),
                ("Mia watered the seedling every morning so the flowers would bloom brightly.", "Why did Mia water the seedling?", "so the flowers would bloom", ["because it rained", "to wash the pot", "to make mud"]),
                ("Ana carefully organized her research notes after finding a new library book.", "What did Ana do after finding a new book?", "organized her research notes", ["went home early", "forgot her pencils", "closed the library"]),
                ("Rico shared his umbrella with Noah when the afternoon rain started.", "What shows Rico was kind?", "shared his umbrella", ["walked alone", "stayed indoors", "ran away"])
            ]
            items = []
            for i in range(count):
                passage, question, answer, distractors = passages[i % len(passages)]
                items.append({
                    "id": f"pers-ct-{stud_id}-{norm_diff}-{i + 1}",
                    "passage": passage,
                    "question": question,
                    "prompt": f"{passage}\n\n{question}",
                    "answer": answer,
                    "choices": self._choices(answer, distractors),
                    "evidence": passage,
                    "tip": "Reread the sentences to find exact evidence before choosing your answer.",
                    "targetSubtopic": subtopic,
                    "isPersonalized": True
                })
            reason = "Personalized comprehension items with explicit textual evidence."

        # ---------------------------------------------------------------------
        # 12. SPELLING SPRINT (PHONICS & ORTHOGRAPHY)
        # ---------------------------------------------------------------------
        elif activity_id == "spelling-sprint":
            subtopic = subtopic_override or "Short vowels and phonetically regular words"
            spelling_words = ["star", "frog", "train", "brush", "plant", "smile", "garden", "window", "basket", "rabbit"]
            items = []
            for i in range(count):
                w = spelling_words[i % len(spelling_words)]
                items.append({
                    "id": f"pers-sp-{stud_id}-{norm_diff}-{i + 1}",
                    "word": w,
                    "prompt": f"Spell the word: {w}",
                    "answer": w,
                    "choices": [w],
                    "tip": f"Say the sounds in '{w}' slowly from left to right.",
                    "targetSubtopic": subtopic,
                    "isPersonalized": True
                })
            reason = "Personalized spelling sprint practice."

        # ---------------------------------------------------------------------
        # 13. PRONUNCIATION PRACTICE (READING FLUENCY)
        # ---------------------------------------------------------------------
        elif activity_id == "pronunciation-practice":
            subtopic = subtopic_override or "Clear pronunciation and phoneme accuracy"
            pron_words = ["sun", "frog", "happy", "window", "rabbit", "garden", "together", "adventure", "elephant"]
            items = []
            for i in range(count):
                w = pron_words[i % len(pron_words)]
                items.append({
                    "id": f"pers-pp-{stud_id}-{norm_diff}-{i + 1}",
                    "word": w,
                    "prompt": w,
                    "answer": w,
                    "choices": [w],
                    "tip": f"Listen closely to '{w}', then pronounce every syllable clearly.",
                    "targetSubtopic": subtopic,
                    "isPersonalized": True
                })
            reason = "Personalized pronunciation fluency items."

        # Fallback for any other activity
        else:
            subtopic = subtopic_override or "Adaptive practice"
            items = []
            for i in range(count):
                items.append({
                    "id": f"pers-{activity_id}-{stud_id}-{norm_diff}-{i + 1}",
                    "prompt": f"Practice question {i + 1}",
                    "answer": "Correct",
                    "choices": ["Correct", "Try again", "Other", "Alternative"],
                    "tip": "Take your time and read carefully.",
                    "targetSubtopic": subtopic,
                    "isPersonalized": True
                })
            reason = f"Personalized practice items for {activity_id}."

        # Store in the test bank storage repository
        self.store_game_items(activity_id, norm_diff, items, stud_id)

        return {
            "status": "success",
            "activity_id": activity_id,
            "difficulty": norm_diff,
            "student_id": stud_id,
            "targetedConcept": subtopic,
            "target_subtopic": subtopic,
            "reason": reason,
            "count": len(items),
            "items": items,
            "source": "adaptive_engine"
        }


# =============================================================================
# MODULE-LEVEL EXPORTS & SINGLETON INSTANCE
# =============================================================================

_default_generator = QuizGenerator({})

def store_game_items(activity_id: str, difficulty: str, items: List[Dict[str, Any]], student_id: Optional[str] = None) -> str:
    """Store game items in the default quiz generator test bank storage."""
    return _default_generator.store_game_items(activity_id, difficulty, items, student_id)

def get_stored_game_items(activity_id: str, difficulty: str, student_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve stored game items from the default quiz generator test bank storage."""
    return _default_generator.get_stored_game_items(activity_id, difficulty, student_id)

def generate_personalized_game_items(
    activity_id: str = "",
    difficulty: str = "medium",
    student_profile: Optional[Dict[str, Any]] = None,
    count: int = 10,
    subtopic_override: Optional[str] = None,
    student_id: Optional[str] = None,
    skill_gap: Optional[str] = None,
    mastery_levels: Optional[Dict[str, float]] = None,
    target_count: Optional[int] = None,
    **kwargs
) -> Dict[str, Any]:
    """Module-level generator delegating to default QuizGenerator."""
    return _default_generator.generate_personalized_game_items(
        activity_id=activity_id,
        difficulty=difficulty,
        student_profile=student_profile,
        count=count,
        subtopic_override=subtopic_override,
        student_id=student_id,
        skill_gap=skill_gap,
        mastery_levels=mastery_levels,
        target_count=target_count,
        **kwargs
    )
