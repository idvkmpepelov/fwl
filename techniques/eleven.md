# Eleven techniques

Order of ability weights: STR, GRP, END, SPD, FLX, TEC, EXP. Each row is percent and sums to 100.

Success chance uses those weights. It is not a fixed percent. `P = clamp(1 / (1 + e^(-(A_eff - D_eff) / 15)), 0.05, 0.95)`.

| Technique | Offensive weights | Defensive weights | Weight sensitivity | Height L | Where |
|---|---|---:|---:|---|
| Double leg | 25/15/5/25/5/20/5 | 25/5/5/25/10/20/10 | 70 | −0.5 | standing |
| Sprawl counter | 25/10/5/20/10/20/10 | 25/25/5/10/10/15/10 | 75 | +0.5 | counter to a failed double |
| Crotch lift | 35/15/5/10/5/20/10 | 25/15/5/10/20/15/10 | 90 | +0.5 | standing or top |
| Foot-trap leg lift | 30/20/5/5/5/25/10 | 25/5/5/10/25/20/10 | 60 | +0.5 | top |
| Gut wrench | 30/25/5/5/5/25/5 | 30/10/5/5/20/20/10 | 65 | 0 | top |
| Leg lace | 15/25/5/10/10/25/10 | 15/5/5/15/30/20/10 | 30 | +0.5 | top |
| Half nelson | 25/25/5/5/5/25/10 | 25/15/5/5/25/15/10 | 50 | +1 | top |
| Cradle | 20/25/5/5/15/20/10 | 20/10/5/10/30/15/10 | 40 | +1 | top |
| Reversal | 20/15/5/15/15/20/10 | 25/25/5/10/5/20/10 | 45 | 0 | bottom |
| Body lock | 35/25/5/10/0/15/10 | 30/15/5/15/10/15/10 | 80 | −0.5 | standing |
| Stand-up escape | 15/10/10/20/20/15/10 | 25/30/5/5/5/20/10 | 25 | 0 | bottom |

Extra probabilities, after the success roll:

- Full exposure, only on a technique that has a 4-point variant: `clamp(0.50 + 0.008 * Δ, 0.15, 0.85)`.
- Failed attack opens a reversal chance: gut 45%, leg lace 35%, foot-trap 30%. Half nelson and cradle do not. The reversal itself is then a normal reversal roll.
- Pin chance after a 4-point exposure: half nelson 75%, cradle 80%, full foot-trap 65%, full crotch 55%, gut and leg lace 0. Adjusted `clamp(B + 0.005 * Δ, 0.05, 0.95)`.
- The AI picks its best legal action with probability `min(1, 0.4 + 0.006 * EXP)`.

Attacker fatigue base, defender fatigue base, and duration in seconds: double 12–20 / 10–18 / 12–25; sprawl 8–15 / 12–20 / 8–20; crotch 18–28 / 12–22 / 10–25; foot-trap 15–25 / 12–22 / 15–30; gut 12–22 / 10–20 / 10–25; leg lace 10–18 / 10–20 / 10–25; half nelson 12–22 / 12–22 / 15–30; cradle 12–22 / 12–22 / 15–30; reversal 8–16 / 10–18 / 8–20; body lock 14–24 / 12–20 / 12–25; escape 8–16 / 5–12 / 8–20.
