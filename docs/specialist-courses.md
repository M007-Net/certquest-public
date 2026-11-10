# Specialist courses

Added November 7, 2026. Open **More certifications** on a camp realm card. The existing six academy toolbar actions remain unchanged.

| Course | Camp path | Selected learning groups | Reward |
|---|---|---|---|
| Azure Administrator AZ-104 | Azure | Identity/governance; storage/recovery; networks/monitoring | Shields |
| AWS Solutions Architect Associate SAA-C03 | AWS | Access; resilience; storage/cost | Charms |
| Microsoft SC-900 | Security | Identity; threat protection; compliance/data | Shields |
| Google Cloud Digital Leader | AWS/cloud | Transformation; data/AI; operations | Charms |
| Terraform Associate 004 | AWS/cloud | Workflow; state; modules | Charms |
| RHCSA EX200, RHEL 10 | A+/hardware, Linux path | Permissions; services; storage | Armor |

The six courses now contain 47 branches, 47 worked chapters, 224 original questions, and 29 main-topic lab outlines. Each course retains three gear milestones. Its final challenge requires clearing all branches and concept checks. Lab notes and task checklists save locally; self-recorded completion does not grant mastery. Existing saves, exercise IDs, rewards, and unfinished sessions are retained.

The expanded courses cover selected skills from the vendor guides. Detailed coverage gaps remain, including hands-on Azure deployment and recovery, AWS architecture case breadth, Google Cloud AI product selection, and Linux boot recovery. Their group numbers and equal sampling are local teaching choices rather than official objective numbering or exam weighting. RHCSA is a performance-based exam: this game's questions cannot substitute for practicing tasks in a disposable RHEL environment. Cloud labs include paper alternatives; creating real resources may cost money. No cloud account is connected by the game.

Official guides are linked in each lesson and on its map. Questions and explanations are original, not copied exam questions. Source guides were checked November 7, 2026:

- [AZ-104](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104)
- [SAA-C03](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-associate-03.html)
- [SC-900](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-900)
- [Cloud Digital Leader](https://cloud.google.com/learn/certification/cloud-digital-leader)
- [Terraform Associate 004](https://developer.hashicorp.com/terraform/tutorials/certification-004/associate-review-004)
- [RHCSA](https://www.redhat.com/en/services/training/ex200-red-hat-certified-system-administrator-rhcsa-exam)

Regenerate in order:

```sh
python scripts/build-specialist-courses.py
python scripts/build-domain-labs.py
python scripts/compile-depth.py
npm test
```

The builder owns `content/specialist-*.json` and the two specialist browser data files. Keep the existing stable IDs when expanding. Tests cover course discovery, two-digit course IDs, progress reload, separate reward milestones, gated final challenges, question uniqueness, and all 68 main-topic lab outlines.
