import subprocess

print("NeoDaemon V2 Shell")
print("Escribe un comando. Escribe 'exit' para salir.\n")

while True:
    cmd = input("Albert> ").strip()

    if cmd.lower() in {"exit", "quit"}:
        print("bye")
        break

    if not cmd:
        continue

    result = subprocess.run(
        cmd,
        shell=True,
        capture_output=True,
        text=True
    )

    print("\nCOMMAND:")
    print(cmd)

    print("\nSTDOUT:")
    print(result.stdout)

    print("\nSTDERR:")
    print(result.stderr)

    print("\nEXIT_CODE:")
    print(result.returncode)

    print("\n---\n")
