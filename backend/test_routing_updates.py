#!/usr/bin/env python3.14
"""Test routing functionality in API endpoints."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_route_filtering():
    """Test the route filtering functionality in job stores."""
    # Import the filter function to test it directly
    from pdf_remediation.adapters.job_store_json import filter_documents
    from pdf_remediation.models import Document, DocumentRoute, TagStatus, utc_now
    
    # Create test documents with different routes
    docs = [
        Document(
            doc_id="1",
            filename="alt-text.pdf", 
            department="Test",
            tag_status=TagStatus.TAGGED,
            figures_missing_alt=2,
            size_bytes=1000,
            updated_at=utc_now(),
            route=DocumentRoute.ALT_TEXT_REMEDIATION,
            unsupported_reason=None,
            is_scan_dominant=False,
        ),
        Document(
            doc_id="2",
            filename="ocr-scan.pdf",
            department="Test", 
            tag_status=TagStatus.UNTAGGED,
            figures_missing_alt=0,
            size_bytes=2000,
            updated_at=utc_now(),
            route=DocumentRoute.OCR_RECONSTRUCTION,
            unsupported_reason=None,
            is_scan_dominant=True,
        ),
        Document(
            doc_id="3",
            filename="unsupported.pdf",
            department="Test",
            tag_status=TagStatus.UNTAGGED,
            figures_missing_alt=0,
            size_bytes=50000000,  # Too large
            updated_at=utc_now(),
            route=DocumentRoute.UNSUPPORTED,
            unsupported_reason=None,
            is_scan_dominant=False,
        ),
    ]
    
    # Test filtering by route
    alt_docs = filter_documents(docs, route=DocumentRoute.ALT_TEXT_REMEDIATION)
    assert len(alt_docs) == 1
    assert alt_docs[0].filename == "alt-text.pdf"
    print("✓ ALT_TEXT_REMEDIATION filter works")
    
    ocr_docs = filter_documents(docs, route=DocumentRoute.OCR_RECONSTRUCTION) 
    assert len(ocr_docs) == 1
    assert ocr_docs[0].filename == "ocr-scan.pdf"
    print("✓ OCR_RECONSTRUCTION filter works")
    
    unsupported_docs = filter_documents(docs, route=DocumentRoute.UNSUPPORTED)
    assert len(unsupported_docs) == 1
    assert unsupported_docs[0].filename == "unsupported.pdf" 
    print("✓ UNSUPPORTED filter works")
    
    # Test no filter returns all
    all_docs = filter_documents(docs, route=None)
    assert len(all_docs) == 3
    print("✓ No route filter returns all documents")
    
    return True

def test_api_structure():
    """Test API endpoint structure for routing."""
    app_file = os.path.join(os.path.dirname(__file__), 'src', 'pdf_remediation', 'api', 'app.py')
    
    with open(app_file, 'r') as f:
        content = f.read()
    
    # Check for routing-related updates
    checks = [
        'route: str | None = None',  # Parameter in list_documents
        'from ..models import DocumentRoute',  # Import added
        'document_route = DocumentRoute(route)',  # Route parsing
        'def get_routes():',  # New endpoint for route info
        'BAD_ROUTE',  # Error code for bad route
    ]
    
    print("Testing API routing updates:")
    for check in checks:
        if check in content:
            print(f"✓ {check}")
        else:
            print(f"✗ {check} - NOT FOUND")
            return False
    
    return True

def test_job_store_updates():
    """Test job store interface updates."""
    files_to_check = [
        'src/pdf_remediation/ports/job_store.py',
        'src/pdf_remediation/adapters/job_store_json.py', 
        'src/pdf_remediation/adapters/job_store_dynamo.py'
    ]
    
    expected_updates = {
        'src/pdf_remediation/ports/job_store.py': [
            'route: DocumentRoute | None = None',
            'from ..models import Document, DocumentRoute, Job',
        ],
        'src/pdf_remediation/adapters/job_store_json.py': [
            'route: DocumentRoute | None = None', 
            'from ..models import Document, DocumentRoute, Job',
            'if route is not None:',
        ],
        'src/pdf_remediation/adapters/job_store_dynamo.py': [
            'route: DocumentRoute | None = None',
            'from ..models import Document, DocumentRoute, Job',
            '"route": document.route.value',
        ]
    }
    
    print("Testing job store routing updates:")
    for file_path, checks in expected_updates.items():
        full_path = os.path.join(os.path.dirname(__file__), file_path)
        with open(full_path, 'r') as f:
            content = f.read()
        
        print(f"  {file_path}:")
        for check in checks:
            if check in content:
                print(f"    ✓ {check}")
            else:
                print(f"    ✗ {check} - NOT FOUND")
                return False
    
    return True

if __name__ == "__main__":
    print("Testing routing functionality...")
    
    success = True
    success &= test_route_filtering()
    print()
    success &= test_api_structure() 
    print()
    success &= test_job_store_updates()
    
    if success:
        print("\n✓ All routing tests passed!")
        print("Existing API endpoints successfully updated to handle routing information!")
    else:
        print("\n✗ Some tests failed")
        sys.exit(1)