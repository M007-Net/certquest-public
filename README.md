# CertQuest â€” Realms of Knowledge

## Quick start with Docker Desktop

Install Git and Docker Desktop, then start Docker Desktop in Linux containers mode. Open PowerShell in the folder where you want to download CertQuest and run:

```powershell
git clone https://github.com/M007-Net/certquest-public.git
cd certquest-public
docker compose up -d --build --wait
Start-Process 'http://localhost:8095'
```

Run the browser command after Docker reports the service is healthy. The game includes the certification paths and both in-browser workshops.

To verify the installation from the CertQuest folder:

```powershell
docker compose ps
curl.exe -fsS http://localhost:8095/healthz
```

The web service should show as healthy and the health check should print `ok`.

To update an existing installation, open PowerShell in the CertQuest folder and run:

```powershell
git pull --ff-only
docker compose up -d --build --wait
```

To stop CertQuest, run `docker compose down` from the same folder. To start it again, run `docker compose up -d --build --wait`. On Windows, **Start CertQuest.cmd** also opens the game in your browser.


The default port is 8095 and is accessible only from this computer. To change it, set `CERTQUEST_PORT` in a local `.env` file, for example `CERTQUEST_PORT=8096`, and open the matching localhost address.

The container runs as an unprivileged user with a read-only filesystem, compression, cache revalidation, and a health check at `/healthz`. Browser saves survive container restarts/rebuilds. Saves are per browser and address: export from the hosted game and import into localhost to continue there. Changing ports also changes the browser's save location. There is no cloud save synchronization or server database.

## GitHub and automatic builds

Pushes to the main branch run the gameplay and save tests, then start the Docker container and check its HTTP endpoints. After the checks pass, GitHub Actions publishes container tags under the repository's own path in GitHub Container Registry. Pull requests run checks with read-only permissions. The workflow uses the repository's automatic GitHub token.

You can build and run the app directly with Docker Compose. To use a published image, find its name and tags on the repository's **Packages** page.

## Study and play

Choose one of six persistent illustrated heroes. Every hero can learn every path; equipment and learning progress follow the character. Study paths use independent domain branches, assessment guardians, targeted practice, a searchable field manual and saved practical-work notes.

| Exam track | Classification | Progress reward |
| --- | --- | --- |
| A+ Core 1 / Core 2 (220-1201 / 220-1202) | Artificer | Armor |
| Network+ (N10-009) | Wayfinder | Healing potions |
| Security+ (SY0-701) | Sentinel | Swords |
| AWS Cloud Practitioner (CLF-C02) | Cloudweaver | Knowledge charms |
| Azure Fundamentals (AZ-900) | Skywarden | Shields |

Gear upgrades at one-third, two-thirds and all branches in the matching path. A+ armor milestones are three branches, fourteen Core 1 branches and every A+ objective. Older items stay collected. Each first-tier path unlocks a campaign ability. The original fifteen short campaign quests remain available alongside the expanded academy; their introductory twelve-question trials are separate from the academy finals.

The original six exam tracks and Foundations have 156 branches; the eight additional starter courses add 28 branches. Question types include single-choice, matching, multi-select and ordering. Assessments move from recall toward application and scenario decisions. A branch needs 80% correct, at least half its scenario decisions correct, and health remaining. Topic, certification, all-topic and missed-question practice use saved decks without repeats within a session. Beginning a new session deliberately permits another attempt.

Detailed concept chapters open from branch lessons or the field manual. Each includes an explanation, distinctions, a worked case, a relationship/decision map, practical exercises, primary references and a small targeted practice set. Many include comparison tables. The manual searches titles, explanations and reference terms; full chapters render individually. Coverage & labs lists the chapters and exercises mapped to each numbered objective/task area and stores your lab notes. Reading and concept-check progress are recorded separately.

A new sixty-question final trial unlocks after every branch and at least 80% of each detailed chapter's unique concept questions are answered correctly. Domain sampling follows the registry weights; Azure uses a local choice within its published ranges. Trials save answers and flags, allow revisions, and defer explanations until submission. Earlier results and unfinished attempts survive content additions. An old branch clear does not automatically mark new concept questions as mastered. These are original practice questions, not official exam items or copied commercial banks. Official certification exams must be booked separately with their vendors.

Every three unique correct practice/assessment answers adds one base HP, capped at +40. Every ten unique correct answers of a damage type adds one resistance, capped at five. Hardware is amber, network blue, software violet, security rose and health green. Fresh campaign encounters use ten base normal damage and twenty knowledge damage, before level and gear bonuses. Attack, spell and healing animations respect reduced-motion preferences. Active battles retain their saved stats so training cannot alter a fight in progress.

## Skills workshop

Open **Skills workshop → PowerShell Essentials** for 14 hands-on scripting lessons. Edit the starter script, use **Run code** to preview sample output, then choose **Check quest** to run every test case. The training shell runs in the browser, including on phones, with fictional data and temporary virtual files. It supports the PowerShell concepts and commands taught in the course. Each first pass earns 25 hero XP. Drafts and course progress are included in your game save.

Open **Skills workshop → Bash Essentials** for 12 browser-based lessons on shell navigation, variables and arguments, pipelines, redirection, conditionals, and loops. Build a log report in the final quest. The simulator uses virtual files and supports the Bash features taught in the course.

## Saving and recovery

Progress saves in this browser on this device after answers and actions. Your Grimoire exports/imports the hero, equipment, learning credits, sessions, results and notes. The previous valid save is retained as a backup; damaged saves open a recovery screen rather than being overwritten. Import asks before replacing existing progress. Hosting addresses, ports and local files have separate saves: export/import when moving. There is no account or automatic cloud synchronization. Keep exported backups before clearing browser data.

## Content maintenance and scope

Editable detailed chapters are in `content/*-depth.json`; compile and validate them with:

```sh
python scripts/compile-depth.py
npm test
```

The compiler produces `dist/depth-data.js`, the per-track `content/depth-report.json`, and the objective-to-chapter inventory `content/coverage-inventory.json`. It checks stable identifiers, source links, worked examples and exercise keys. Content tests verify that the published bundle matches its editable sources. The inventory records authored material; it does not substitute for independent review of every official objective bullet. Chapter counts and word counts do not establish exam readiness. Work through the primary references and practical exercises, and check the current vendor guide before booking an exam.

The A+ source builders are layered: use `python scripts/complete-aplus-reference.py` to regenerate the full authored A+ set, then compile. Running only an earlier A+ builder produces a smaller intermediate set. Network, Security and cloud detail files are maintained directly. Base content import/build tools remain in `scripts/import-aplus.py`, `scripts/import-certifications.py`, `scripts/build-cloud-course.py` and `scripts/build-scenarios.py`; their base question identifiers must remain stable for older saves.

Registry metadata and free study resources are in `dist/certification-registry.js`. Official guides reviewed November 6, 2026 include CompTIA 220-1201/1202, N10-009, SY0-701, AWS CLF-C02 and Microsoft AZ-900. References are linked within each chapter. Imported CertForge material is distributed under its original MIT license in `CERTFORGE-LICENSE.txt`; new explanations and practice scenarios are original. Six simplified hero illustrations and enemy artwork were made using OpenAI image generation; see `ASSET-PROMPTS.md`. Lightweight academy guardians use themed SVG variations.

## Verification

`npm test` needs Node.js 22 or later and no installed packages. It validates published content, traverses every branch and answer key, completes six final trials, checks grading, reward tiers, training caps, practical notes, corrupted-save recovery and earlier battle/session compatibility. Detailed-reader tests cover search, saved read progress, targeted decks, incorrect-answer mastery and new-content exam gates. GitHub also starts and checks the actual Docker container before publishing its image.

The November 6 browser check exercised hero selection, manual search, a reference chapter, question feedback and refresh/resume. It found and corrected an answer-panel collapse in a short window. Assessment content now scrolls within a viewport panel while navigation stays available. This check does not establish accessibility conformance or coverage of every device size.

## Additional certifications

CCNA and CySA+ starter expeditions are joined by AZ-104, SAA-C03, SC-900, Google Cloud Digital Leader, Terraform Associate 004, and RHCSA EX200. Find them under **More certifications** on each camp realm card. See [course scope and maintenance](docs/specialist-courses.md). The academy now has 213 branches, 340 detailed chapters, 1,607 questions, and 68 main-topic lab outlines. These counts describe available content, not complete exam coverage. The six specialist courses have expanded lessons and final challenges sized to their question banks.
