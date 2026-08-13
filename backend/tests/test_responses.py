def test_public_submission_validation_and_stats(client):
    # Form + 2 questions (short_text required, rating optional)
    f_res = client.post("/api/forms", json={"title": "Public Test"})
    form_id = f_res.json()["id"]

    q1_res = client.post(f"/api/forms/{form_id}/questions", json={
        "type": "short_text",
        "title": "Your Name",
        "required": True
    })
    q1_id = q1_res.json()["id"]

    q2_res = client.post(f"/api/forms/{form_id}/questions", json={
        "type": "rating",
        "title": "Rating",
        "required": False
    })
    q2_id = q2_res.json()["id"]

    # Publish
    pub_res = client.post(f"/api/forms/{form_id}/publish")
    slug = pub_res.json()["slug"]

    # Get public form
    get_pub = client.get(f"/api/public/forms/{slug}")
    assert get_pub.status_code == 200

    # Submit invalid missing required -> 422
    sub_fail = client.post(f"/api/public/forms/{slug}/responses", json={
        "answers": []
    })
    assert sub_fail.status_code == 422

    # Submit valid -> 201
    sub_ok = client.post(f"/api/public/forms/{slug}/responses", json={
        "completion_time": 15.5,
        "answers": [
            {"question_id": q1_id, "answer_text": "John Doe"},
            {"question_id": q2_id, "answer_number": 5.0, "answer_text": "5"}
        ]
    })
    assert sub_ok.status_code == 201

    # Verify responses list
    r_list = client.get(f"/api/forms/{form_id}/responses")
    assert r_list.status_code == 200
    assert len(r_list.json()) == 1

    # Verify stats
    stats = client.get(f"/api/forms/{form_id}/statistics")
    assert stats.status_code == 200
    assert stats.json()["total_responses"] == 1
