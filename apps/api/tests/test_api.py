import unittest
import json
from fastapi.testclient import TestClient

from main import app
from database import Base, engine

class ScriptCraftApiTestSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create fresh tables for test suite
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "ScriptCraft API")

    def test_02_auth_register_and_login(self):
        # Register
        user_payload = {
            "email": "director@peka-medalu.com",
            "name": "Prasanth Director",
            "password": "SecurePassword123!",
        }
        res_reg = self.client.post("/api/auth/register", json=user_payload)
        self.assertIn(res_reg.status_code, [201, 400])

        # Login
        res_login = self.client.post("/api/auth/login", json={
            "email": "director@peka-medalu.com",
            "password": "SecurePassword123!",
        })
        self.assertEqual(res_login.status_code, 200)
        token_data = res_login.json()
        self.assertIn("access_token", token_data)
        token = token_data["access_token"]

        # Save token for next tests
        self.__class__.auth_headers = {"Authorization": f"Bearer {token}"}

    def test_03_project_and_document_lifecycle(self):
        # Create Project
        proj_payload = {
            "title": "Peka Medalu Feature",
            "logline": "A fragile family drama set in Hyderabad.",
            "format_profile": "feature",
        }
        res_proj = self.client.post("/api/projects", json=proj_payload, headers=self.auth_headers)
        self.assertEqual(res_proj.status_code, 201)
        project = res_proj.json()
        project_id = project["id"]
        self.assertEqual(project["title"], "Peka Medalu Feature")

        # Create Document
        doc_payload = {
            "project_id": project_id,
            "title": "Peka Medalu Script Draft 1",
            "format": "feature",
            "language": "te-IN",
        }
        res_doc = self.client.post("/api/documents", json=doc_payload, headers=self.auth_headers)
        self.assertEqual(res_doc.status_code, 201)
        doc = res_doc.json()
        doc_id = doc["id"]
        self.assertEqual(doc["current_version"], 1)

        # Get initial snapshot
        res_snap = self.client.get(f"/api/documents/{doc_id}/snapshot/latest", headers=self.auth_headers)
        self.assertEqual(res_snap.status_code, 200)
        snap = res_snap.json()
        self.assertEqual(snap["version"], 1)

        # Save updated snapshot version 2
        updated_content = {
            "id": doc_id,
            "title": "Peka Medalu Script Draft 1",
            "nodes": [
                {"id": "node-1", "type": "scene_heading", "text": "INT. LIVING ROOM - NIGHT"},
                {"id": "node-2", "type": "action", "text": "The cards flutter."},
            ],
        }
        res_save = self.client.post(
            f"/api/documents/{doc_id}/snapshots",
            json={"content_json": json.dumps(updated_content)},
            headers=self.auth_headers,
        )
        self.assertEqual(res_save.status_code, 201)
        snap_v2 = res_save.json()
        self.assertEqual(snap_v2["version"], 2)

        # Verify latest snapshot is now version 2
        res_latest = self.client.get(f"/api/documents/{doc_id}/snapshot/latest", headers=self.auth_headers)
        self.assertEqual(res_latest.status_code, 200)
        self.assertEqual(res_latest.json()["version"], 2)

if __name__ == "__main__":
    unittest.main()
