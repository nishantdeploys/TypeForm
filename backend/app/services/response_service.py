import json
import re
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.form import Form
from app.models.question import Question
from app.models.response import Response, ResponseAnswer
from app.schemas.response import ResponseCreate, ResponseDetailResponse, ResponseAnswerResponse
from app.schemas.stats import FormStatsResponse, QuestionStat, OptionStat
from app.services.form_service import FormService
from fastapi import HTTPException, status

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

class ResponseService:
    @staticmethod
    def submit_public_response(db: Session, slug: str, res_in: ResponseCreate) -> Response:
        form = db.query(Form).filter(Form.slug == slug).first()
        if not form:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found.")
        if form.status != "published":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This form is not currently accepting submissions.")

        questions_by_id = {q.id: q for q in form.questions}
        answers_map = {ans.question_id: ans for ans in res_in.answers}

        # Check required questions
        for q_id, q in questions_by_id.items():
            ans = answers_map.get(q_id)
            if q.required:
                if not ans:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Required question '{q.title}' is missing an answer."
                    )
                # Check for non-empty value
                has_val = False
                if ans.answer_text and ans.answer_text.strip():
                    has_val = True
                elif ans.answer_number is not None:
                    has_val = True
                elif ans.answer_json and ans.answer_json != "[]" and ans.answer_json != "null":
                    has_val = True

                if not has_val:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Required question '{q.title}' cannot be empty."
                    )

        # Validate answer types & formats
        for ans in res_in.answers:
            if ans.question_id not in questions_by_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Question {ans.question_id} does not belong to form."
                )
            q = questions_by_id[ans.question_id]
            if q.type == "email" and ans.answer_text:
                if not EMAIL_REGEX.match(ans.answer_text.strip()):
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Invalid email address provided for '{q.title}'."
                    )
            elif q.type in ["number", "rating"] and ans.answer_number is None and ans.answer_text:
                try:
                    ans.answer_number = float(ans.answer_text)
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Value for '{q.title}' must be a number."
                    )

        response = Response(
            form_id=form.id,
            submitted_at=datetime.utcnow(),
            completion_time=res_in.completion_time,
            metadata_json=res_in.metadata_json or "{}",
        )
        db.add(response)
        db.flush()

        for ans in res_in.answers:
            r_ans = ResponseAnswer(
                response_id=response.id,
                question_id=ans.question_id,
                answer_text=ans.answer_text,
                answer_number=ans.answer_number,
                answer_json=ans.answer_json,
            )
            db.add(r_ans)

        db.commit()
        db.refresh(response)
        return response

    @staticmethod
    def get_form_responses(db: Session, form_id: str) -> list[dict]:
        FormService.get_form_by_id(db, form_id)
        responses = db.query(Response).filter(Response.form_id == form_id).order_by(Response.submitted_at.desc()).all()
        result = []
        for r in responses:
            preview = {}
            for ans in r.answers:
                if ans.question:
                    val = ans.answer_text or ans.answer_number or ans.answer_json or ""
                    preview[ans.question.title] = val
            result.append({
                "id": r.id,
                "form_id": r.form_id,
                "submitted_at": r.submitted_at,
                "completion_time": r.completion_time,
                "answers_count": len(r.answers),
                "preview_answers": preview
            })
        return result

    @staticmethod
    def get_response_detail(db: Session, form_id: str, response_id: str) -> ResponseDetailResponse:
        FormService.get_form_by_id(db, form_id)
        res = db.query(Response).filter(Response.id == response_id, Response.form_id == form_id).first()
        if not res:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Response not found")

        answers_resp = []
        for ans in res.answers:
            q = ans.question
            answers_resp.append(ResponseAnswerResponse(
                id=ans.id,
                question_id=ans.question_id,
                question_title=q.title if q else "Deleted Question",
                question_type=q.type if q else "unknown",
                answer_text=ans.answer_text,
                answer_number=ans.answer_number,
                answer_json=ans.answer_json
            ))

        return ResponseDetailResponse(
            id=res.id,
            form_id=res.form_id,
            submitted_at=res.submitted_at,
            completion_time=res.completion_time,
            metadata_json=res.metadata_json,
            answers=answers_resp
        )

    @staticmethod
    def get_form_statistics(db: Session, form_id: str) -> FormStatsResponse:
        form = FormService.get_form_by_id(db, form_id)
        total_resp = db.query(func.count(Response.id)).filter(Response.form_id == form_id).scalar() or 0
        
        avg_time = db.query(func.avg(Response.completion_time)).filter(
            Response.form_id == form_id, Response.completion_time.isnot(None)
        ).scalar()

        q_stats = []
        for q in form.questions:
            answers = db.query(ResponseAnswer).filter(ResponseAnswer.question_id == q.id).all()
            total_answers = len(answers)
            
            avg_num = None
            opt_stats = []
            text_samples = []

            if q.type in ["number", "rating"]:
                nums = [ans.answer_number for ans in answers if ans.answer_number is not None]
                if nums:
                    avg_num = round(sum(nums) / len(nums), 2)
            
            if q.type in ["multiple_choice", "dropdown"]:
                counts = {}
                for opt in q.options:
                    counts[opt.label] = 0
                
                for ans in answers:
                    val = ans.answer_text
                    if val and val in counts:
                        counts[val] += 1
                    elif val:
                        counts[val] = counts.get(val, 0) + 1

                for opt in q.options:
                    c = counts.get(opt.label, 0)
                    pct = round((c / total_answers * 100), 1) if total_answers > 0 else 0.0
                    opt_stats.append(OptionStat(label=opt.label, value=opt.value, count=c, percentage=pct))

            elif q.type == "yes_no":
                c_yes = sum(1 for ans in answers if ans.answer_text and ans.answer_text.lower() == "yes")
                c_no = sum(1 for ans in answers if ans.answer_text and ans.answer_text.lower() == "no")
                pct_yes = round((c_yes / total_answers * 100), 1) if total_answers > 0 else 0.0
                pct_no = round((c_no / total_answers * 100), 1) if total_answers > 0 else 0.0
                opt_stats = [
                    OptionStat(label="Yes", value="yes", count=c_yes, percentage=pct_yes),
                    OptionStat(label="No", value="no", count=c_no, percentage=pct_no)
                ]

            elif q.type in ["short_text", "long_text", "email"]:
                text_samples = [ans.answer_text for ans in answers if ans.answer_text][:10]

            q_stats.append(QuestionStat(
                question_id=q.id,
                title=q.title,
                type=q.type,
                total_answers=total_answers,
                average_number=avg_num,
                options=opt_stats,
                text_samples=text_samples
            ))

        return FormStatsResponse(
            form_id=form.id,
            total_responses=total_resp,
            avg_completion_time=round(avg_time, 1) if avg_time else None,
            questions_stats=q_stats
        )
