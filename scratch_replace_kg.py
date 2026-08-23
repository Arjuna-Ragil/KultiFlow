import os
import re

replacements = {
    'ui/src/app/api/negotiate/route.ts': [
        ('/kg', '/unit')
    ],
    'ui/src/app/customer/negotiator/page.tsx': [
        ('/kg', '/unit')
    ],
    'ui/src/app/customer/orders/page.tsx': [
        ('unit: "kg"', 'unit: "unit"'),
        ('unit: "pcs"', 'unit: "unit"')
    ],
    'ui/src/app/admin/catalog/page.tsx': [
        ('unit: "/kg"', 'unit: "/unit"')
    ],
    'ui/src/app/admin/warehouse/page.tsx': [
        ('>Total Capacity (kg)<', '>Total Capacity (units)<'),
        ('>kg<', '>units<')
    ]
}

for file_path, rules in replacements.items():
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for target, replacement in rules:
            content = content.replace(target, replacement)
            
        if content != original:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file_path}")
    else:
        print(f"File not found: {file_path}")
