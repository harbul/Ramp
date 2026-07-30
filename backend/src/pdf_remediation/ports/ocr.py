"""OCR provider contract. This interface is independent of any specific OCR service
and can be replaced without changing reconstruction orchestration.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Protocol

from ..models import OcrJob, OcrResult
from ..errors import OcrProviderError, OcrJobNotFound, OcrJobNotComplete


class OcrProvider(Protocol):
    """Contract for OCR services. Implementations must be resumable and provide
    meaningful progress updates.
    """

    @abstractmethod
    async def start_ocr_job(
        self, 
        pdf_data: bytes, 
        job_id: str
    ) -> OcrJob:
        """Start OCR processing for a PDF document.
        
        Args:
            pdf_data: Raw PDF bytes to process
            job_id: Application job identifier for tracking
            
        Returns:
            OcrJob with provider job ID and initial status
            
        Raises:
            OcrProviderError: If job cannot be started
        """
        ...

    @abstractmethod  
    async def get_job_status(self, provider_job_id: str) -> OcrJob:
        """Get current status of an OCR job.
        
        Args:
            provider_job_id: Provider's job identifier
            
        Returns:
            Updated OcrJob with current status and progress
            
        Raises:
            OcrProviderError: If job status cannot be retrieved
        """
        ...

    @abstractmethod
    async def get_ocr_result(self, provider_job_id: str) -> OcrResult:
        """Get completed OCR results.
        
        Args:
            provider_job_id: Provider's job identifier
            
        Returns:
            Normalized OCR result with text, layout, and metadata
            
        Raises:
            OcrProviderError: If results cannot be retrieved or job not complete
        """
        ...

    @abstractmethod
    async def cancel_job(self, provider_job_id: str) -> bool:
        """Cancel a running OCR job if possible.
        
        Args:
            provider_job_id: Provider's job identifier
            
        Returns:
            True if cancellation was successful, False if not possible
        """
        ...