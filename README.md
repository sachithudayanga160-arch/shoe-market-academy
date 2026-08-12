# Shoe Market Academy

Mobile-first daily footwear learning and business-intelligence app for Sri Lanka.

## Included
- Daily masterclass: beginner → professional
- Men's, women's and children's footwear learning
- Shoe market news with sources
- Sri Lanka business opportunity radar
- Startup advice and validation tasks
- New-thinking / innovation ideas
- Vocabulary, quizzes, action tasks and personal notes
- PWA / Add to Home Screen support
- Automatic 7:00 AM Sri Lanka update workflow

## Publish the mobile app
GitHub repository → **Settings → Pages** → under **Build and deployment**, choose **Deploy from a branch** → Branch **main** → Folder **/(root)** → Save.

The expected Pages URL is:
`https://sachithudayanga160-arch.github.io/shoe-market-academy/`

## Turn on fresh daily AI + web updates
The workflow at `.github/workflows/daily-update.yml` runs at **07:00 Asia/Colombo**.

It requires an OpenAI API key stored only as a GitHub Actions secret:
Repository → **Settings → Secrets and variables → Actions → New repository secret**

Name it exactly:
`OPENAI_API_KEY`

Do not paste the API key into any public repository file.

After adding the secret, go to **Actions → Daily Shoe Market Update → Run workflow** once to test it.

OpenAI API billing is separate from a ChatGPT subscription.
