# Voice STT Benchmark v1

Objetivo: comparar modelos STT locales con audios reales de Albert antes de cambiar producción.

Script:

```bash
voice_tools/benchmark_stt.py --models base,small --latest 3 --write
```

Ejemplos:

```bash
voice_tools/benchmark_stt.py data/voice/inputs/archivo.wav --models small,medium --write
voice_tools/benchmark_stt.py --models base,small,medium --latest 5 --write
```

Salida:

- JSON por stdout.
- Si `--write`, archivo en:

```text
data/voice/stt-benchmarks/
```

Campos relevantes:

- `model`
- `elapsedMs`
- `text`
- `duration`
- `languageProbability`
- `audioBytes`

Privacidad:

- no versiona audios;
- no versiona resultados de benchmark;
- pensado para datos locales.
