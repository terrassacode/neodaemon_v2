# Voice STT Medium Benchmark v1

Benchmark local con audios reales de Albert. No cambia producción.

Archivo local generado: `/openclaw/openclaw_v2/data/voice/stt-benchmarks/stt-benchmark-20260620-213425.json`

## Resumen

| Modelo | Audios | Media tiempo | Observación |
|---|---:|---:|---|
| `base` | 3 | 2253 ms | más rápido, menos puntuación/capitalización |
| `small` | 3 | 4529 ms | equilibrio actual calidad/latencia |
| `medium` | 3 | 29565 ms | candidato preciso; valorar si compensa latencia |

## Resultados por audio

### `2026-06-20T20-34-22-773Z_bb1c9163_ptt.wav`

- `base` · 2239 ms · `Hola, ¿me escuchas ni a?`
- `small` · 4441 ms · `Hola, ¿me escuchas niña?`
- `medium` · 10878 ms · `Hola, ¿me escuchas Nia?`

### `2026-06-20T20-59-35-524Z_7b902252_ptt.wav`

- `base` · 2334 ms · `con la nía, ¿me escuchas?`
- `small` · 4280 ms · `Colonia me escuchas`
- `medium` · 10598 ms · `Hola Nia, ¿me escuchas?`

### `2026-06-20T21-06-34-621Z_b9c05ba6_ptt.wav`

- `base` · 2186 ms · `hola como estas, me escuchas`
- `small` · 4867 ms · `Hola, ¿cómo estás? ¿Me escuchas?`
- `medium` · 67218 ms · `Hola, ¿cómo estás? ¿Me escuchas?`

## Conclusión provisional

Usar estos datos para decidir si añadir selector `Rápido / Equilibrado / Preciso`.
