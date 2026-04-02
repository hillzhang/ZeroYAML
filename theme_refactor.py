import os
import re

directories = ["src/app", "src/components/tabs", "src/components/preview"]

replacements = [
    (r'(?<!dark:)bg-\[#0E1117\]', r'bg-white dark:bg-[#0E1117]'),
    (r'(?<!dark:)bg-\[#161B22\]/50', r'bg-gray-50 dark:bg-[#161B22]/50'),
    (r'(?<!dark:)bg-\[#161B22\]/30', r'bg-gray-50/50 dark:bg-[#161B22]/30'),
    (r'(?<!dark:)bg-\[#161B22\]/20', r'bg-gray-50/50 dark:bg-[#161B22]/20'),
    (r'(?<!dark:)bg-\[#161B22\]/80', r'bg-gray-100 dark:bg-[#161B22]/80'),
    (r'(?<!dark:)bg-\[#161B22\]', r'bg-gray-50 dark:bg-[#161B22]'),
    (r'(?<!dark:)bg-\[#1C2128\]', r'bg-white dark:bg-[#1C2128]'),
    (r'(?<!dark:)bg-\[#0D1117\]', r'bg-white dark:bg-[#0D1117]'),
    
    (r'(?<!dark:)hover:bg-\[#161B22\]/50', r'hover:bg-gray-100 dark:hover:bg-[#161B22]/50'),
    (r'(?<!dark:)hover:bg-\[#161B22\]/80', r'hover:bg-gray-200 dark:hover:bg-[#161B22]/80'),
    (r'(?<!dark:)hover:bg-\[#1C2128\]', r'hover:bg-gray-100 dark:hover:bg-[#1C2128]'),
    (r'(?<!dark:)open:bg-\[#161B22\]/50', r'open:bg-gray-50 dark:open:bg-[#161B22]/50'),

    (r'(?<!dark:)border-gray-800', r'border-gray-200 dark:border-gray-800'),
    (r'(?<!dark:)border-gray-700', r'border-gray-300 dark:border-gray-700'),
    
    (r'(?<!dark:)text-gray-200', r'text-gray-900 dark:text-gray-200'),
    (r'(?<!dark:)text-gray-300', r'text-gray-800 dark:text-gray-300'),
    (r'(?<!dark:)text-gray-400', r'text-gray-600 dark:text-gray-400'),
    (r'(?<!dark:)text-gray-600', r'text-gray-400 dark:text-gray-600'),
    
    (r'(?<!dark:)hover:text-gray-300', r'hover:text-gray-900 dark:hover:text-gray-300'),
    (r'(?<!dark:)hover:text-white', r'hover:text-black dark:hover:text-white'),
    (r'(?<!dark:)placeholder:text-gray-600', r'placeholder:text-gray-400 dark:placeholder:text-gray-600'),
]

def main():
    for d in directories:
        if not os.path.exists(d): continue
        for root, dirs, files in os.walk(d):
            for file in files:
                if file.endswith(".tsx"):
                    path = os.path.join(root, file)
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Fix text-white except when specifically within blue bg context
                    content = re.sub(r'(?<!dark:)text-white', r'text-gray-900 dark:text-white', content)
                    content = content.replace('bg-blue-600 text-gray-900 dark:text-white', 'bg-blue-600 text-white')
                    content = content.replace('bg-blue-500 text-gray-900 dark:text-white', 'bg-blue-500 text-white')
                    # lucide icon with text-white
                    content = content.replace('text-gray-900 dark:text-white w-5 h-5', 'text-white w-5 h-5')
                    
                    for pattern, repl in replacements:
                        content = re.compile(pattern).sub(repl, content)

                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)

if __name__ == '__main__':
    main()
