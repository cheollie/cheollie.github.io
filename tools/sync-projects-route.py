from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
text=(root/'projects.html').read_text(encoding='utf-8')
text=re.sub(r'(src|href)="(?!https?:|/|#|\?)([^"]+)"',r'\1="/\2"',text)
(root/'projects/index.html').write_text(text,encoding='utf-8')
