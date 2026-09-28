import re
from pathlib import Path

def flatten_cards():
    base = Path("/Users/apple/Downloads/Aegis/client/src/components")
    
    replacements = {
        # Remove background/borders from outer cards to make them flush
        r'bg-surface border border-border rounded-md': '',
        r'bg-surface rounded-md shadow-sm border border-border': '',
        r'bg-surface border-y border-border': 'border-y border-border',
        r'bg-background border-border': 'border-border',
        r'shadow-sm': '',
        r'shadow-md': '',
        r'rounded-md': 'rounded',
        # Change badge backgrounds to minimal outlined
        r'bg-critical text-white': 'bg-transparent text-critical border border-critical',
        r'bg-high text-white': 'bg-transparent text-high border border-high',
        r'bg-medium text-white': 'bg-transparent text-medium border border-medium',
        r'bg-low text-white': 'bg-transparent text-low border border-low',
    }

    for file in base.glob("*.tsx"):
        content = file.read_text()
        for pattern, replacement in replacements.items():
            content = re.sub(pattern, replacement, content)
        file.write_text(content)

if __name__ == "__main__":
    flatten_cards()
