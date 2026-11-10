# CCNA and CySA+ starter expeditions

Released scope, reviewed November 7, 2026. These are playable initial expansions, not complete exam courses.

## Included

- CCNA 200-301 v1.1: six branches, six worked chapters, 48 original questions. Focused objective anchors: 1.6 (IPv4/subnetting), 2.2 (trunks), 3.2 (route decisions), 4.6 (DHCP relay), 5.6 (ACLs), 6.5 (REST). Related concepts are introduced without claiming full coverage of their objectives.
- CySA+ CS0-004: four branches, four worked chapters, 32 original questions. Focused objective anchors: 1.2 (activity analysis), 2.3 (prioritization), 3.2 (incident response), 4.2 (reporting). Related tools, evidence handling, and AI verification appear in scenarios.
- Each branch includes six recall/application/scenario questions plus two detailed concept checks, a worked example, a reasoning diagram, and a practical exercise with the existing saved notebook.
- New paths are accessible from their parent realms and course maps. Only the existing Safe troubleshooting foundation is required for challenges; the recommended previous certifications are not forced prerequisites.
- Three potion milestones for CCNA and three shield milestones for CySA+. These provide alternatives to the existing gear ladders, not additional stacking slots. Stronger items auto-equip; equal-power existing equipment remains selected.
- The final 48/32-question expedition assessments use the currently authored bank. They are not official exam simulations, independent holdout tests, or readiness guarantees.

## Still needed before full exam preparation

CCNA: remaining numbered objectives, IPv6 exercises, switching/MAC behavior, physical faults, wireless/controller configuration, LACP, spanning tree configuration, OSPF configuration and troubleshooting, NAT, NTP, SNMP/syslog/QoS, Layer 2 security, AAA, AI operations, and broader controller/automation work. Add additional independent cases and performance tasks for every objective.

CySA+: full coverage of scanning methods and tool output, architecture/hardening, threat intelligence and hunting, attack frameworks, AI operations/governance, automation, control/risk/application security, vulnerability reporting, and deeper evidence collection/response techniques. Add realistic synthetic logs, scan reports, multi-select cases, and performance tasks.

Keep stable topic and question IDs when expanding. Existing earned progress must remain valid. Starter completion should not automatically count as mastery of future chapters.

## Sources and version boundary

- Cisco v1.1 objectives: https://learningcontent.cisco.com/documents/marketing/exam-topics/200-301-CCNA-v1.1.pdf
- Cisco transition schedule: https://www.cisco.com/web/go/ccna/ (v1.1 ends February 2, 2027; v2.0 starts February 3, 2027).
- CySA+ CS0-004 objectives: https://lecbyo.files.cmp.optimizely.com/download/68b1eae88e5011f08868a275d699e612
- Incident response reference: https://csrc.nist.gov/pubs/sp/800/61/r3/final

Original explanations and synthetic practice scenarios; no commercial banks or actual exam questions copied.

## Rebuild and verify

1. Edit scripts/build-advanced-starters.py, then run python scripts/build-advanced-starters.py.
2. Run python scripts/compile-depth.py.
3. Run npm test. Tests exercise both complete starter paths, distinct rewards, legacy saves, assessment gates, question counts, resume, and combat compatibility.
4. Run docker compose up -d --build --wait. The host remains on port 8095.
