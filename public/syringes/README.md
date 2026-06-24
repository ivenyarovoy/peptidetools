# Syringe photos

Drop a photo of each insulin syringe here. The dosage calculator shows the photo
for the currently selected syringe (above the diagram). If a file is missing, the
calculator just hides the image and shows the placeholder box — no error.

Expected filenames (referenced in `lib/syringes.ts` → `Syringe.photo`):

| Syringe        | File path                  |
| -------------- | -------------------------- |
| 0.3 mL / 30 u  | `public/syringes/0.3ml.jpg` |
| 0.5 mL / 50 u  | `public/syringes/0.5ml.jpg` |
| 1 mL / 100 u   | `public/syringes/1ml.jpg`   |

Notes:
- Anything under `public/` is served from the site root, so `public/syringes/0.5ml.jpg`
  is available at `/syringes/0.5ml.jpg`.
- `.jpg` is assumed; if you use a different extension, update the `photo` paths in
  `lib/syringes.ts` to match.
- Landscape orientation (needle on the right) matches the diagram. Roughly 3:1 to
  4:1 aspect works well in the ~112px-tall slot; it's shown with `object-contain`.
