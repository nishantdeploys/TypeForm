import sys
import os
from datetime import datetime, timedelta
import random

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.form import Form
from app.models.question import Question, QuestionOption
from app.models.response import Response, ResponseAnswer
from app.core.security import hash_password

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Create or get Seed Demo Users: Nishant & Ayush
        nishant = db.query(User).filter(User.email == "nishant@example.com").first()
        if not nishant:
            nishant = User(
                email="nishant@example.com",
                hashed_password=hash_password("password123"),
                full_name="Nishant",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            )
            db.add(nishant)
            db.flush()

        ayush = db.query(User).filter(User.email == "ayush@example.com").first()
        if not ayush:
            ayush = User(
                email="ayush@example.com",
                hashed_password=hash_password("password123"),
                full_name="Ayush",
                avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
            )
            db.add(ayush)
            db.flush()

        db.commit()

        # Check if forms already exist
        existing_count = db.query(Form).count()
        if existing_count > 0:
            # Backfill any ownerless forms to Nishant
            db.query(Form).filter(Form.owner_id.is_(None)).update({"owner_id": nishant.id})
            db.commit()
            print("Database already contains forms. Backfilled ownerless forms to Nishant.")
            return

        print("Seeding database with Nishant and Ayush demo forms and responses...")

        # ----------------------------------------------------
        # FORM 1 (NISHANT): Customer Feedback Form
        # ----------------------------------------------------
        form1 = Form(
            title="Customer Feedback Form",
            description="We'd love to hear your thoughts on your experience with our product!",
            slug="customer-feedback-survey",
            status="published",
            owner_id=nishant.id,
            created_at=datetime.utcnow() - timedelta(days=7),
            updated_at=datetime.utcnow() - timedelta(days=7),
            published_at=datetime.utcnow() - timedelta(days=7),
        )
        db.add(form1)

        # ----------------------------------------------------
        # FORM 2 (NISHANT): Employee Experience Survey
        # ----------------------------------------------------
        form2 = Form(
            title="Employee Experience Survey",
            description="Internal feedback survey for company culture and onboarding.",
            slug="employee-experience-survey",
            status="draft",
            owner_id=nishant.id,
            created_at=datetime.utcnow() - timedelta(days=5),
            updated_at=datetime.utcnow() - timedelta(days=5),
        )
        db.add(form2)

        # ----------------------------------------------------
        # FORM 3 (AYUSH): Product Survey
        # ----------------------------------------------------
        form3 = Form(
            title="Product Survey",
            description="Ayush's product feature feedback and usability survey.",
            slug="product-survey",
            status="published",
            owner_id=ayush.id,
            created_at=datetime.utcnow() - timedelta(days=4),
            updated_at=datetime.utcnow() - timedelta(days=4),
            published_at=datetime.utcnow() - timedelta(days=4),
        )
        db.add(form3)

        # ----------------------------------------------------
        # FORM 4 (AYUSH): Event Feedback
        # ----------------------------------------------------
        form4 = Form(
            title="Event Feedback",
            description="Tell us how we can improve our tech meetup events.",
            slug="event-feedback",
            status="published",
            owner_id=ayush.id,
            created_at=datetime.utcnow() - timedelta(days=2),
            updated_at=datetime.utcnow() - timedelta(days=2),
            published_at=datetime.utcnow() - timedelta(days=2),
        )
        db.add(form4)
        db.flush()

        # Questions for Nishant's Customer Feedback Form
        questions_f1 = [
            {
                "type": "short_text",
                "title": "What is your full name?",
                "description": "Please enter your first and last name.",
                "required": True,
                "position": 0,
                "options": []
            },
            {
                "type": "email",
                "title": "What is your email address?",
                "description": "We will send your survey confirmation here.",
                "required": True,
                "position": 1,
                "options": []
            },
            {
                "type": "rating",
                "title": "How would you rate your overall experience?",
                "description": "1 = Poor, 5 = Excellent",
                "required": True,
                "position": 2,
                "options": []
            },
            {
                "type": "yes_no",
                "title": "Would you recommend our product to others?",
                "description": "Your feedback helps us grow.",
                "required": True,
                "position": 3,
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
                settings_json="{}"
            )
            db.add(q)
            db.flush()
            q_objs1.append(q)

        # Seed 3 responses for Nishant's Form 1
        sample_responses_f1 = [
            {"name": "Sarah Jenkins", "email": "sarah.jenkins@acme.io", "rating": 5.0, "rec": "Yes", "time": 42.5},
            {"name": "Alex Rivera", "email": "arivera@techcorp.com", "rating": 4.0, "rec": "Yes", "time": 38.0},
            {"name": "Michael Chen", "email": "mchen@startup.co", "rating": 5.0, "rec": "Yes", "time": 31.2},
        ]

        for s in sample_responses_f1:
            resp = Response(
                form_id=form1.id,
                submitted_at=datetime.utcnow() - timedelta(hours=random.randint(2, 72)),
                completion_time=s["time"],
                metadata_json='{"user_agent": "Mozilla/5.0"}'
            )
            db.add(resp)
            db.flush()

            answers_data = [
                (q_objs1[0].id, s["name"], None, None),
                (q_objs1[1].id, s["email"], None, None),
                (q_objs1[2].id, str(int(s["rating"])), s["rating"], None),
                (q_objs1[3].id, s["rec"], None, None),
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

        # Questions for Ayush's Product Survey
        questions_f3 = [
            {
                "type": "short_text",
                "title": "What is your primary goal?",
                "description": "Tell us what feature you are building.",
                "required": True,
                "position": 0,
                "options": []
            },
            {
                "type": "rating",
                "title": "How would you rate our UI responsiveness?",
                "description": "1 = Slow, 5 = Fast",
                "required": True,
                "position": 1,
                "options": []
            }
        ]

        q_objs3 = []
        for q_data in questions_f3:
            q = Question(
                form_id=form3.id,
                type=q_data["type"],
                title=q_data["title"],
                description=q_data["description"],
                required=q_data["required"],
                position=q_data["position"],
                settings_json="{}"
            )
            db.add(q)
            db.flush()
            q_objs3.append(q)

        # Seed 2 responses for Ayush's Form 3
        sample_responses_f3 = [
            {"goal": "Build customer pulse survey", "rating": 5.0, "time": 25.0},
            {"goal": "Create event registration workflow", "rating": 4.0, "time": 30.0},
        ]
        for s in sample_responses_f3:
            resp = Response(
                form_id=form3.id,
                submitted_at=datetime.utcnow() - timedelta(hours=random.randint(1, 24)),
                completion_time=s["time"],
                metadata_json='{"user_agent": "Mozilla/5.0"}'
            )
            db.add(resp)
            db.flush()

            answers_data = [
                (q_objs3[0].id, s["goal"], None, None),
                (q_objs3[1].id, str(int(s["rating"])), s["rating"], None),
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
        print("Database successfully seeded with Nishant and Ayush user data!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
