from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import uvicorn
import logging
from typing import Dict, Any
import json
import os

# Import the analysis router

# Setup logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("imptology")

# Create FastAPI application
app = FastAPI(
    title="IMPtology API",
    description="Backend API for IMPtology data analysis service",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analysis_router)


# Root endpoint
@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <html>
        <head>
            <title>IMPtology API</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                h1 {
                    color: #333;
                }
                code {
                    background-color: #f4f4f4;
                    padding: 2px 5px;
                    border-radius: 3px;
                }
            </style>
        </head>
        <body>
            <h1>IMPtology API</h1>
            <p>Welcome to the IMPtology API. This is the backend service for the IMPtology data analysis application.</p>
            <p>API documentation is available at <a href="/docs">/docs</a></p>
        </body>
    </html>
    """


# Health check endpoint
@app.get("/health")
async def health_check() -> Dict[str, Any]:
    return {"status": "ok", "version": "1.0.0"}


# Error handling for the entire application
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.exception(f"Unhandled exception: {str(exc)}")
    return HTTPException(
        status_code=500,
        detail="An internal server error occurred. Please try again later.",
    )


# For local development
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
