from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = (ROOT / "src" / "main.ts").read_text(encoding="utf-8")
GUIDE = (ROOT / "DASHBOARD_GUIDE.md").read_text(encoding="utf-8")


def test_real_queue_has_filterable_evidence_controls():
    for token in ("transformer-filter", "priority-filter", "band-filter", "confidence-filter", "review-queue-body"):
        assert token in SOURCE


def test_real_and_synthetic_paths_are_explicitly_separated():
    assert "REAL UK DGA DATA" in SOURCE
    assert "SYNTHETIC DEMO / SEED 42" in SOURCE
    assert "failure probability" in GUIDE.lower()


def test_dashboard_uses_screening_language_not_fabricated_labels():
    assert "not a failure rate" in SOURCE
    assert "no failure probability is calculated" in SOURCE.lower()
    assert "never fabricate labels" in GUIDE.lower()


def test_phase13_documentation_exists():
    report = ROOT / "artifacts" / "phase13_dashboard" / "PHASE_13_FINAL_DASHBOARD_REPORT.md"
    assert report.exists()
    assert "Phase 12" in report.read_text(encoding="utf-8")
