import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from utils.audit_logger import trace_id_ctx
import logging
import json
import time

# middlewares/trace_middleware.py
logger = logging.getLogger("api_logger")
class TraceIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Genarate new UUID 
        request_id = str(uuid.uuid4())
        
        # 2. Save to the context of the current request.
        trace_id_ctx.set(request_id)

        start_time = time.time()

        # 3. Continue processing the system logic.
        response = await call_next(request)
        
        # 4. Structured terminal logging (JSON)
        process_time = time.time() - start_time
        log_dict = {
            "trace_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "status_code": response.status_code,
            "process_time_ms": round(process_time * 1000, 2)
        }
        # Print to terminal as JSON
        print(json.dumps(log_dict)) 
        
        response.headers["X-Trace-ID"] = request_id
        return response