# IceBrAIker

IceBrAIker is a networking conversation-starter prototype with a React / Next.js
frontend and a Flask API.

## What works today

- Responsive, accessible dark-mode conversation studio.
- An **offline fictional example**, built into the frontend. No scraping,
  authentication, model keys or API server are needed for this sample.
- A Flask `GET /demo` endpoint returning the same kind of explicitly synthetic
  example for API consumers.
- A Flask `POST /process` integration boundary with input validation,
  error responses and isolated regression tests.
- Optional, **legacy** LangChain/LinkedIn-style research integration. This path
  still depends on external providers and has not been verified end to end
  against current provider APIs.

This is an MVP demonstration, **not** a validated production social research
service. The fictional profile is never presented as a real individual.

## Run the offline frontend

With Node.js 22 and PowerShell:

```powershell
git clone https://github.com/rainrunner20/IceBrAIker.git
cd IceBrAIker/my-nextjs-app
npm ci
npm run dev
```

Open http://localhost:3000 and choose **Try fictional example**.

## Optional Flask API

```powershell
cd IceBrAIker/flask-backend
py -m venv .venv
.\.venv\Scripts\python -m pip install -r requirements-api-test.txt
.\.venv\Scripts\python app.py
```

The Flask server exposes `GET http://127.0.0.1:5000/health` and
`GET http://127.0.0.1:5000/demo` without external credentials.

To enable real profile research, install the separate production dependencies,
configure any required provider credentials **outside Git**, and set
`NEXT_PUBLIC_API_URL=http://127.0.0.1:5000` in
`my-nextjs-app/.env.local`. This path is unverified, depends on third-party
data sources, and must not be represented as production-ready. Validate
permission, privacy, provider compliance and data quality before using
real-person information.

## Tests and CI

```powershell
cd flask-backend
python -m unittest discover -s tests -v
cd ../my-nextjs-app
npm ci
npm run build
```

The pull request runs Flask tests on Python 3.11/3.12 and a separate
Next.js build. A successful build does not establish that the legacy
scraping/model integration works or that a production domain is deployed.

## Current roadmap

- [x] Input validation and stable Flask API error contract
- [x] Synthetic backend/demo and offline frontend fallback
- [x] Typed browser responses, error states, mobile-friendly dark UI
- [ ] Modernize and verify permitted provider integrations
- [ ] Implement and test authentication, saved profiles, and persistence
- [ ] Add real deployment smoke tests and monitoring
- [ ] Audit privacy, bias and data provenance in generated profiles

No database-backed favorites, RAG pipeline, DistilBERT matching, or benchmarked
accuracy improvements are claimed as implemented. See
[API documentation](flask-backend/API_CONTRACT.md) for limitations.
