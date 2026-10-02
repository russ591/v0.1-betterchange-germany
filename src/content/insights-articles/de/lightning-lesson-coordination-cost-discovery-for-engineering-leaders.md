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
excerpt: "Eine einfache Mapping-Übung macht aus „Koordination fühlt sich teuer an“ eine Zahl. In einem Beispiel sanken die Koordinationskosten von 38 auf 2, nachdem Teamgrenzen am Ergebnis ausgerichtet wurden."
featured: false
imageUrl: /insights/lightning-lesson-coordination-cost-discovery-for-engineering-leaders.webp
metaDescription: "Wie teamübergreifende Abhängigkeiten sichtbar werden, ihre Koordinationskosten bewertet und Teamgrenzen am Ergebnis ausgerichtet werden, mit Praxisbeispiel und Einschränkungen."
sourceId: '19684'
sourceUrl: https://www.betterchange-consulting.com/product-owner/lightning-lesson-coordination-cost-discovery-for-engineering-leaders/
bodyHtml: |-
  <p><strong>Wird die Lieferung immer wieder blockiert oder gebremst, ohne dass der Grund klar ist?</strong> In dieser Lightning Lesson stellten Giuseppe De Simone und Simon Sablowski ein einfaches, kollaboratives Werkzeug vor, mit dem Abhängigkeiten zwischen Teams sichtbar werden und ein gemeinsames Verständnis der damit verbundenen Koordinationskosten entsteht. Als Beispiel wurde ein Feature-Wunsch über fünf Teams hinweg abgebildet, um zu zeigen, woher Koordinationskosten kommen und was sich ändert, wenn Teamgrenzen am Ergebnis statt an technischen Schichten oder Domänen ausgerichtet werden.</p>
  <p>Die Aufzeichnung zeigt, wie sich Folgendes umsetzen lässt:</p>
  <ul>
  <li><strong>Grenzen erkennen, die Koordinationskosten verursachen.</strong> Es wird sichtbar, wo Teamgrenzen in der aktuellen Struktur unnötige Übergaben, Verzögerungen und Overhead erzeugen.</li>
  <li><strong>Teamübergreifende Abhängigkeiten sichtbar machen.</strong> Versteckte Abhängigkeiten werden aufgedeckt, bevor sie als Blocker im Lieferfluss auftauchen.</li>
  <li><strong>Das passende Koordinationsmuster wählen.</strong> Es wird bewertet, welche Muster zum tatsächlichen Kontext passen und welche still und leise alles verlangsamen.</li>
  </ul>
  <p><a href="https://maven.com/p/35ac5e/coordination-cost-discovery-for-engineering-leaders?utm_campaign=OTMzNTQw&amp;utm_medium=ll_share_link&amp;utm_source=instructor">Zur Aufzeichnung (englisch)</a></p>
  <h2>Die wichtigsten Erkenntnisse</h2>
  <h3>1. Vier Fragen, bevor das Organigramm angefasst wird</h3>
  <p>Vor jeder organisatorischen Neugestaltung skizzierte Giuseppe vier strategische Entscheidungen, die alles Weitere prägen. Es sind keine Frameworks, sondern Fragen, bei denen sich ein längeres Nachdenken lohnt:</p>
  <ul>
  <li><strong>Was ist „unser Produkt“?</strong> Eine Bank kann Internetbanking als ein Produkt betrachten oder bis hinunter zu getrennten Kreditkarten-Apps für iOS und Android aufteilen. Breitere Definitionen bedeuten weniger, aber komplexere Teams mit einem ganzheitlicheren Blick auf Prioritäten; engere Definitionen sind einfacher zu führen, bergen aber das Risiko der Suboptimierung.</li>
  <li><strong>Komponententeams oder Feature-Teams?</strong> Wer nach technischer Schicht aufteilt (Frontend, Backend, Hardware), setzt die kompetentesten Menschen auf jeden Teil. Kund:innen formulieren ihre Anforderungen jedoch nicht höflich innerhalb einer Schicht, sodass Abhängigkeiten systembedingt entstehen. Feature-Teams vermeiden das, erfordern aber Investitionen in breitere Kompetenz im Team.</li>
  <li><strong>Effizienz oder Effektivität?</strong> Eine Aufteilung nach Fähigkeiten optimiert die Effizienz; interdisziplinäre Teams mit Ende-zu-Ende-Verantwortung optimieren die Effektivität.</li>
  <li><strong>Ein Product Owner pro Team oder pro Produkt?</strong> Pro Team ist im Alltag einfacher, doch je mehr Product Owner es gibt, desto mehr Zeit geht für die Abstimmung der Backlogs untereinander drauf.</li>
  </ul>
  <p>Keine dieser Entscheidungen ist kostenlos: Jede bringt Trade-offs mit sich, die in Kauf genommen und nicht vermieden werden.</p>
  <h3>2. Koordinationskosten sichtbar machen: Häufigkeit × Risiko = Kosten</h3>
  <p>Simon stellte eine einfache Übung zur Abbildung von Abhängigkeiten vor, die aus „Koordination fühlt sich teuer an“ eine konkrete Zahl macht. Ein realistisches Feature wird über alle betroffenen Teams hinweg nachverfolgt, und jede Abhängigkeit wird auf zwei Achsen von 1 bis 3 bewertet: <strong>Häufigkeit</strong> (wie oft die Teams interagieren müssen) und <strong>Risiko</strong> (wie viel schiefgehen kann). Das Produkt ergibt die Kosten pro Abhängigkeit. Abhängigkeiten gibt es in drei Varianten: technisch, Freigaben und wissensbasiert (etwa wenn eine einzelne Entwickler:in als Einzige ein Legacy-System versteht).</p>
  <h3>3. Wie eine Neugestaltung entlang von Ergebnissen aussieht</h3>
  <p>Das Beispiel war ein Feature, mit dem Kund:innen einen wiederkehrenden Nutzungsbericht planen können (CSV oder PDF, per E-Mail, nur für zahlende Tarife), aus Kundensicht simpel. In einer typischen Komponentenstruktur (Web-Frontend, Authentifizierung und Berechtigungen, Abrechnung, Daten und Reporting, Benachrichtigungen) berührte es fünf Teams mit sieben Abhängigkeiten, bei <strong>Gesamtkosten der Koordination von 38</strong>. Und das in einer gut geführten Organisation, in der niemand faul oder langsam ist.</p>
  <p>Wurden Frontend, Daten und Reporting sowie Benachrichtigungen zu einem einzigen Team „Reporting und Insights“ zusammengelegt, sank die Zahl der Abhängigkeiten von sieben auf zwei. Diese zwei verbleibenden Abhängigkeiten wurden als veröffentlichte Self-Service-APIs formalisiert statt als spontane Slack-Threads und Pull-Request-Reviews, und die Gesamtkosten fielen von 38 auf <strong>2</strong>. Gleicher Umfang, gleiche Arbeit, nur deutlich weniger Reibung auf dem Weg durch das System.</p>
  <h3>4. Das Kleingedruckte: was die Zahlen nicht erfassen</h3>
  <p>In der Q&amp;A-Runde wurde das Modell produktiv hinterfragt, und die Einschränkungen sind ebenso wichtig wie das Werkzeug:</p>
  <ul>
  <li>Es ist eine bewusste Vereinfachung: Der Wert liegt im <em>Gespräch</em>, das die Bewertung auslöst, nicht in der Genauigkeit der Zahlen.</li>
  <li>Eine Neugestaltung allein an einem Feature auszurichten ist ein Fehler. Das Mapping sollte über vier oder fünf Features laufen, um die Struktur zu finden, die in den meisten Fällen funktioniert (eine „80-%-Lösung“, keine perfekte).</li>
  <li>Das Verschieben von Menschen und das Zusammenlegen von Teams hat soziale und verhaltensbezogene Folgen, die das Modell überhaupt nicht abbildet.</li>
  <li>Es ist ein Werkzeug, um fundierte Wetten zu platzieren, nicht um Experimente zu vermeiden: Was tatsächlich passiert, zeigt sich erst nach der Änderung.</li>
  <li>Unachtsam eingesetzt, kann es zur Ausrede für ständige Reorganisation werden, die ihrerseits echte Kosten verursacht.</li>
  </ul>
  <h2>Warum das wichtig ist</h2>
  <p>Koordinationskosten sind fast immer verborgen: Sie leben als Frust in den Köpfen, nicht als Zahl an der Wand. Da KI das Tempo einzelner Menschen und Teams weiter erhöht, führt ein Operating Model mit veralteten Grenzen nur dazu, dass dieselben versteckten Abhängigkeiten früher getroffen werden. Sie sichtbar zu machen, selbst mit einer groben, unvollkommenen Bewertung, verwandelt ein diffuses Gefühl von Reibung in etwas, das ein Team besprechen, priorisieren und angehen kann.</p>
  <p><strong>Mehr erfahren?</strong> Giuseppe und Simon pilotieren im November einen vollständigen Kurs, <a href="https://maven.com/simon-sablowski/coordination-collaboration-bottleneck-ai">Leading Coordination and Collaboration in AI-Accelerated Organisations</a>, denn schnellere Teams brauchen Grenzen, die für das Tempo ausgelegt sind, zu dem sie inzwischen fähig sind. Wer Teil der ersten Kohorte sein oder mit Feedback mitgestalten möchte, kann sich gern melden.</p>
  <h2>Über die Vortragenden</h2>
  <p><strong><a href="https://www.linkedin.com/in/giuseppedesimone/">Giuseppe De Simone</a></strong> ist Certified Trainer und Organisationscoach mit über 25 Jahren Erfahrung in Produktentwicklung und Transformationen im Enterprise-Maßstab. Er hat Führungskräfte in Organisationen gecoacht und trainiert, in denen die Lücke zwischen individueller Leistung und Lieferdurchsatz keine Theorie, sondern täglicher Alltag ist. Immer wieder sieht er dasselbe Muster: KI-Werkzeuge beschleunigen die individuelle Leistung, doch das Operating Model war nie für dieses Tempo ausgelegt, mit mehr statt weniger Reibung als Folge. Seine Arbeit konzentriert sich auf die Ebene, die die meisten überspringen: wie Entscheidungen fließen, wie Abstimmung zerbricht und wie Teams unter Druck koordinieren. Er ist Gründer und CEO seines Beratungs- und Trainingsunternehmens und Fellow Coach bei Better Change.</p>
  <p><strong><a href="https://www.linkedin.com/in/simonsablowski/">Simon Sablowski</a></strong> ist Berater für Koordination und Organisationsdesign und unterstützt Unternehmen dabei, die Ebene zwischen Menschen und Lieferung neu zu gestalten: die Strukturen, Grenzen und Muster, die bestimmen, wie schnell Entscheidungen fallen, wie Abhängigkeiten gesteuert werden und wie Teams in der Praxis tatsächlich koordinieren. Er arbeitet mit engineering-getriebenen Organisationen, die die Lücke zwischen individueller Leistung und Lieferdurchsatz überbrücken wollen, und konzentriert sich auf die strukturellen Ursachen, die die meisten Interventionen auslassen: wo Teamgrenzen verlaufen, wie Abhängigkeiten sichtbar werden und welche Koordinationsmuster zur tatsächlichen Arbeit passen, nicht nur zum Organigramm.</p>
---
