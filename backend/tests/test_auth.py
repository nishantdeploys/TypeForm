def test_user_registration_and_login(client):
    # Register new user
    reg_res = client.post("/api/auth/register", json={
        "email": "admin@example.com",
        "password": "secretpassword123",
        "full_name": "Admin User"
    })
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "admin@example.com"
    assert reg_data["user"]["full_name"] == "Admin User"

    # Register duplicate email -> 400
    dup_res = client.post("/api/auth/register", json={
        "email": "admin@example.com",
        "password": "anotherpassword"
    })
    assert dup_res.status_code == 400

    # Login correct password -> 200
    login_res = client.post("/api/auth/login", json={
        "email": "admin@example.com",
        "password": "secretpassword123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    # Login wrong password -> 401
    fail_res = client.post("/api/auth/login", json={
        "email": "admin@example.com",
        "password": "wrongpassword"
    })
    assert fail_res.status_code == 401

    # Get profile via /auth/me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "admin@example.com"

def test_google_oauth_auth(client):
    google_res = client.post("/api/auth/google", json={
        "email": "google.user@example.com",
        "full_name": "Google User",
        "avatar_url": "https://lh3.googleusercontent.com/a/default-user"
    })
    assert google_res.status_code == 200
    data = google_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "google.user@example.com"
    assert data["user"]["avatar_url"] == "https://lh3.googleusercontent.com/a/default-user"
