def test_create_and_list_forms(client):
    res = client.post("/api/forms", json={"title": "Test Survey", "description": "Description"})
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "Test Survey"
    assert data["status"] == "draft"
    assert "id" in data
    assert "slug" in data

    list_res = client.get("/api/forms")
    assert list_res.status_code == 200
    forms = list_res.json()
    assert len(forms) == 1
    assert forms[0]["title"] == "Test Survey"

def test_duplicate_form(client):
    res = client.post("/api/forms", json={"title": "Original Form"})
    form_id = res.json()["id"]

    dup_res = client.post(f"/api/forms/{form_id}/duplicate")
    assert dup_res.status_code == 201
    dup_data = dup_res.json()
    assert dup_data["title"] == "Original Form (Copy)"
    assert dup_data["id"] != form_id

def test_publish_and_unpublish_form(client):
    res = client.post("/api/forms", json={"title": "Publish Test"})
    form_id = res.json()["id"]

    # Try publish without questions -> 400
    pub_res = client.post(f"/api/forms/{form_id}/publish")
    assert pub_res.status_code == 400

    # Add question
    client.post(f"/api/forms/{form_id}/questions", json={"type": "short_text", "title": "Name?"})

    # Publish -> 200
    pub_res2 = client.post(f"/api/forms/{form_id}/publish")
    assert pub_res2.status_code == 200
    assert pub_res2.json()["status"] == "published"

    # Unpublish -> 200
    unpub_res = client.post(f"/api/forms/{form_id}/unpublish")
    assert unpub_res.status_code == 200
    assert unpub_res.json()["status"] == "draft"
