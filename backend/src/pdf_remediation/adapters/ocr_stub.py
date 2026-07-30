"""Stub OCR provider for development and testing. Provides deterministic results
without network access or cost.
"""

from __future__ import annotations

import asyncio
from typing import Dict

from ..models import (
    OcrJob, 
    OcrJobStatus, 
    OcrResult, 
    OcrPage,
    OcrBlock,
    OcrLine, 
    OcrWord,
    OcrProviderMetadata,
    TextType,
)
from ..errors import OcrProviderError, OcrJobNotFound, OcrJobNotComplete


class StubOcrProvider:
    """Stub implementation that simulates OCR processing with deterministic results."""
    
    def __init__(self):
        self._jobs: Dict[str, OcrJob] = {}
        self._results: Dict[str, OcrResult] = {}
    
    async def start_ocr_job(self, pdf_data: bytes, job_id: str) -> OcrJob:
        """Start a simulated OCR job."""
        provider_job_id = f"stub-{job_id}"
        
        # Estimate pages from PDF size (rough heuristic)
        estimated_pages = max(1, len(pdf_data) // 50000)  # ~50KB per page estimate
        
        job = OcrJob(
            job_id=job_id,
            provider_job_id=provider_job_id,
            status=OcrJobStatus.QUEUED,
            total_pages=estimated_pages,
        )
        
        self._jobs[provider_job_id] = job
        
        # Simulate async processing
        asyncio.create_task(self._simulate_processing(provider_job_id))
        
        return job
    
    async def get_job_status(self, provider_job_id: str) -> OcrJob:
        """Get current job status."""
        if provider_job_id not in self._jobs:
            raise OcrJobNotFound(f"OCR job {provider_job_id} not found")
            
        return self._jobs[provider_job_id]
    
    async def get_ocr_result(self, provider_job_id: str) -> OcrResult:
        """Get OCR results for completed job."""
        if provider_job_id not in self._jobs:
            raise OcrJobNotFound(f"OCR job {provider_job_id} not found")
            
        job = self._jobs[provider_job_id]
        if not job.is_complete:
            raise OcrJobNotComplete(f"OCR job {provider_job_id} is not complete (status: {job.status})")
            
        if provider_job_id not in self._results:
            raise OcrProviderError(f"Results not found for completed job {provider_job_id}")
            
        return self._results[provider_job_id]
    
    async def cancel_job(self, provider_job_id: str) -> bool:
        """Cancel a job if it's still running."""
        if provider_job_id not in self._jobs:
            return False
            
        job = self._jobs[provider_job_id]
        if job.is_terminal:
            return False
            
        job.status = OcrJobStatus.CANCELLED
        return True
    
    async def _simulate_processing(self, provider_job_id: str):
        """Simulate OCR processing with delays and progress updates."""
        try:
            job = self._jobs[provider_job_id]
            
            # Simulate queued -> running transition
            await asyncio.sleep(0.1)
            job.status = OcrJobStatus.RUNNING
            job.progress_percent = 10
            
            # Simulate processing each page
            for page_num in range(1, job.total_pages + 1):
                if job.status == OcrJobStatus.CANCELLED:
                    return
                    
                await asyncio.sleep(0.2)  # Simulate processing time per page
                job.pages_processed = page_num
                job.progress_percent = min(90, int((page_num / job.total_pages) * 80) + 10)
            
            # Generate deterministic stub results
            result = self._generate_stub_result(job.total_pages)
            self._results[provider_job_id] = result
            
            # Mark complete
            job.status = OcrJobStatus.COMPLETE
            job.progress_percent = 100
            
        except Exception as e:
            job.status = OcrJobStatus.FAILED
            job.error_message = str(e)
    
    def _generate_stub_result(self, page_count: int) -> OcrResult:
        """Generate deterministic OCR results for testing.
        
        Includes FIGURE blocks to simulate visual regions (logos, charts, etc.)
        detected within the page scan by the OCR layout engine.
        """
        pages = []
        
        for page_num in range(1, page_count + 1):
            # Create sample text blocks
            title_block = OcrBlock(
                text=f"Document Title - Page {page_num}",
                confidence=0.95,
                bbox=(72, 50, 540, 80),  # Standard US Letter coordinates
                lines=[
                    OcrLine(
                        text=f"Document Title - Page {page_num}",
                        confidence=0.95,
                        bbox=(72, 50, 540, 80),
                        words=[
                            OcrWord("Document", 0.98, (72, 50, 156, 80)),
                            OcrWord("Title", 0.96, (162, 50, 210, 80)),
                            OcrWord("-", 0.99, (216, 50, 228, 80)),
                            OcrWord("Page", 0.97, (234, 50, 276, 80)),
                            OcrWord(str(page_num), 0.99, (282, 50, 306, 80)),
                        ]
                    )
                ],
                block_type="TITLE"
            )
            
            content_block = OcrBlock(
                text="This is sample content extracted from a scanned document. "
                     "The OCR provider has recognized this text with high confidence. "
                     "In a real scenario, this would contain the actual document content.",
                confidence=0.88,
                bbox=(72, 120, 540, 250),
                lines=[
                    OcrLine(
                        text="This is sample content extracted from a scanned document.",
                        confidence=0.89,
                        bbox=(72, 120, 540, 145),
                        words=[
                            OcrWord("This", 0.95, (72, 120, 108, 145)),
                            OcrWord("is", 0.97, (114, 120, 132, 145)),
                            OcrWord("sample", 0.91, (138, 120, 198, 145)),
                        ]
                    ),
                    OcrLine(
                        text="The OCR provider has recognized this text with high confidence.",
                        confidence=0.87,
                        bbox=(72, 155, 540, 180),
                        words=[]  # Abbreviated for stub
                    ),
                    OcrLine(
                        text="In a real scenario, this would contain the actual document content.",
                        confidence=0.88,
                        bbox=(72, 190, 540, 215),
                        words=[]  # Abbreviated for stub
                    )
                ],
                block_type="TEXT"
            )

            # FIGURE block: simulates a visual region (logo, chart, photo)
            # detected within the page scan by the layout engine.
            # The bbox defines the crop region within the page.
            figure_block = OcrBlock(
                text="",  # Figures have no text
                confidence=0.92,
                bbox=(72, 550, 300, 720),  # A region in the lower-left area
                lines=[],
                block_type="FIGURE"
            )
            
            page = OcrPage(
                page_number=page_num,
                width=612,  # US Letter width in points
                height=792,  # US Letter height in points
                blocks=[title_block, content_block, figure_block]
            )
            
            pages.append(page)
        
        return OcrResult(
            pages=pages,
            document_language="en",
            provider_metadata=OcrProviderMetadata(
                provider_name="stub",
                model_version="1.0.0",
                api_version="stub-v1",
                processing_time_seconds=page_count * 0.2,
            )
        )