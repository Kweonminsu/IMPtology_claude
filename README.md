# 📂 프로젝트 디렉토리 구조

```
- 📁 ./
    - 📄 README.md
    - 📄 requirements.txt
    - 📁 .idea/
        - 📁 inspectionProfiles/
    - 📁 app/
        - 📄 main.py
        - 📁 core/
            - 📄 config.py
            - 📄 logging.py
            - 📄 security.py
            - 📁 __pycache__/
        - 📁 db/
            - 📄 session.py
            - 📁 models/
                - 📄 notice.py
            - 📁 __pycache__/
        - 📁 schemas/
            - 📄 notice.py
            - 📄 user.py
            - 📁 __pycache__/
        - 📁 services/
            - 📄 notice_service.py
            - 📁 __pycache__/
        - 📁 static/
            - 📁 css/
                - 📄 analysis.css
                - 📄 dashboard.css
                - 📄 data_browser_query.css
                - 📄 data_browser_tables.css
                - 📄 footer.css
                - 📄 header.css
                - 📄 home.css
                - 📄 main.css
                - 📄 notices.css
                - 📄 reports.css
                - 📄 sidebar.css
                - 📁 temp/
                    - 📄 data_browser.css
            - 📁 js/
                - 📄 analysis.js
                - 📄 dashboard.js
                - 📄 data_browser_query.js
                - 📄 data_browser_tables.js
                - 📄 home.js
                - 📄 main.js
                - 📄 notices.js
                - 📄 reports.js
                - 📄 sidebar.js
                - 📁 temp/
                    - 📄 data_browser.js
        - 📁 templates/
            - 📄 base.html
            - 📁 components/
                - 📄 footer.html
                - 📄 header.html
                - 📄 sidebar.html
            - 📁 pages/
                - 📄 404.html
                - 📄 analysis.html
                - 📄 dashboard.html
                - 📄 data_browser_query.html
                - 📄 data_browser_tables.html
                - 📄 home.html
                - 📄 notice_detail.html
                - 📄 notice_write.html
                - 📄 notices.html
                - 📄 reports.html
                - 📁 temp/
                    - 📄 data_browser.html
        - 📁 v1/
            - 📁 endpoints/
                - 📄 auth.py
                - 📄 data_browser_query.py
                - 📄 data_browser_table.py
                - 📄 datasets.py
                - 📄 insights.py
                - 📄 notices.py
                - 📄 reports.py
                - 📄 users.py
                - 📁 __pycache__/
        - 📁 __pycache__/
```



## 트리 출력
    import os

    # 제외할 디렉토리
    excluded_dirs = {".git", "venv"}
    
    # 허용할 확장자
    allowed_exts = {".py", ".html", ".js", ".css", ".md", ".txt"}
    
    def get_directory_tree(root_path):
        lines = []
        for root, dirs, files in os.walk(root_path):
            # 제외할 디렉토리 제거 (현재 위치에서만 적용됨)
            dirs[:] = [d for d in dirs if d not in excluded_dirs]
    
            level = root.replace(root_path, "").count(os.sep)
            indent = "    " * level
            lines.append(f"{indent}- 📁 {os.path.basename(root)}/")
    
            subindent = "    " * (level + 1)
            for f in sorted(files):
                ext = os.path.splitext(f)[1].lower()
                if ext in allowed_exts:
                    lines.append(f"{subindent}- 📄 {f}")
        return lines
    
    # 트리 생성
    tree_lines = get_directory_tree(".")
    
    # README.md에 저장
    with open("README.md", "w", encoding="utf-8") as f:
        f.write("# 📂 프로젝트 디렉토리 구조\n\n")
        f.write("```\n")
        f.write("\n".join(tree_lines))
        f.write("\n```")


## 설치
    python -m venv venv
    venv\Scripts\activate
    pip install --upgrade pip
    pip install -r requirements.txt
