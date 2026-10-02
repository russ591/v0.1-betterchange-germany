---
title: "Lightning Lesson: Coordination Cost Discovery for Engineering Leaders"
contentType: Blog
primaryCategory: Leadership
categories:
  - Leadership
  - Change Management
  - Webinar
date: '2026-09-23T00:00:00Z'
readTimeMinutes: 5
author: giuseppe-de-simone
excerpt: A simple mapping exercise turns "coordination feels expensive" into a number. In one example, redesigning team boundaries around the outcome cut the cost from 38 to 2.
featured: false
imageUrl: /insights/lightning-lesson-coordination-cost-discovery-for-engineering-leaders.webp
metaDescription: How to make cross-team dependencies visible, score their coordination cost, and redesign team boundaries around outcomes, with a worked example and its caveats.
sourceId: '19684'
sourceUrl: https://www.betterchange-consulting.com/product-owner/lightning-lesson-coordination-cost-discovery-for-engineering-leaders/
bodyHtml: |-
  <p><strong>Is delivery keeping getting blocked or slowed down, with no clear reason why?</strong> In this lightning lesson, Giuseppe De Simone and Simon Sablowski presented a simple collaborative tool to visualise inter-team dependencies and build a shared understanding of the coordination cost attached to them. As an example, they mapped one feature request across five teams to show where coordination cost comes from, and what changes when team boundaries are redesigned around the outcome instead of technical layers or domains.</p>
  <p>The recording covers how to:</p>
  <ul>
  <li><strong>Spot boundaries that create coordination cost.</strong> See where team boundaries generate unnecessary handoffs, delays and overhead in the current structure.</li>
  <li><strong>Make cross-team dependencies visible.</strong> Surface hidden dependencies before they show up as blockers in the delivery flow.</li>
  <li><strong>Choose the right coordination pattern.</strong> Evaluate which patterns fit the actual context, and which ones are quietly making things slower.</li>
  </ul>
  <p><a href="https://maven.com/p/35ac5e/coordination-cost-discovery-for-engineering-leaders?utm_campaign=OTMzNTQw&amp;utm_medium=ll_share_link&amp;utm_source=instructor">Watch the recording here</a></p>
  <h2>Key takeaways</h2>
  <h3>1. Four questions to ask before touching the org chart</h3>
  <p>Before any organisational redesign, Giuseppe laid out four strategic decisions that shape everything downstream. They are not frameworks, just questions worth sitting with:</p>
  <ul>
  <li><strong>What is "our product"?</strong> A bank could call internet banking one product, or split it all the way down to iOS and Android credit card apps. Broader definitions mean fewer, more complex teams with a more holistic view of priorities, while narrower definitions are simpler to run but risk sub-optimisation.</li>
  <li><strong>Component teams or feature teams?</strong> Splitting by technical layer (frontend, backend, hardware) puts the most competent people on each part, but customers do not submit requirements that politely stay inside one layer, so dependencies are built in by design. Feature teams avoid this, but require investing in broader competence across the team.</li>
  <li><strong>Efficiency or effectiveness?</strong> Splitting by skill optimises for efficiency; cross-disciplinary teams with end-to-end ownership optimise for effectiveness.</li>
  <li><strong>One Product Owner per team, or per product?</strong> Per team is simpler day to day, but the more Product Owners there are, the more time each one spends coordinating backlogs with the others.</li>
  </ul>
  <p>None of these choices is free: each comes with trade-offs that are signed up for, not avoided.</p>
  <h3>2. Making coordination cost visible: frequency × risk = cost</h3>
  <p>Simon introduced a simple dependency-mapping exercise to turn "coordination feels expensive" into an actual number. Take one realistic feature, trace it across every team it touches, and score each dependency on two axes from 1 to 3: <strong>frequency</strong> (how often the teams need to interact) and <strong>risk</strong> (how much could go wrong). Multiplying the two gives a cost per dependency. Dependencies come in three flavours: technical, approval, and knowledge-based (for example, one engineer being the only person who understands a legacy system).</p>
  <h3>3. What redesigning around outcomes looks like</h3>
  <p>The example was a feature that lets customers schedule a recurring usage report (CSV or PDF, emailed, limited to paying plans), simple from the customer's side. Mapped across a typical component structure (web frontend, auth and permissions, billing, data and reporting, notifications), it touched five teams with seven dependencies, for a <strong>total coordination cost of 38</strong>. And this applies to a well-run organisation, with no one being lazy or slow.</p>
  <p>Merging frontend, data and reporting, and notifications into a single "Reporting and Insights" team cut the dependency count from seven to two. Those two remaining dependencies were formalised as published, self-serve APIs instead of ad hoc Slack threads and pull-request reviews, dropping the total cost from 38 to <strong>2</strong>. Same scope, same work, just far less friction moving it through the system.</p>
  <h3>4. The fine print: what the numbers do not capture</h3>
  <p>The Q&amp;A pushed back productively on the model, and the caveats matter as much as the tool:</p>
  <ul>
  <li>It is a deliberate simplification: the value is in the <em>conversation</em> the scoring provokes, not the precision of the numbers themselves.</li>
  <li>Redesigning around a single feature is a mistake. Run the mapping across four or five features and look for the structure that works in most cases (an "80% solution", not a perfect one).</li>
  <li>Moving people and merging teams has social and behavioural consequences that the model does not touch at all.</li>
  <li>It is a tool for placing informed bets, not for avoiding experimentation: what actually happens is only learned once the change is made.</li>
  <li>Used carelessly, it can become an excuse for constant reorganisation, which has its own real cost.</li>
  </ul>
  <h2>Why this matters</h2>
  <p>Coordination cost is almost always hidden: it lives in people's heads as frustration, not as a number on a wall. As AI keeps raising how fast individuals and teams can produce, an operating model built around outdated boundaries just means hitting the same hidden dependencies sooner. Making them visible, even with a rough, imperfect score, turns a vague sense of friction into something a team can discuss, prioritise and act on.</p>
  <p><strong>Want to go deeper?</strong> Giuseppe and Simon are piloting a full course this November, <a href="https://maven.com/simon-sablowski/coordination-collaboration-bottleneck-ai">Leading Coordination and Collaboration in AI-Accelerated Organisations</a>, because faster teams need boundaries designed for the speed they are now capable of. Reach out to be part of the first cohort or to help shape it with feedback.</p>
  <h2>About the presenters</h2>
  <p><strong><a href="https://www.linkedin.com/in/giuseppedesimone/">Giuseppe De Simone</a></strong> is a Certified Trainer and organisational coach with 25+ years in product development and transformations at enterprise scale. He has coached and trained leaders at organisations where the gap between individual performance and delivery throughput is not theoretical but the daily reality. He keeps seeing the same pattern: AI tools accelerate individual output, but the operating model was never designed for that speed, so the result is more friction, not less. His work focuses on the layer most skip: how decisions flow, how alignment breaks down, and how teams coordinate under pressure. He is the founder and CEO of his consulting and training business and a Fellow Coach at Better Change.</p>
  <p><strong><a href="https://www.linkedin.com/in/simonsablowski/">Simon Sablowski</a></strong> is a coordination and organisational design consultant who helps companies redesign the layer between their people and their delivery: the structures, boundaries and patterns that determine how fast decisions move, how dependencies are managed, and how teams actually coordinate in practice. He works with engineering-led organisations navigating the gap between individual performance and delivery throughput, focusing on the structural root causes most interventions skip: where team boundaries are drawn, how dependencies are made visible, and which coordination patterns fit the actual work, not just the org chart.</p>
---
