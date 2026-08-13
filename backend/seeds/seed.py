import sys
import os
from datetime import datetime, timedelta
import random

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, engine, Base
from app.models.form import Form
from app.models.question import Question, QuestionOption
from app.models.response import Response, ResponseAnswer

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if forms already exist
        existing_count = db.query(Form).count()
        if existing_count > 0:
            print("Database already contains seed data. Skipping seed.")
            return

        print("Seeding database with sample forms and responses...")

        # ----------------------------------------------------
        # FORM 1: Customer Feedback & Product Survey
        # ----------------------------------------------------
        form1 = Form(
            title="Customer Feedback & Product Survey",
            description="We'd love to hear your thoughts on your experience with our product!",
            slug="customer-feedback-survey",
            status="published",
            created_at=datetime.utcnow() - timedelta(days=7),
            updated_at=datetime.utcnow() - timedelta(days=7),
            published_at=datetime.utcnow() - timedelta(days=7),
        )
        db.add(form1)
        db.flush()

        questions_f1 = [
            {
                "type": "short_text",
                "title": "What is your full name?",
                "description": "Please enter your first and last name.",
                "required": True,
                "position": 0,
                "settings": "{}",
                "options": []
            },
            {
                "type": "email",
                "title": "What is your email address?",
                "description": "We will send your survey confirmation here.",
                "required": True,
                "position": 1,
                "settings": "{}",
                "options": []
            },
            {
                "type": "rating",
                "title": "How would you rate your overall experience with our platform?",
                "description": "1 = Poor, 5 = Excellent",
                "required": True,
                "position": 2,
                "settings": '{"max_rating": 5, "min_label": "Poor", "max_label": "Excellent"}',
                "options": []
            },
            {
                "type": "multiple_choice",
                "title": "Which feature do you use most frequently?",
                "description": "Select the primary feature you interact with daily.",
                "required": False,
                "position": 3,
                "settings": "{}",
                "options": ["Form Builder", "Conversational Respondent View", "Analytics & Export", "Integrations"]
            },
            {
                "type": "dropdown",
                "title": "How did you hear about us?",
                "description": "Choose the channel that brought you to our platform.",
                "required": False,
                "position": 4,
                "settings": "{}",
                "options": ["Search Engine", "Social Media", "Friend or Colleague", "Tech Blog / Article", "Other"]
            },
            {
                "type": "yes_no",
                "title": "Would you recommend our product to a friend or colleague?",
                "description": "Your honest feedback helps us improve.",
                "required": True,
                "position": 5,
                "settings": "{}",
                "options": []
            },
            {
                "type": "number",
                "title": "How many team members work in your organization?",
                "description": "Enter an approximate number.",
                "required": False,
                "position": 6,
                "settings": "{}",
                "options": []
            },
            {
                "type": "long_text",
                "title": "What additional features or improvements would you like to see?",
                "description": "Feel free to share any constructive feedback or wishlist items.",
                "required": False,
                "position": 7,
                "settings": "{}",
                "options": []
            }
        ]

        q_objs1 = []
        for q_data in questions_f1:
            q = Question(
                form_id=form1.id,
                type=q_data["type"],
                title=q_data["title"],
                description=q_data["description"],
                required=q_data["required"],
                position=q_data["position"],
                settings_json=q_data["settings"]
            )
            db.add(q)
            db.flush()
            
            for idx, opt_label in enumerate(q_data["options"]):
                opt = QuestionOption(
                    question_id=q.id,
                    label=opt_label,
                    value=opt_label.lower().replace(" ", "_"),
                    position=idx
                )
                db.add(opt)
            q_objs1.append(q)

        # Seed 5 responses for Form 1
        sample_responses_f1 = [
            {
                "name": "Sarah Jenkins",
                "email": "sarah.jenkins@acme.io",
                "rating": 5.0,
                "feature": "Form Builder",
                "source": "Tech Blog / Article",
                "recommend": "Yes",
                "team_size": 24.0,
                "feedback": "The drag-and-drop builder is super smooth! Would love to see webhooks support soon.",
                "time": 42.5
            },
            {
                "name": "Alex Rivera",
                "email": "arivera@techcorp.com",
                "rating": 4.0,
                "feature": "Conversational Respondent View",
                "source": "Friend or Colleague",
                "recommend": "Yes",
                "team_size": 15.0,
                "feedback": "The one-question-at-a-time experience has boosted our response completion rate significantly.",
                "time": 38.0
            },
            {
                "name": "Michael Chen",
                "email": "mchen@startup.co",
                "rating": 5.0,
                "feature": "Form Builder",
                "source": "Search Engine",
                "recommend": "Yes",
                "team_size": 8.0,
                "feedback": "Sleek keyboard navigation! Beautiful design aesthetic.",
                "time": 31.2
            },
            {
                "name": "Emily Watson",
                "email": "emily.watson@designhouse.org",
                "rating": 4.0,
                "feature": "Analytics & Export",
                "source": "Social Media",
                "recommend": "Yes",
                "team_size": 5.0,
                "feedback": "Great analytics charts. Adding custom color themes would be awesome.",
                "time": 54.0
            },
            {
                "name": "David Miller",
                "email": "dmiller@enterprise.net",
                "rating": 3.0,
                "feature": "Integrations",
                "source": "Other",
                "recommend": "No",
                "team_size": 120.0,
                "feedback": "Need Zapier and Slack integration for our team workflow.",
                "time": 62.1
            }
        ]

        for s in sample_responses_f1:
            resp = Response(
                form_id=form1.id,
                submitted_at=datetime.utcnow() - timedelta(hours=random.randint(2, 72)),
                completion_time=s["time"],
                metadata_json='{"user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}'
            )
            db.add(resp)
            db.flush()

            answers_data = [
                (q_objs1[0].id, s["name"], None, None),
                (q_objs1[1].id, s["email"], None, None),
                (q_objs1[2].id, str(int(s["rating"])), s["rating"], None),
                (q_objs1[3].id, s["feature"], None, None),
                (q_objs1[4].id, s["source"], None, None),
                (q_objs1[5].id, s["recommend"], None, None),
                (q_objs1[6].id, str(int(s["team_size"])), s["team_size"], None),
                (q_objs1[7].id, s["feedback"], None, None),
            ]

            for q_id, txt, num, js in answers_data:
                ans = ResponseAnswer(
                    response_id=resp.id,
                    question_id=q_id,
                    answer_text=txt,
                    answer_number=num,
                    answer_json=js
                )
                db.add(ans)

        # ----------------------------------------------------
        # FORM 2: User Onboarding Experience
        # ----------------------------------------------------
        form2 = Form(
            title="User Onboarding Experience",
            description="Tell us about your first impressions signing up for our service.",
            slug="user-onboarding-experience",
            status="published",
            created_at=datetime.utcnow() - timedelta(days=3),
            updated_at=datetime.utcnow() - timedelta(days=3),
            published_at=datetime.utcnow() - timedelta(days=3),
        )
        db.add(form2)
        db.flush()

        questions_f2 = [
            {
                "type": "short_text",
                "title": "What is your primary goal today?",
                "description": "Tell us what you hope to achieve.",
                "required": True,
                "position": 0,
                "options": []
            },
            {
                "type": "email",
                "title": "Work Email",
                "description": "Enter your professional email address.",
                "required": True,
                "position": 1,
                "options": []
            },
            {
                "type": "rating",
                "title": "How smooth was your signup process?",
                "description": "1 = Confusing, 5 = Effortless",
                "required": True,
                "position": 2,
                "options": []
            },
            {
                "type": "yes_no",
                "title": "Did you find all necessary documentation?",
                "description": "Were our guides clear and helpful?",
                "required": False,
                "position": 3,
                "options": []
            },
            {
                "type": "multiple_choice",
                "title": "Which plan fits your team best?",
                "description": "Choose your prospective plan.",
                "required": False,
                "position": 4,
                "options": ["Starter Free", "Pro Creator", "Enterprise"]
            },
            {
                "type": "long_text",
                "title": "Any questions for our onboarding team?",
                "description": "We are here to help you get started quickly.",
                "required": False,
                "position": 5,
                "options": []
            }
        ]

        q_objs2 = []
        for q_data in questions_f2:
            q = Question(
                form_id=form2.id,
                type=q_data["type"],
                title=q_data["title"],
                description=q_data["description"],
                required=q_data["required"],
                position=q_data["position"],
                settings_json="{}"
            )
            db.add(q)
            db.flush()

            for idx, opt_label in enumerate(q_data["options"]):
                opt = QuestionOption(
                    question_id=q.id,
                    label=opt_label,
                    value=opt_label.lower().replace(" ", "_"),
                    position=idx
                )
                db.add(opt)
            q_objs2.append(q)

        # Seed 3 responses for Form 2
        sample_responses_f2 = [
            {
                "goal": "Build customer feedback forms for our app",
                "email": "jordan@product.dev",
                "rating": 5.0,
                "docs": "Yes",
                "plan": "Pro Creator",
                "questions": "Can we embed forms directly in React?",
                "time": 28.4
            },
            {
                "goal": "Collect event registration data",
                "email": "clara@eventplanner.co",
                "rating": 4.0,
                "docs": "Yes",
                "plan": "Starter Free",
                "questions": "None at the moment!",
                "time": 35.0
            },
            {
                "goal": "Conduct internal employee pulse survey",
                "email": "hr@enterprise-inc.com",
                "rating": 5.0,
                "docs": "Yes",
                "plan": "Enterprise",
                "questions": "How to export results to CSV?",
                "time": 22.1
            }
        ]

        for s in sample_responses_f2:
            resp = Response(
                form_id=form2.id,
                submitted_at=datetime.utcnow() - timedelta(hours=random.randint(1, 48)),
                completion_time=s["time"],
                metadata_json='{"user_agent": "Mozilla/5.0"}'
            )
            db.add(resp)
            db.flush()

            answers_data = [
                (q_objs2[0].id, s["goal"], None, None),
                (q_objs2[1].id, s["email"], None, None),
                (q_objs2[2].id, str(int(s["rating"])), s["rating"], None),
                (q_objs2[3].id, s["docs"], None, None),
                (q_objs2[4].id, s["plan"], None, None),
                (q_objs2[5].id, s["questions"], None, None),
            ]

            for q_id, txt, num, js in answers_data:
                ans = ResponseAnswer(
                    response_id=resp.id,
                    question_id=q_id,
                    answer_text=txt,
                    answer_number=num,
                    answer_json=js
                )
                db.add(ans)

        db.commit()
        print("Database successfully seeded!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
