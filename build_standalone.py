#!/usr/bin/env python3
"""Generate the standalone homepage artifact from the production source files."""

from base64 import b64encode
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "SHOURYA-PORTFOLIO.html"
IMAGE_NAMES = (
    "hero-abstract.webp",
    "hero-architecture.webp",
    "project-architecture.webp",
)


def data_uri(path: Path, mime_type: str) -> str:
    encoded = b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime_type};base64,{encoded}"


def main() -> None:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    html = html.replace(
        '<link rel="stylesheet" href="styles.css">',
        f"<style>\n{(ROOT / 'styles.css').read_text(encoding='utf-8')}\n</style>",
        1,
    )
    html = html.replace(
        '<script src="script.js" defer></script>',
        f"<script>\n{(ROOT / 'script.js').read_text(encoding='utf-8')}\n</script>",
        1,
    )
    html = html.replace(
        'href="favicon.svg"',
        f'href="{data_uri(ROOT / "favicon.svg", "image/svg+xml")}"',
        1,
    )

    for image_name in IMAGE_NAMES:
        image_path = ROOT / "images" / "editorial" / image_name
        html = html.replace(
            f'src="images/editorial/{image_name}"',
            f'src="{data_uri(image_path, "image/webp")}"',
        )

    # Prevent the generated distribution copy from competing with index.html in search.
    html = html.replace(
        '<meta name="robots" content="index, follow">',
        '<meta name="robots" content="noindex, follow">',
        1,
    )

    OUTPUT.write_text(html, encoding="utf-8")
    print(f"Generated {OUTPUT.name} ({OUTPUT.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
