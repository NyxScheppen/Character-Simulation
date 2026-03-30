import os
import sys
import time
import atexit
import socket
import threading

import requests
import webview
import uvicorn

from app.main import app

if sys.platform.startswith("linux"):
    os.environ["LIBGL_ALWAYS_SOFTWARE"] = "1"
    os.environ["GSK_RENDERER"] = "cairo"
    os.environ["WEBKIT_DISABLE_COMPOSITING_MODE"] = "1"

HOST = "127.0.0.1"
server_thread = None

def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, 0))
        return s.getsockname()[1]

PORT = find_free_port()
BASE_URL = f"http://{HOST}:{PORT}"
HEALTH_URL = f"{BASE_URL}/health"

def run_fastapi():
    uvicorn.run(app, host=HOST, port=PORT, log_level="info")

def start_fastapi():
    global server_thread
    server_thread = threading.Thread(target=run_fastapi, daemon=True)
    server_thread.start()
    print("Started FastAPI thread")

def wait_for_server(url: str, timeout: int = 30):
    start = time.time()
    while time.time() - start < timeout:
        try:
            r = requests.get(url, timeout=2)
            if r.status_code == 200:
                return True
        except Exception as e:
            print("Health check retry:", repr(e))

        time.sleep(1)
    return False

def cleanup():
    print("Application exiting...")

if __name__ == "__main__":
    atexit.register(cleanup)

    start_fastapi()

    if not wait_for_server(HEALTH_URL, timeout=30):
        raise RuntimeError("FastAPI 启动失败，未能连接到 /health")

    webview.create_window(
        "Story Pet",
        BASE_URL,
        width=1280,
        height=820,
        min_size=(1000, 700),
    )
    webview.start(debug=False)