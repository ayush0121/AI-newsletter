import sys
import os
import logging
import asyncio

# Python 3.13 Compatibility Shim for feedparser (requires cgi)
if sys.version_info >= (3, 13):
    import types
    import email.message

    def parse_header(line):
        if not line:
            return ("", {})
        m = email.message.Message()
        m['content-type'] = line
        return m.get_content_type(), m.get_params({}, failobj={}) or {}

    cgi_dummy = types.ModuleType("cgi")
    cgi_dummy.parse_header = parse_header
    sys.modules.setdefault("cgi", cgi_dummy)

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.ingestion import run_ingestion_job

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    
    logger.info("--- Starting Daily Ingestion Job ---")
    try:
        asyncio.run(run_ingestion_job())
        logger.info("--- Job Finished Successfully ---")
    except Exception as e:
        logger.error(f"--- Job Failed: {e} ---")
        sys.exit(1)
