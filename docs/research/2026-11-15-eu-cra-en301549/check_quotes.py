#!/usr/bin/env python3
"""Check that every quote in FACTS.md is literally present at the line it cites.

Usage: python3 -I check_quotes.py            (from this folder)
Reads rows shaped `| n | claim | `texto/<file>:<line>` | `quote` |`, opens texto/<file>, and requires the quote
to be a substring of that line. Exit 0 when every row checks, 1 otherwise. Standard library only.
"""

import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROW = re.compile(r'^\| \d+ \| .*? \| `((?:texto/|\.\./)[^`]+):(\d+)` \| `(.+)` \|$')


def main() -> int:
    bad, total = [], 0
    for raw in (HERE / 'FACTS.md').read_text(encoding='utf-8').splitlines():
        m = ROW.match(raw)
        if not m:
            continue
        total += 1
        file, line, quote = m.group(1), int(m.group(2)), m.group(3)
        try:
            text = (HERE / file).read_text(encoding='utf-8').split('\n')[line - 1]
        except (OSError, IndexError):
            bad.append(file + ':' + str(line) + ' unreadable')
            continue
        if quote not in text:
            bad.append(file + ':' + str(line) + ' quote not found: ' + quote[:60])
    for b in bad:
        print('MISSING ' + b)
    print('citas=' + str(total) + ' fallidas=' + str(len(bad)))
    return 1 if bad or total == 0 else 0


if __name__ == '__main__':
    raise SystemExit(main())
