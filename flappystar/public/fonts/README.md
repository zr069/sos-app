# Self-Hosted Fonts

For DSGVO compliance, this project uses self-hosted fonts instead of external font services like Google Fonts.

## Required Font Files

Download and place the following font files in this directory:

### Syne (Display Font)
- `Syne-Bold.woff2`

Download from: https://fonts.google.com/specimen/Syne
Or use: https://gwfh.mranftl.com/fonts/syne?subsets=latin

### Inter (Body Font)
- `Inter-Regular.woff2`
- `Inter-Medium.woff2`
- `Inter-SemiBold.woff2`
- `Inter-Bold.woff2`

Download from: https://fonts.google.com/specimen/Inter
Or use: https://gwfh.mranftl.com/fonts/inter?subsets=latin

## Font Conversion

If you have TTF/OTF files, convert them to WOFF2 using:
- https://cloudconvert.com/ttf-to-woff2
- Or use the `woff2_compress` CLI tool

## File Structure

```
public/fonts/
├── Inter-Bold.woff2
├── Inter-Medium.woff2
├── Inter-Regular.woff2
├── Inter-SemiBold.woff2
├── README.md
└── Syne-Bold.woff2
```

## License

Both Syne and Inter are licensed under the SIL Open Font License (OFL).
