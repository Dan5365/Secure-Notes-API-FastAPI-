from locust import HttpUser, task, between

class NotesUser(HttpUser):
    host = "http://51.21.108.193:8000"
    wait_time = between(1, 3)
    token = None

    def on_start(self):
        response = self.client.post("/auth/login", data={
            "username": "testuser",
            "password": "test123"
        })
        if response.status_code == 200:
            self.token = response.json()["access_token"]

    @task(3)
    def get_notes(self):
        if self.token:
            self.client.get(
                "http://51.21.108.193:8001/notes/",
                headers={"Authorization": f"Bearer {self.token}"}
            )

    @task(1)
    def health_check(self):
        self.client.get("/")
