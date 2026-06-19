import subprocess

print("NeoDaemon V2")
print("Escribe una orden. exit para salir.\n")

def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print("\nCOMMAND:")
    print(cmd)
    print("\nSTDOUT:")
    print(r.stdout)
    print("\nSTDERR:")
    print(r.stderr)
    print("\nEXIT_CODE:")
    print(r.returncode)
    print("\n---\n")

while True:
    text = input("Albert> ").strip()

    if text.lower() in {"exit", "quit"}:
        print("bye")
        break

    if text.lower() in {"estado", "status", "git status"}:
        run("git status")
    elif "lista" in text.lower() and "imagen" in text.lower():
        run("find incoming_images -type f")
    elif "jpg" in text.lower():
        run('find /openclaw -name "*.jpg" | head')
    elif text.startswith("haz "):
        run(text[4:])
    else:
        print("No entiendo aún. Usa: estado, lista imagenes, busca jpg, o haz <comando>")
