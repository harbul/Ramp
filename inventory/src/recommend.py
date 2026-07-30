"""
recommend.py

Rule engine encoding Sacramento State's draft modernization rubric
(sacramento-state-tools-guidelines-draft.xlsx).

Output design (v2, after review feedback): the first version returned
templated prose ("reasoning") and attached every eligible platform's full
accessibility-gap paragraph to every form -- which produced near-identical
walls of text on dozens of rows. This version returns STRUCTURED,
form-specific data instead:

  - work_items: the concrete tasks a reviewer would actually do
    (e.g. "Add accessible labels to 35 of 44 fields"), not an abstract verb
  - rationale: ONE short sentence, driven by this form's own numbers
  - platforms + platform_caveats: populated ONLY when migration is actually
    required by a process need. A caveat about Acrobat Sign's signature
    fields is noise on a form that's staying a PDF anyway.
  - eligible_platforms_optional: kept in the data for completeness, but
    it's inventory metadata, not review material -- UIs should not surface
    it by default.

Decision order is unchanged: (1) data-sensitivity hard gate, (2) process
fit, (3) caveats surfaced never suppressed, (4) PDF-first fallback.

Scope note ("what does remediate mean here"): in this project, remediation
means fixing the interactive-field accessibility gap -- missing /TU labels,
field structure -- the one thing DubBot can't detect and CommonLook can't
automate. Broken links, alt text, and heading tags remain DubBot/CommonLook
territory and are deliberately out of scope (see design.md section 5).
"""

from __future__ import annotations

from dataclasses import dataclass, field

PLATFORMS = {
    "OnBase Unity Forms": {
        "level_1_2_data": True, "student_record": True, "employment_record": True,
        "signature": False, "workflow": True, "approval": True,
        "external_users": True,
    },
    "OnBase Web Forms": {
        "level_1_2_data": True, "student_record": True, "employment_record": True,
        "signature": False, "workflow": True, "approval": True,
        "external_users": True,
    },
    "Adobe Acrobat Sign": {
        "level_1_2_data": "may_be", "student_record": True, "employment_record": True,
        "signature": True, "workflow": "simple_only", "approval": "with_constraints",
        "external_users": True,
    },
    "ServiceNow Forms": {
        "level_1_2_data": False, "student_record": False, "employment_record": False,
        "signature": False, "workflow": True, "approval": True,
        "external_users": False,
    },
    "CMS Forms": {
        "level_1_2_data": True, "student_record": True, "employment_record": True,
        "signature": False, "workflow": True, "approval": True,
        "external_users": False,
    },
    "Qualtrics": {
        "level_1_2_data": False, "student_record": False, "employment_record": False,
        "signature": False, "workflow": "simple_only", "approval": False,
        "external_users": True,
    },
    "Microsoft Forms": {
        "level_1_2_data": False, "student_record": False, "employment_record": False,
        "signature": False, "workflow": "simple_only", "approval": "simple_only",
        "external_users": True,
    },
}

# One line per platform. Full detail lives in the rubric spreadsheet and
# design.md -- a review queue needs the headline, not the paragraph.
KNOWN_ACCESSIBILITY_GAPS = {
    "OnBase Unity Forms": "Text resize breaks at 200%; exported PDFs may be inaccessible.",
    "OnBase Web Forms": "Text resize breaks at 200%; exported PDFs may be inaccessible.",
    "Adobe Acrobat Sign": "Signature/date fields are difficult or impossible for screen reader users.",
    "CMS Forms": "Oracle publishes no accessibility docs for PeopleSoft admin functions.",
    "Qualtrics": "Signature, slider, and hot-spot question types are not accessible.",
}


@dataclass
class FormProfile:
    name: str
    touches_level_1_2_data: bool
    becomes_student_or_employment_record: bool
    needs_signature: bool
    needs_workflow: bool
    needs_approval: bool
    needs_external_users: bool
    accessibility_category: str  # SCANNED / FLAT_NO_FIELDS / WELL_LABELED / NEEDS_REMEDIATION
    # Optional label detail from the classifier, used to build concrete work items
    field_count: int = 0
    missing_label_count: int = 0
    auto_fixable_label_count: int = 0  # tier-1 resolvable (from field names), computed by pipeline


@dataclass
class Recommendation:
    form: str
    action: str  # no_action_needed | remediate_in_place | recreate_accessible_pdf | migrate
    work_items: list = field(default_factory=list)   # concrete reviewer tasks, short strings
    rationale: str = ""                               # ONE form-specific sentence
    platforms: list = field(default_factory=list)     # only when migration is required
    platform_caveats: list = field(default_factory=list)  # only for platforms above
    platform_migration_required: bool = False
    eligible_platforms_optional: list = field(default_factory=list)  # inventory metadata, not review material


def _survives_data_gate(attrs: dict, p: FormProfile) -> bool:
    if p.touches_level_1_2_data or p.becomes_student_or_employment_record:
        return attrs["level_1_2_data"] in (True, "may_be") and (
            not p.becomes_student_or_employment_record
            or (attrs["student_record"] and attrs["employment_record"])
        )
    return True


def _fits_process(attrs: dict, p: FormProfile) -> bool:
    if p.needs_signature and not attrs["signature"]:
        return False
    if p.needs_workflow and attrs["workflow"] is False:
        return False
    if p.needs_approval and attrs["approval"] is False:
        return False
    if p.needs_external_users and not attrs["external_users"]:
        return False
    return True


def _process_needs(p: FormProfile) -> list[str]:
    needs = []
    if p.needs_signature:
        needs.append("signature capture")
    if p.needs_approval or p.needs_workflow:
        needs.append("an approval workflow")
    if p.needs_external_users:
        needs.append("external (non-campus) access")
    return needs


def _label_work_items(p: FormProfile) -> list[str]:
    """Concrete remediation tasks from this form's own numbers."""
    items = []
    if p.missing_label_count:
        auto = min(p.auto_fixable_label_count, p.missing_label_count)
        manual = p.missing_label_count - auto
        detail = f"Add accessible labels (/TU) to {p.missing_label_count} of {p.field_count} fields"
        if auto and manual:
            detail += f" ({auto} auto-fixable from field names, {manual} need review)"
        elif auto:
            detail += f" (all {auto} auto-fixable from field names)"
        else:
            detail += " (none auto-fixable; each needs review)"
        items.append(detail)
        items.append("Verify tab order and re-run the accessibility checker after labeling")
    return items


def recommend(p: FormProfile) -> Recommendation:
    surviving = {
        n: a for n, a in PLATFORMS.items()
        if _survives_data_gate(a, p) and _fits_process(a, p)
    }
    needs = _process_needs(p)

    # --- Migration is REQUIRED only when a process need can't live in a static PDF ---
    if needs:
        if not surviving:
            action = ("recreate_accessible_pdf"
                      if p.accessibility_category in ("SCANNED", "FLAT_NO_FIELDS")
                      else "remediate_in_place")
            return Recommendation(
                form=p.name, action=action,
                work_items=(_label_work_items(p) or
                            ["Recreate as a fillable, accessible PDF (no field structure exists)"])
                           + [f"Escalate: form needs {' and '.join(needs)} but no rubric platform satisfies both the data-sensitivity gate and that need"],
                rationale=f"Needs {' and '.join(needs)}, but no approved platform clears the data-sensitivity gate; staying a PDF pending SME decision.",
            )
        caveats = [f"{n}: {KNOWN_ACCESSIBILITY_GAPS[n]}" for n in surviving if n in KNOWN_ACCESSIBILITY_GAPS]
        items = [f"Migrate to {' or '.join(surviving)} (needs {' and '.join(needs)})"]
        if p.missing_label_count:
            items.append(f"Interim: {p.missing_label_count} fields lack labels; label them if the PDF stays live during migration")
        return Recommendation(
            form=p.name, action="migrate",
            work_items=items,
            rationale=f"A static PDF can't provide {' and '.join(needs)}; {len(surviving)} platform(s) clear the data-sensitivity gate.",
            platforms=list(surviving),
            platform_caveats=caveats,
            platform_migration_required=True,
        )

    # --- No process driver: PDF-first. Platforms are inventory metadata only. ---
    optional = list(surviving)
    if p.accessibility_category == "WELL_LABELED":
        return Recommendation(
            form=p.name, action="no_action_needed",
            work_items=["Periodic spot-check only"],
            rationale=f"All {p.field_count} fields carry accessible labels; nothing forces a platform.",
            eligible_platforms_optional=optional,
        )
    if p.accessibility_category == "NEEDS_REMEDIATION":
        return Recommendation(
            form=p.name, action="remediate_in_place",
            work_items=_label_work_items(p),
            rationale=f"{p.missing_label_count} of {p.field_count} fields lack accessible labels; no process need forces a platform.",
            eligible_platforms_optional=optional,
        )
    # SCANNED / FLAT_NO_FIELDS
    return Recommendation(
        form=p.name, action="recreate_accessible_pdf",
        work_items=["Recreate as a fillable, accessible PDF (or move to a web form)",
                    "No interactive field structure exists to remediate"],
        rationale="Document has no fillable fields; nothing for keyboard or screen-reader users to complete.",
        eligible_platforms_optional=optional,
    )


if __name__ == "__main__":
    example = FormProfile(
        name="voyager-card-update-request.pdf",
        touches_level_1_2_data=True, becomes_student_or_employment_record=False,
        needs_signature=True, needs_workflow=False, needs_approval=True,
        needs_external_users=False, accessibility_category="NEEDS_REMEDIATION",
        field_count=26, missing_label_count=21, auto_fixable_label_count=5,
    )
    r = recommend(example)
    print(r)
