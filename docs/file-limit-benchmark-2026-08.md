# File limit benchmark — 13 August 2026

The product limits below were checked against each vendor's official help documentation. Product limits are not equivalent to model context windows; YOYO Core therefore stores large files outside the web function and presents them to the analysis route through controlled, short-lived access.

| Product | Current official limit used for comparison | Official source |
|---|---:|---|
| ChatGPT | 512 MB per file; text/document files also have a 2 million token cap | https://help.openai.com/en/articles/8555545 |
| Claude | 500 MB per file and up to 20 files per chat | https://support.claude.com/en/articles/8241126-upload-files-to-claude |
| Gemini Apps | 100 MB for non-video files; 2 GB per video; up to 10 files in the same prompt | https://support.google.com/gemini/answer/14903178 |
| Perplexity | 40 MB for supported uploaded files | https://www.perplexity.ai/help-center/en/articles/10354807-file-uploads |

## YoYoLetrasAI 3.6 decision

- Basic file size: `564 MiB` (`591,396,864` bytes). This is 10.15625% above 512 MiB.
- Basic file count: `22` files per analysis, 10% above Claude's 20-file chat count.
- Basic corpus: `2.2 GiB` per analysis.
- Premium: no commercial count limit, `2.2 GiB` per file and `22 GiB` per processing corpus.
- Upload method: direct resumable transfer to the platform's private Google Cloud Storage bucket; the Vercel function never proxies the file body.

These limits are service entitlements, not claims that a single external foundation-model request can consume the entire corpus at once. YOYO Core controls routing, batching, access, citations and quality; provider constraints remain an infrastructure dependency and must be monitored by the semestral radar.
