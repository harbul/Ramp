"""Phase-1 proof of concept: drive the whole flow from a local PDF path.

    python -m pdf_remediation.cli scan     sample.pdf
    python -m pdf_remediation.cli analyze  sample.pdf --out work/
    python -m pdf_remediation.cli apply    work/report.json [--approvals a.json]

`analyze` writes a report you can read and edit; `apply` takes an approvals file
so the human-in-the-loop step is real even without a UI.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from dataclasses import asdict
from pathlib import Path

from .adapters.alt_text_stub import StubAltTextProvider
from .adapters.job_store_json import JsonJobStore
from .adapters.storage_local import LocalStorage
from .core.scan import scan_bytes
from .errors import RemediationError
from .models import IssueStatus, TagStatus
from .service import RemediationService

log = logging.getLogger("pdf_remediation")


def _service(work_dir: Path, provider: str) -> RemediationService:
    if provider == "bedrock":
        from .adapters.alt_text_bedrock import BedrockAltTextProvider

        alt_text = BedrockAltTextProvider()
    else:
        alt_text = StubAltTextProvider()

    return RemediationService(
        storage=LocalStorage(work_dir),
        jobs=JsonJobStore(work_dir / "state"),
        alt_text=alt_text,
    )


def cmd_scan(args) -> int:
    data = Path(args.pdf).read_bytes()
    scan = scan_bytes(data)

    print(f"{Path(args.pdf).name}")
    print(f"  tag status          : {scan.tag_status.value}")
    print(f"  pages               : {scan.page_count}")
    print(f"  images              : {scan.image_count}")
    print(f"  figures             : {scan.figure_count}")
    print(f"  figures missing alt : {scan.figures_missing_alt}")
    print(f"  remediable          : {'yes' if scan.is_remediable else 'no'}")

    if scan.tag_status is TagStatus.UNTAGGED:
        print(
            "\n  This PDF has no structure tree. Alt text written into it would be\n"
            "  unreachable by screen readers, so it needs tagging before it can be\n"
            "  remediated here."
        )
    return 0


def cmd_analyze(args) -> int:
    work_dir = Path(args.out)
    service = _service(work_dir, args.provider)

    path = Path(args.pdf)
    data = path.read_bytes()

    document, scan = service.register_document(
        filename=path.name, department=args.department, pdf_bytes=data
    )
    print(f"{path.name}: {scan.tag_status.value}, {scan.figures_missing_alt} figure(s) missing alt")

    job = service.create_job(document.doc_id)   # raises NotTagged on an untagged PDF
    job = service.analyze(job.job_id)

    if job.error_message:
        print(f"\nanalyze failed: {job.error_message}", file=sys.stderr)
        return 1

    report = {
        "job_id": job.job_id,
        "doc_id": job.doc_id,
        "filename": path.name,
        "status": job.status.value,
        "issues": [asdict(i) for i in job.issues],
    }
    report_path = work_dir / "report.json"
    report_path.write_text(json.dumps(report, indent=2, default=str))

    print(f"\n{len(job.issues)} issue(s):")
    for issue in job.issues:
        suggestion = issue.suggested_alt_text or "(no suggestion — needs a human)"
        print(f"  [{issue.issue_id}] page {issue.page_number}: {suggestion}")
    print(f"\nreport -> {report_path}")
    print(
        "\nNext: approve everything with\n"
        f"  python -m pdf_remediation.cli apply {report_path}\n"
        "or write an approvals file mapping issue_id -> alt text and pass --approvals."
    )
    return 0


def cmd_apply(args) -> int:
    report_path = Path(args.report)
    report = json.loads(report_path.read_text())
    work_dir = report_path.parent
    service = _service(work_dir, args.provider)

    approvals: dict[str, str] = {}
    if args.approvals:
        approvals = json.loads(Path(args.approvals).read_text())

    job = service.get_job(report["job_id"])
    for issue in job.issues:
        if issue.issue_id in approvals:
            service.approve(job.job_id, issue.issue_id, approved=True, alt_text=approvals[issue.issue_id])
        elif args.approvals:
            service.approve(job.job_id, issue.issue_id, approved=False)  # not listed = rejected
        elif issue.suggested_alt_text:
            service.approve(job.job_id, issue.issue_id, approved=True)   # accept all

    job = service.apply(job.job_id)
    if job.status.value != "COMPLETE":
        print(f"apply failed: {job.error_message}", file=sys.stderr)
        return 1

    applied = [i for i in job.issues if i.status is IssueStatus.APPLIED]
    print(f"applied {len(applied)} fix(es):")
    for issue in applied:
        print(f"  page {issue.page_number}: {issue.approved_alt_text}")

    url, filename = service.download_url(job.job_id)
    print(f"\nremediated -> {url.removeprefix('file://')}")
    print(f"filename    : {filename}")
    print("verified    : /Alt read back from the output PDF")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="pdf_remediation", description=__doc__)
    parser.add_argument("-v", "--verbose", action="store_true")
    parser.add_argument(
        "--provider",
        default="stub",
        choices=["stub", "bedrock"],
        help="alt-text source (default: stub — no AWS needed)",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_scan = sub.add_parser("scan", help="classify a PDF; no changes, no model calls")
    p_scan.add_argument("pdf")
    p_scan.set_defaults(func=cmd_scan)

    p_analyze = sub.add_parser("analyze", help="find figures missing alt text and suggest")
    p_analyze.add_argument("pdf")
    p_analyze.add_argument("--out", default="work")
    p_analyze.add_argument("--department", default="Unknown")
    p_analyze.set_defaults(func=cmd_analyze)

    p_apply = sub.add_parser("apply", help="write approved alt text into a new PDF")
    p_apply.add_argument("report")
    p_apply.add_argument("--approvals", help="JSON: {issue_id: alt text}. Omit to accept all.")
    p_apply.set_defaults(func=cmd_apply)

    args = parser.parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.WARNING,
        format="%(levelname)s %(name)s: %(message)s",
    )

    try:
        return args.func(args)
    except RemediationError as exc:
        print(f"\n{exc.code}: {exc.message}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
