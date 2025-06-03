import os

# Carpetas que sí queremos recorrer
INCLUDE_DIRS = {"src", ".", ".firebase"}

# Carpetas que queremos ignorar
EXCLUDE_DIRS = {"node_modules", "dist", "public", ".git", "__pycache__", ".next", "out", ".vscode", ".idea", ".env.local", ".env.development.local", ".env.test.local", ".env.production.local", "coverage", ".next"}

# Archivos importantes que siempre deben incluirse aunque estén fuera de src/
INCLUDE_FILES = {
    ".env", "firebase.json", ".firebaserc", "vite.config.js", "package.json",
    "requirements.txt", "Dockerfile", "env_vars.yaml"
}

# Archivos que debemos ignorar aunque estén en INCLUDE_DIRS
EXCLUDE_FILES = {"package-lock.json", "firebase-debug.log", "next-env.d.ts", "next.config.js", "next.config.mjs", ".DS_Store", "*.ico", "*.svg", "*.png", "*.jpg", "*.jpeg", "*.gif", "*.webp", "*.bmp", "*.tiff", "*.ico", "*.ttf", "*.woff", "*.woff2", "*.eot", "*.otf", "*.map", "*.log", "*.gz", "*.zip", "*.tar.gz", "*.md", "LICENSE", "README.md", "CHANGELOG.md", "CONTRIBUTING.md"}

# Extensiones de archivo permitidas (frontend + backend)
ALLOWED_EXTENSIONS = {
    ".js", ".jsx", ".ts", ".tsx", ".json", ".env", ".html",
    ".py", ".yaml", ".yml"
}

output_lines = []
root_dir = os.path.dirname(os.path.abspath(__file__))

def is_relevant_file(filepath):
    filename = os.path.basename(filepath)
    if filename in EXCLUDE_FILES:
        return False
    if filename in INCLUDE_FILES:
        return True
    if os.path.splitext(filename)[1] in ALLOWED_EXTENSIONS:
        return True
    return False

for current_dir, dirs, files in os.walk(root_dir):
    # Ignorar directorios excluidos
    dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

    rel_dir = os.path.relpath(current_dir, root_dir)
    if rel_dir == ".":
        output_lines.append("📁 ./")
    else:
        output_lines.append(f"\n📁 {rel_dir}/")

    for file in sorted(files):
        full_path = os.path.join(current_dir, file)
        rel_path = os.path.relpath(full_path, root_dir)

        if is_relevant_file(full_path):
            output_lines.append(f"\n📄 {rel_path}")
            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    contents = f.read()
                    output_lines.append("```")
                    output_lines.append(contents.strip())
                    output_lines.append("```")
            except Exception as e:
                output_lines.append(f"[❌ Error leyendo {rel_path}: {e}]")

# Guardar el resultado en archivo TXT
output_path = os.path.join(root_dir, "proyecto_aurorasql_resumen.txt")
try:
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(output_lines))
    print(f"✅ Resumen generado correctamente en: {output_path}")
except Exception as e:
    print(f"❌ Error al guardar el archivo: {e}")
