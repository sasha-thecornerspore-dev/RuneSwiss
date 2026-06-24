# Corpus sources & attribution

RuneSwiss bundles the Liber Primus ciphertext from community transcriptions of the **Cicada 3301**
public puzzle. The runic ciphertext is captured **verbatim** from machine-readable source files —
never retyped — so the data is byte-faithful to the upstream transcriptions.

## Vendored sources

| File | Upstream | What it is |
|------|----------|------------|
| `iddqd-master.txt` | [rtkd/iddqd](https://github.com/rtkd/iddqd) — `liber-primus__transcription--master/` | The de-facto canonical full-book transcription in Unicode runes, with a documented delimiter grammar (word `-`, clause `.`, paragraph `&`, segment `$`, chapter `§`, line `/`, page `%`). Primary verbatim ciphertext source. |
| `cicada_tools/*.json` | [yo-yo-yo-jbo/cicada_tools](https://github.com/yo-yo-yo-jbo/cicada_tools) — `liber_primus/<section>/section.json` | Per-section files that pair each page's runic ciphertext with the documented solve transform (cipher type, key in runes, and `interrupt_indices`). Used to drive the solved-page regression tests. `< >` spans are upstream heading annotations, not ciphertext. |

## Cross-check / reference sources (not vendored, cited for provenance)

- [krisyotam/cicada3301](https://github.com/krisyotam/cicada3301) — mirror transcription, `GEMATRIA-PRIMUS.md`, decoded pages, dated PGP `.asc` archive (timeline).
- [scream314/cicada3301](https://github.com/scream314/cicada3301) — `liber_primus.md`, per-page keys + plaintext.
- [relikd/LiberPrayground](https://github.com/relikd/LiberPrayground) — independent hand-checked transcription (true cross-validation witness).
- [Boxentriq Gematria Primus translator](https://www.boxentriq.com/encodings/gematria-primus-translator) and [lipeeeee/gematria](https://github.com/lipeeeee/gematria) — used to confirm the canonical 29-rune ↔ prime table (`ᛡ=IA/IO=107`, `ᛠ=EA=109`).

## Licensing note

The underlying Cicada 3301 puzzle material is public. The upstream community repositories above did
not surface explicit license files at capture time. RuneSwiss redistributes these transcriptions for
study/research with attribution; if you are an upstream author and want a change, please open an issue.
