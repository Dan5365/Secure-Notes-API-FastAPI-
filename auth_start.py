import sys
from pathlib import Path

root_dir = Path(__file__).parent
sys.path.insert(0, str(root_dir))

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "auth_service.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )