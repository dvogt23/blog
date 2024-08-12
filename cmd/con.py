#!/usr/bin/env python3
import sys
from markdownify import markdownify

data = sys.stdin.read()
mark =  markdownify(data, heading_style="ATX")
print(mark)

