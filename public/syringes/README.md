# Syringe photos

A photo of each insulin syringe. The dosage calculator's "Syringe size" selector
shows these as full-width rows (one per option). If a file is missing, the
calculator hides the image and shows just the label — no error.

Filenames (referenced in `lib/syringes.ts` → `Syringe.photo`):

| Syringe        | File path                   |
| -------------- | --------------------------- |
| 0.3 mL / 30 u  | `public/syringes/0.3ml.png` |
| 0.5 mL / 50 u  | `public/syringes/0.5ml.png` |
| 1 mL / 100 u   | `public/syringes/1ml.png`   |

Notes:
- Anything under `public/` is served from the site root, so `public/syringes/0.5ml.png`
  is available at `/syringes/0.5ml.png`.
- Current images are wide/landscape (~600×110, needle on the right) and are shown
  full-width at their natural aspect ratio, which suits long syringe photos.
- To use a different extension, update the `photo` paths in `lib/syringes.ts` to match.
