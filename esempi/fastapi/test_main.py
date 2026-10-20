"""Eseguire: pytest -q (requiere fastapi, httpx, pytest)."""
from fastapi.testclient import TestClient
import main

def test_create_read_update_delete(tmp_path, monkeypatch):
    monkeypatch.setattr(main, 'DB_PATH', tmp_path / 'test.sqlite')
    with TestClient(main.app) as client:
        new = client.post('/tasks', json={'title': 'Studiare SQL'})
        assert new.status_code == 201
        id = new.json()['id']
        assert client.get(f'/tasks/{id}').json()['title'] == 'Studiare SQL'
        assert client.patch(f'/tasks/{id}', json={'done': True}).json()['done'] is True
        assert client.delete(f'/tasks/{id}').status_code == 204
        assert client.get(f'/tasks/{id}').status_code == 404
        assert client.post('/tasks', json={'title': 'x'}).status_code == 422
