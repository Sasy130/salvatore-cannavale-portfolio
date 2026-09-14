# Real application screenshots

This folder is intentionally empty of images. Do not add generated application mockups.

Add authentic, appropriately redacted screenshots here using these suggested names:

- dashboard.png
- customers.png
- inventory.png
- quotations.png
- orders.png
- deliveries.png
- documents.png

Then update each corresponding `src` in `src/data/projects.ts`, for example:
`src: "/projects/business-management/dashboard.png"`.

Keep `src: null` until the screenshot exists. The gallery and inspection dialog will show a labelled empty state. Update the alt text to describe the actual capture. PNG, JPG and WebP are supported. The image frame preserves its layout and displays screenshots without cropping. A failed image also shows an explicit unavailable state.

Feature completion is separately configured in `businessModules`: use `Implemented`, `In development`, or `Planned` only after confirming the status. `null` means completion has not been verified.
