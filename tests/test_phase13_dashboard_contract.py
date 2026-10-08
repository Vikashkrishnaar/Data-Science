from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = (ROOT / "src" / "main.ts").read_text(encoding="utf-8")
GUIDE = (ROOT / "DASHBOARD_GUIDE.md").read_text(encoding="utf-8")


def test_real_queue_has_filterable_evidence_controls():
    for token in ("filter-priority", "filter-band", "filter-confidence", "filter-search-input", "review-queue"):
        assert token in SOURCE


def test_real_and_synthetic_paths_are_explicitly_separated():
    assert "REAL UK DGA DATA" in SOURCE
    assert "SYNTHETIC DEMONSTRATION — NOT REAL UTILITY PERFORMANCE" in SOURCE
    assert "failure probability" in GUIDE.lower()


def test_dashboard_uses_screening_language_not_fabricated_labels():
    assert "failure probability" in SOURCE.lower()
    assert "failure_24h" in SOURCE
    assert "never fabricate labels" in GUIDE.lower()


def test_phase13_documentation_exists():
    report = ROOT / "artifacts" / "phase13_dashboard" / "PHASE_13_FINAL_DASHBOARD_REPORT.md"
    assert report.exists()
    assert "Phase 12" in report.read_text(encoding="utf-8")
