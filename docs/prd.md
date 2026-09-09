# Product requirements document
## Campus drone-as-first-responder (DFR) system

**Status:** Draft v0.1
**Date:** September 2026
**Owner:** TBD

---

## 1. Problem

When a critical incident occurs on a university campus, the interval between the first alarm and the first responder having eyes on the scene is typically eight to fifteen minutes. Decisions made in that window — where to stage, which building, which entrance, whether to evacuate or shelter — are made with almost no information.

Campus safety departments have cameras, but cameras are fixed, mostly indoors, and nobody is watching most of them. They have officers, but officers are on foot or in vehicles and arrive after the window has closed.

This product closes the gap between alarm and situational awareness for outdoor campus environments.

## 2. What this product is not

These constraints are load-bearing. They are the difference between a defensible product and a liability.

- **It does not detect threats.** The system performs no automated identification of weapons, persons, or threatening behavior. Detection of small objects from an aerial platform is unreliable, and the base rate of true events is so low that any continuous classifier produces alerts that are overwhelmingly false. A false positive here dispatches armed officers toward a student.
- **It does not run facial recognition** or any biometric identification, ever, as a product policy rather than a configuration default.
- **It does not patrol.** The aircraft does not fly on a schedule or loiter over campus absent a triggering event. Persistent aerial surveillance of a campus population is a governance and community-relations failure mode regardless of its technical merits.
- **It is not armed and carries no payload capable of applying force.**
- **It does not operate indoors.** Indoor coverage is a separate platform with different economics and is out of scope for v1.

The system launches in response to a human- or sensor-generated alarm, flies to a location, and puts live video in front of humans who make every decision.

## 3. Users

| User | Need |
|---|---|
| Dispatcher / communications operator | Launch the aircraft with one action while still on the phone; see video without leaving the CAD console |
| Responding officer | Current picture on a phone or MDT while en route; know the building, the door, and who is outside it |
| Incident commander | Overhead view for staging, perimeter, and evacuation routing |
| Campus safety director | Program uptime, audit trail, defensible policy |
| General counsel / privacy officer | Retention controls, access logs, evidence chain |
| Students, faculty, staff | Legible intent; confidence the system is not routine surveillance |

The last row is a real stakeholder, not a courtesy. Community objection ends more of these programs than regulation or technical failure.

## 4. Core use cases

1. **Alarm response.** Dispatch receives a call or sensor trigger. Aircraft launches from the nearest dock, arrives overhead, streams to dispatch and to responding units.
2. **Response cancellation.** Aircraft arrives, shows nothing is happening, ground response is stood down. This is expected to be the highest-volume outcome and is a primary value driver, not a failure case.
3. **Perimeter and staging support.** During a confirmed incident, the aircraft provides building exterior, entrance status, exit flow, and safe approach routing.
4. **Evacuation and reunification support.** Post-incident crowd movement, assembly point monitoring.
5. **Search.** Missing person, medical call in an outdoor area, weather event damage assessment.

## 5. System components

**Aircraft.** Group 1 multirotor, camera-first configuration.

**Dock.** Rooftop enclosure providing shelter, charging, and autonomous launch/recovery. Multiple docks provide campus coverage.

**Ground software.** Launch console, live video, map, recording, audit log, role-based access.

**Integrations.** Trigger sources and downstream notification.

---

## 6. Aircraft requirements

| ID | Requirement | Priority |
|---|---|---|
| AC-01 | Multirotor configuration; hover-capable with stable sensor line of sight over a fixed point | P0 |
| AC-02 | Maximum takeoff weight under 55 lb; target 2.0 kg all-up | P0 |
| AC-03 | Approx. 400 mm motor-to-motor diagonal; folding arms for dock stowage | P0 |
| AC-04 | Minimum 30 min endurance with full payload at 15 kt wind; target 35 min | P0 |
| AC-05 | EO camera with minimum 10x optical zoom; target 30x. Must resolve a scene from 300 ft AGL without descending | P0 |
| AC-06 | Uncooled LWIR thermal imager, minimum 640x512, coupled to the same gimbal | P0 |
| AC-07 | 3-axis stabilized gimbal; sensor payload drives airframe sizing, not the reverse | P0 |
| AC-08 | Omnidirectional obstacle avoidance sufficient for autonomous flight in a treed, built environment | P0 |
| AC-09 | Autonomous return-to-dock on link loss, low battery, or GPS degradation | P0 |
| AC-10 | ADS-B In with traffic display to the operator | P0 |
| AC-11 | FAA Remote ID compliant | P0 |
| AC-12 | Operation from -10°C to 45°C; sustained flight in 20 kt wind, gusts to 25 kt; light precipitation | P0 |
| AC-13 | Two-way audio: speaker audible at 200 ft AGL for warnings and deconfliction | P1 |
| AC-14 | Spotlight for night operations | P1 |
| AC-15 | Noise: target under 65 dBA at 200 ft AGL. Larger, slower propellers preferred over efficiency | P1 |
| AC-16 | Visual design reads as camera equipment, not military hardware. Light-colored shell, visible gimbal, campus livery, prominent anti-collision lighting | P1 |
| AC-17 | Propeller guards, or a rotor configuration meeting Part 107 Category 2/3 operations-over-people criteria | P1 |
| AC-18 | Bill of materials free of components from covered foreign entities per Section 1709 of the FY25 NDAA and the FCC Covered List | P0 |
| AC-19 | Field-replaceable propellers, batteries, and gimbal without return to depot | P2 |

**Explicitly excluded:** facial recognition, automated weapon detection, automated person classification, any kinetic or non-kinetic effector.

## 7. Dock requirements

The dock is more than half the product. Program success is determined by dock uptime, not aircraft capability.

| ID | Requirement | Priority |
|---|---|---|
| DK-01 | Rooftop mountable; wind survival to 90 mph closed | P0 |
| DK-02 | Autonomous open, launch, recover, close, and charge with no human present | P0 |
| DK-03 | Precision landing accuracy within 10 cm in 15 kt wind | P0 |
| DK-04 | Thermal management: internal environment maintained for battery health and cold-start capability across the full outdoor temperature range | P0 |
| DK-05 | Charge to 80% within 35 min; support back-to-back sorties | P0 |
| DK-06 | Lid mechanism rated for 10,000 cycles; ice and debris shedding | P0 |
| DK-07 | Continuous self-test with proactive alerting on any condition that would prevent launch | P0 |
| DK-08 | Wired power and network; battery backup for a minimum of 2 launches during utility outage | P0 |
| DK-09 | Remote diagnostics and OTA update | P1 |
| DK-10 | Dock siting tool: coverage modeling for a given campus footprint | P1 |

**Coverage target:** Any point on the covered campus reachable within 90 seconds of launch command. For a typical dock this implies roughly a 0.5 mile effective radius, subject to obstacle routing.

## 8. Communications

| ID | Requirement | Priority |
|---|---|---|
| CM-01 | Low-latency video link: glass-to-glass under 500 ms | P0 |
| CM-02 | Dual-path: mesh radio plus bonded cellular with automatic failover; neither path a single point of failure | P0 |
| CM-03 | Antenna placement isolated from the imaging payload to avoid interference; carbon-fiber shadowing accounted for in the design | P0 |
| CM-04 | Encrypted command and control and video in transit | P0 |
| CM-05 | Graceful degradation: reduced video bitrate before link drop; autonomous RTD on full loss | P0 |

Campus is favorable terrain for CM-02 — the customer controls the rooftops and cellular coverage is generally good.

## 9. Software requirements

| ID | Requirement | Priority |
|---|---|---|
| SW-01 | Single-action launch from the dispatch console with address or map-pin destination | P0 |
| SW-02 | Live video to dispatch, to mobile devices, and to incident command, with role-based access | P0 |
| SW-03 | Map view: aircraft position, camera footprint, campus building layer | P0 |
| SW-04 | Automatic recording of all flights with tamper-evident storage and defensible chain of custody | P0 |
| SW-05 | Complete audit log: who launched, why, who viewed, when, what was retained | P0 |
| SW-06 | Configurable retention policy with automatic deletion; default retention 30 days for non-incident flights | P0 |
| SW-07 | Geofencing: hard exclusion zones (residence hall windows, medical facilities, adjacent private property) enforced in flight software | P0 |
| SW-08 | Manual pilot override at any point in any automated sequence | P0 |
| SW-09 | Public transparency portal: flight count, launch reasons, average duration, no video | P1 |
| SW-10 | Post-incident export package for investigators | P1 |

## 10. Integrations

| ID | Source | Priority |
|---|---|---|
| IN-01 | CAD / 911 dispatch systems (Central Square, Tyler, Motorola) — trigger and location | P0 |
| IN-02 | Blue-light and mobile panic buttons | P0 |
| IN-03 | Acoustic gunshot detection sensors | P1 |
| IN-04 | Access control and door alarm systems | P1 |
| IN-05 | Mass notification systems — outbound, situational updates only | P1 |
| IN-06 | Fixed camera VMS — operator context, not automated triggering | P2 |

**Design rule:** every trigger produces a *recommendation to launch* presented to a human, not an automatic launch, until an agency has run the system long enough to establish its own false-alarm baseline. Auto-launch is a per-trigger-type configuration an agency opts into deliberately.

## 11. Regulatory requirements

| ID | Requirement | Priority |
|---|---|---|
| RG-01 | Operate lawfully under Part 107 with BVLOS waiver; system design must support the waiver evidence package | P0 |
| RG-02 | Operations over people: qualify under Part 107 Subpart D Category 2 or 3 | P0 |
| RG-03 | Night operations compliant (anti-collision lighting, training) | P0 |
| RG-04 | Remote ID compliance | P0 |
| RG-05 | Architecture forward-compatible with Part 108 as finalized, including anticipated Operations Supervisor and Flight Coordinator roles | P1 |
| RG-06 | NDAA compliance; supportability for state approved-drone lists (e.g. Florida) | P0 |
| RG-07 | Pathway to Blue UAS Cleared List via the Recognized Assessor route (AUVSI Green UAS as the queue position) | P2 |

**Standing risk.** As of late August 2026, Part 108 remains a notice of proposed rulemaking. No operator can claim Part 108 authority; BVLOS still runs through Part 107 waivers. Both the statutory deadline of 16 January 2026 and the Executive Order 14307 deadline of 1 February 2026 passed unmet, and the FAA reopened comments on detect-and-avoid and electronic conspicuity in January 2026. The proposed rule may require existing waiver-based DFR programs to re-qualify under the new framework, and may not accommodate non-governmental responders. **This determines addressable market:** public institutions with sworn police departments are viable customers; private campus security offices without sworn authority likely are not.

## 12. Privacy and governance

Not a compliance appendix. This is the deployment blocker.

| ID | Requirement | Priority |
|---|---|---|
| PV-01 | No facial recognition or biometric identification, as product policy | P0 |
| PV-02 | No patrol or persistent surveillance mode; flight requires a triggering event | P0 |
| PV-03 | Geofenced no-fly and no-record zones around residential windows and medical facilities | P0 |
| PV-04 | Default deletion of non-incident footage on a short clock | P0 |
| PV-05 | Published use policy template for customer adoption before deployment | P0 |
| PV-06 | Public flight log / transparency reporting | P1 |
| PV-07 | Guidance package for community engagement prior to first flight | P1 |
| PV-08 | Compliance analysis for state surveillance and biometric statutes (Illinois BIPA and equivalents) | P0 |

## 13. Success metrics

| Metric | Target |
|---|---|
| Time from launch command to overhead | Under 90 s within coverage area |
| Dock launch success rate | 99.5% of commanded launches |
| Dock availability | 99.5% monthly |
| Video link availability during flight | 99% of flight seconds |
| Ground response cancelled after aerial assessment | Tracked, reported; expected material share of launches |
| Unplanned aircraft loss | Under 1 per 5,000 flight hours |
| Community complaints per 100 flights | Tracked as a primary program health metric |

## 14. Known limitations to state plainly in every sales conversation

Campus active-shooter events are overwhelmingly indoor. This system provides perimeter, approach routing, building entrances, exit flow, and staging picture. It does not provide interior visibility.

The defensible claim is: **time to outdoor situational awareness reduced from roughly twelve minutes to ninety seconds.** Any broader claim invites the regulatory and litigation exposure that has already reached other vendors in the weapons-detection space, and a customer who discovers the limitation after purchase will feel misled.

## 15. Phasing

**Phase 1 — Feasibility.** Sensor selection, dock reliability prototype, one design-partner campus with a sworn police department. Manual launch only. Objective: waiver granted, 500 flights, dock uptime data.

**Phase 2 — Product.** CAD integration, multi-dock coverage, transparency portal, published use policy. Three to five campuses.

**Phase 3 — Scale.** Additional trigger integrations, opt-in auto-launch per trigger type, Part 108 conformance as the rule finalizes.

## 16. Open questions

1. Build the aircraft or license/integrate an existing Blue-listed platform and differentiate on dock and software?
2. Does the campus product carry a separate brand and legal entity from any defense line? (Recommended: yes.)
3. Sale model — capital purchase, or drone-as-a-service with the vendor holding the Part 107 certificate and providing remote pilots?
4. Who holds the FAA waiver: customer agency or vendor?
5. Insurance and indemnification posture for a system that will, at some point, be operating during an event where someone is harmed.
6. Indoor platform: partner, acquire, or defer?
