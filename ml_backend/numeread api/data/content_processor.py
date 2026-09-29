import json
import pandas as pd
from typing import Dict, List, Any
import numpy as np

class ContentProcessor:
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.content_db = {}
        
    def load_educational_content(self, content_file: str):
        with open(content_file, 'r') as f:
            content_data = json.load(f)
        
        for content in content_data:
            content_id = content['id']
            self.content_db[content_id] = {
                'title': content['title'],
                'description': content.get('description', ''),
                'concepts': content['concepts'],
                'difficulty': content.get('difficulty', 0.5),
                'type': content.get('type', 'text'),
                'duration': content.get('duration', 300),
                'prerequisites': content.get('prerequisites', [])
            }
    
    def generate_sample_content(self):
        sample_content = [
            {
                'id': 'reading_blends_bridge',
                'title': 'Reading Bridge: Blends and Phonics',
                'description': 'Grade 2 practice identifying beginning blends and decoding words.',
                'concepts': ['Blends', 'Reading fluency'],
                'difficulty': 0.25,
                'type': 'game',
                'duration': 300,
                'prerequisites': []
            },
            {
                'id': 'sentence_builder',
                'title': 'Sentence Builder',
                'description': 'Build complete Grade 2 sentences and strengthen vocabulary.',
                'concepts': ['Vocabulary', 'Comprehension'],
                'difficulty': 0.5,
                'type': 'interactive',
                'duration': 360,
                'prerequisites': ['reading_blends_bridge']
            },
            {
                'id': 'addition_facts',
                'title': 'Addition Facts Module',
                'description': 'Practice addition facts through short number games.',
                'concepts': ['Addition facts'],
                'difficulty': 0.3,
                'type': 'game',
                'duration': 300,
                'prerequisites': []
            },
            {
                'id': 'place_value_builder',
                'title': 'Place Value Builder',
                'description': 'Use tens and ones to understand place value and subtraction.',
                'concepts': ['Place value', 'Subtraction'],
                'difficulty': 0.55,
                'type': 'game',
                'duration': 360,
                'prerequisites': ['addition_facts']
            },
            {
                'id': 'word_problem_walkthrough',
                'title': 'Word Problem Walkthrough',
                'description': 'Read, represent, and solve Grade 2 word problems.',
                'concepts': ['Word problems', 'Comprehension'],
                'difficulty': 0.65,
                'type': 'interactive',
                'duration': 420,
                'prerequisites': ['addition_facts']
            }
        ]
        
        for content in sample_content:
            self.content_db[content['id']] = content
        
        return sample_content
    
    def get_content_by_concept(self, concept: str) -> List[Dict[str, Any]]:
        matching_content = []
        for content_id, content_data in self.content_db.items():
            if concept in content_data['concepts']:
                matching_content.append(content_data)
        return matching_content
    
    def analyze_content_coverage(self, concepts: List[str]) -> Dict[str, List[str]]:
        coverage = {}
        for concept in concepts:
            coverage[concept] = []
            for content_id, content_data in self.content_db.items():
                if concept in content_data['concepts']:
                    coverage[concept].append(content_id)
        return coverage
