import os
import re
from pathlib import Path

def refactor():
    base = Path("/Users/apple/Downloads/Aegis/client/src")
    
    css = base / "index.css"
    css.write_text('''@import "tailwindcss";

@theme {
  --color-background: #f8f9fa;
  --color-surface: #ffffff;
  --color-border: #dee2e6;
  --color-textMain: #212529;
  --color-textMuted: #6c757d;
  --color-primary: #343a40;
  --color-critical: #dc3545;
  --color-high: #fd7e14;
  --color-medium: #ffc107;
  --color-low: #17a2b8;
  --color-info: #6c757d;
}

@layer base {
  body {
    background-color: var(--color-background);
    color: var(--color-textMain);
  }
}
''')

    components = base / "components"
    
    replacements = {
        r'bg-\[\#F7F8FA\]': 'bg-background',
        r'bg-\[\#FFFFFF\]': 'bg-surface',
        r'bg-\[\#F1F5F9\]': 'bg-background',
        r'text-\[\#0F172A\]': 'text-textMain',
        r'text-\[\#475569\]': 'text-textMuted',
        r'text-\[\#64748B\]': 'text-textMuted',
        r'text-\[\#FFFFFF\]': 'text-white',
        r'border-\[\#E2E8F0\]': 'border-border',
        r'bg-\[\#1D4ED8\]': 'bg-primary',
        r'hover:bg-\[\#1E40AF\]': 'hover:bg-primary',
        r'text-\[\#1D4ED8\]': 'text-primary',
        r'bg-\[\#EF4444\]': 'bg-critical',
        r'text-\[\#EF4444\]': 'text-critical',
        r'border-\[\#EF4444\]': 'border-critical',
        r'bg-\[\#F97316\]': 'bg-high',
        r'text-\[\#F97316\]': 'text-high',
        r'border-\[\#F97316\]': 'border-high',
        r'bg-\[\#EAB308\]': 'bg-medium',
        r'text-\[\#EAB308\]': 'text-medium',
        r'border-\[\#EAB308\]': 'border-medium',
        r'bg-\[\#3B82F6\]': 'bg-low',
        r'text-\[\#3B82F6\]': 'text-low',
        r'border-\[\#3B82F6\]': 'border-low',
        r'rounded-2xl': 'rounded',
        r'rounded-xl': 'rounded',
        r'rounded-lg': 'rounded-md',
        r'rounded-full': 'rounded',
        r'shadow-sm': '',
        r'shadow-md': '',
        r'shadow-lg': '',
        r'shadow': '',
        r'text-4xl': 'text-xl',
        r'text-5xl': 'text-2xl',
        r'text-3xl': 'text-lg',
        r'py-24': 'py-8',
        r'py-20': 'py-8',
        r'py-16': 'py-6',
        r'mb-16': 'mb-6',
        r'mb-12': 'mb-4',
        r'p-8': 'p-4',
        r'p-6': 'p-4',
        r'gap-8': 'gap-4',
        r'gap-6': 'gap-4',
    }

    for file in components.glob("*.tsx"):
        content = file.read_text()
        for pattern, replacement in replacements.items():
            content = re.sub(pattern, replacement, content)
        file.write_text(content)

if __name__ == "__main__":
    refactor()
