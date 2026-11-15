#!/usr/bin/env python3
"""Derive a plain-text copy of a saved HTML source so exact quotes can be checked with grep -F.

Usage: python3 html_to_text.py fuentes/source.html texto/source.txt
Inline links split sentences in the HTML; the text copy joins them. Refuses to overwrite (exit 1 on an
existing output). The HTML stays the source of record; the text is a derivation.
"""

from html.parser import HTMLParser
from pathlib import Path
import re
import sys

BLOCKS = ('p', 'li', 'div', 'section', 'h1', 'h2', 'h3', 'h4', 'dt', 'dd', 'br', 'tr')


class Text(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out, self.skip = [], 0

    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'):
            self.skip += 1
        if tag in BLOCKS:
            self.out.append('\n')

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.skip -= 1

    def handle_data(self, data):
        if not self.skip:
            self.out.append(data)


def main(source: Path, target: Path) -> int:
    parser = Text()
    parser.feed(source.read_text(encoding='utf-8'))
    text = re.sub(r'[ \t\r\f\v]+', ' ', ''.join(parser.out))
    text = re.sub(r'\n\s*\n+', '\n', text)
    with target.open('x', encoding='utf-8') as stream:
        stream.write(text)
    print(str(len(text)) + ' characters -> ' + str(target))
    return 0


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(__doc__, file=sys.stderr)
        raise SystemExit(2)
    raise SystemExit(main(Path(sys.argv[1]), Path(sys.argv[2])))
