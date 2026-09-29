import sys
import os
import argparse
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import time
import random
from typing import Any, Dict, List
from core.student_model import StudentModel
from core.content_recommender import ContentRecommender
from core.learning_optimizer import LearningOptimizer
from data.content_processor import ContentProcessor
from data.student_analyzer import StudentAnalyzer
from assessment.quiz_generator import QuizGenerator
from assessment.progress_tracker import ProgressTracker
from api.endpoints import EduAdaptAPI
from utils.config import Config

class EduAdaptPlatform:
    def __init__(self, config_path: str = "configs/default.yaml"):
        self.config = Config(config_path)
        
        self.student_model = StudentModel(self.config.get('student_model', {}))
        self.content_recommender = ContentRecommender(self.config.get('content', {}))
        self.learning_optimizer = LearningOptimizer(self.config.get('optimization', {}))
        self.content_processor = ContentProcessor(self.config.get('content', {}))
        self.student_analyzer = StudentAnalyzer(self.config.get('students', {}))
        self.quiz_generator = QuizGenerator(self.config.get('assessment', {}))
        self.progress_tracker = ProgressTracker(self.config.get('progress', {}))
        
        self.initialize_platform()
    
    def initialize_platform(self):
        print("Initializing NumeRead adaptive platform...")
        
        sample_content = self.content_processor.generate_sample_content()
        for content in sample_content:
            self.content_recommender.add_content(content['id'], content)
        
        self.content_recommender.fit_content_vectors()
        
        concepts = set()
        for content in sample_content:
            concepts.update(content['concepts'])
        
        self.student_model.concept_mapping = {concept: idx for idx, concept in enumerate(concepts)}
        self.student_model.initialize_knowledge_tracer(len(concepts))
        
        state_size = len(concepts) + 4
        action_size = len(sample_content)
        self.learning_optimizer.initialize_agent(state_size, action_size)
        
        print(f"Platform initialized with {len(concepts)} concepts and {len(sample_content)} content items")
    
    def get_personalized_recommendations(self, student_id: str, 
                                       target_concepts: List[str],
                                       max_recommendations: int = 5) -> List[Dict[str, Any]]:
        knowledge_gaps = self.student_model.get_student_knowledge_gap(student_id, target_concepts)
        
        if student_id in self.student_model.student_profiles:
            student_profile = self.student_model.student_profiles[student_id]
        else:
            student_profile = {
                'learning_style': 'reading_writing',
                'engagement_level': 0.5,
                'learning_pace': 1.0
            }
        
        recommendations = self.content_recommender.recommend_content(
            student_profile, knowledge_gaps, max_recommendations
        )
        
        return recommendations
    
    def record_learning_session(self, student_id: str, session_data: Dict[str, Any]):
        self.student_model.update_student_profile(student_id, session_data)
        self.progress_tracker.record_learning_session(student_id, session_data)
    
    def get_student_progress(self, student_id: str) -> Dict[str, Any]:
        insights = self.progress_tracker.get_student_insights(student_id)
        
        if student_id in self.student_model.student_profiles:
            student_profile = self.student_model.student_profiles[student_id]
            insights['current_profile'] = student_profile
        
        return insights

    def generate_personalized_game_items(self, activity_id: str, difficulty: str, student_profile: Dict[str, Any], count: int = 10, subtopic: Optional[str] = None) -> Dict[str, Any]:
        return self.quiz_generator.generate_personalized_game_items(
            activity_id=activity_id,
            difficulty=difficulty,
            student_profile=student_profile,
            count=count,
            subtopic_override=subtopic
        )

    def get_test_bank_items(self, activity_id: str, difficulty: str, student_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return self.quiz_generator.get_stored_game_items(activity_id, difficulty, student_id)

    def store_test_bank_items(self, activity_id: str, difficulty: str, items: List[Dict[str, Any]], student_id: Optional[str] = None) -> str:
        return self.quiz_generator.store_game_items(activity_id, difficulty, items, student_id)

def main():
    parser = argparse.ArgumentParser(
        description="Run the NumeRead adaptive API and optional website."
    )
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument(
        "--web-root",
        help="Path to the website's public directory. When supplied, the API serves it too.",
    )
    args = parser.parse_args()
    platform = EduAdaptPlatform()
    
    print("Starting NumeRead Adaptive Learning API...")
    
    api = EduAdaptAPI(platform, web_root=args.web_root)
    
    print("NumeRead API is running!")
    print("API available at http://localhost:8000")
    print("Health check: http://localhost:8000/health")
    
    api.run(host=args.host, port=args.port)

if __name__ == "__main__":
    main()
