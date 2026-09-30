# Insights image style guide

All Insights article images follow this style. It was used to generate the full set of 180 images in September 2026, and the daily .com sync uses it for every new article.

## Service
- Replicate, Flux (`flux-1.1-pro`, or `flux-dev` as fallback). Token: `REPLICATE_API_TOKEN`.
- Output URLs expire after about 24 hours. Download the image straight away and store it locally. Never keep the Replicate URL as a reference.
- Match the file format, dimensions, aspect ratio and naming convention of the existing Insights images in the repo.
- The English and German versions of an article point to the same image file.

## The concept: one visual metaphor
- Each image is a single, concrete, physical object or scene that works as a metaphor for the article's central idea. Examples: a taut tug-of-war rope for power in leadership, a fanned hand of playing cards for Planning Poker, a compass needle mid-spin for losing direction, a stone dropping into still water for first AI projects.
- Close-ups and simple scenes. Hands are fine; recognisable faces are not.
- No text, no logos, no screens with UI, no diagrams, no sticky-note walls, no people around a meeting table. It must not look like stock or corporate imagery.
- Don't reuse a metaphor that an existing article already has (e.g. an hourglass is taken). If in doubt, check the existing images first.

## Prompt structure
`[One sentence describing the metaphor object or scene, concretely, with a surface or setting]` + the style suffix, word for word:

> Black and white documentary photograph, natural and moody lighting, genuine tonal depth with true blacks and soft highlights, 35mm film aesthetic with visible grain, shallow depth of field. Editorial photography composition, not stock or corporate imagery.

Example:
> A close-up of an old mechanical kitchen timer on a wooden counter, dial partially turned. Black and white documentary photograph, natural and moody lighting, genuine tonal depth with true blacks and soft highlights, 35mm film aesthetic with visible grain, shallow depth of field. Editorial photography composition, not stock or corporate imagery.

## Checks before use
- The result is black and white, with no colour cast.
- No garbled text, no extra fingers or other obvious AI artefacts, and nothing that looks like a real brand.
- If a generation fails these checks, regenerate once. If it fails again, leave the article without an image and raise a question in the sync PR.
- Record the metaphor and prompt used in the PR description, so Russ can see them when reviewing.
