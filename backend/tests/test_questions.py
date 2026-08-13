def test_question_crud_and_reorder(client):
    # Create form
    f_res = client.post("/api/forms", json={"title": "Questions Form"})
    form_id = f_res.json()["id"]

    # Add question 1
    q1_res = client.post(f"/api/forms/{form_id}/questions", json={
        "type": "short_text",
        "title": "First Question",
        "required": True
    })
    assert q1_res.status_code == 201
    q1_id = q1_res.json()["id"]

    # Add question 2 with options
    q2_res = client.post(f"/api/forms/{form_id}/questions", json={
        "type": "multiple_choice",
        "title": "Second Question",
        "options": [{"label": "Opt A", "value": "a"}, {"label": "Opt B", "value": "b"}]
    })
    assert q2_res.status_code == 201
    q2_id = q2_res.json()["id"]
    assert len(q2_res.json()["options"]) == 2

    # Reorder
    reorder_res = client.post(f"/api/forms/{form_id}/questions/reorder", json={
        "questions": [
            {"id": q2_id, "position": 0},
            {"id": q1_id, "position": 1}
        ]
    })
    assert reorder_res.status_code == 200
    reordered = reorder_res.json()
    assert reordered[0]["id"] == q2_id
    assert reordered[1]["id"] == q1_id
