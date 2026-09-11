---
# Reviewed German copy from betterchange-de-insights-batch-05.md
# (lighter-touch spot-check review, not full Fellow line-by-line --
# agreed approach for Insights). Title kept in English per the
# established convention (the draft offered a suggested German title,
# not used); metaTitle omitted so it falls back to title, unprefixed.
# "Product Development" -> "Produktentwicklung" per the site-wide
# category-label rule's stated exception (EN source's actual category,
# not Agile as the draft header claimed).
#
# FLAGGED FOR RUSS: the batch-05 draft's header attributes this article
# to Nino Zeljko, but the EN source has author: niels-verdonk. Used the
# EN source's actual author -- part of a pattern of author mismatches
# in this batch's draft headers, worth checking upstream.
title: Why Developers Build the Wrong Thing, and How User Stories Help
contentType: Blog
primaryCategory: Produktentwicklung
categories:
  - Produktentwicklung
date: '2023-12-19T00:00:00Z'
readTimeMinutes: 3
author: niels-verdonk
excerpt: "Eine WhatsApp-Nachricht, die zählt, wie lange schon gewartet wurde, statt wie lange noch zu warten ist. Ein kleines, aufschlussreiches Beispiel dafür, was passiert, wenn Entwickler:innen genau das bauen, was spezifiziert wurde, und die Spezifikation verfehlte, was tatsächlich gebraucht wurde."
featured: false
imageUrl: https://www.betterchange-consulting.com/wp-content/uploads/2023/12/Service.jpg
metaDescription: "Eine WhatsApp-Nachricht, die zählt, wie lange schon gewartet wurde, statt wie lange noch zu warten ist. Ein kleines, aufschlussreiches Beispiel dafür, was passiert, wenn Entwickler:innen genau das bauen, was spezifiziert wurde, und die Spezifikation verfehlte, was tatsächlich gebraucht wurde."
bodyHtml: |-
  <p>Ein Kunde kontaktiert den Support per WhatsApp. Während er darauf wartet, mit einem Menschen verbunden zu werden, erhält er eine Reihe von Nachrichten mit Updates zu seiner Wartezeit. Die Nachrichten lauten: "Sie warten seit 1 Minute." Dann "Sie warten seit 2 Minuten." Dann "Sie warten seit 3 Minuten."</p>

  <p>Der Text sagt "Wartezeit", was impliziert, wie lange noch gewartet werden muss. Der Entwickler hat es als die bereits verstrichene Zeit umgesetzt. Das Ergebnis: Der Kunde erwartet, gleich bedient zu werden, und erhält stattdessen einen laufenden Zähler seiner Frustration. Nicht ideal.</p>

  <p>Das ist keine Geschichte über einen unachtsamen Entwickler. Es ist eine Geschichte darüber, was passiert, wenn Anforderungen spezifiziert werden, ohne ein echtes gemeinsames Verständnis davon, was der Nutzer tatsächlich braucht.</p>

  <h2>Woher User Stories kommen</h2>

  <p>User Stories haben einen interessanten Ursprung. Kent Beck, der Begründer von Extreme Programming, wurde von einem Nutzer angesprochen, der von einer neuen Funktion so begeistert war, dass die Idee entstand: Was, wenn statt zu spezifizieren, was gebaut werden soll, zunächst artikuliert würde, welche Reaktion beim Nutzer erhofft wird, wenn er sie erhält?</p>

  <p>Ron Jeffries entwickelte dann die Vorlage, die die meisten Teams heute kennen: <em>Als [Art von Nutzer:in] möchte ich [eine Funktion], damit [ein Wert entsteht]</em>. Die Vorlage ist nicht der Punkt. Die drei C's, die Jeffries ebenfalls einführte, sind der Punkt: Card, Conversation und Confirmation.</p>

  <p>Die Card ist eine kurze Beschreibung, ein Platzhalter für ein Gespräch, keine vollständige Spezifikation. Die Conversation ist die Diskussion zwischen Entwickler:innen, der Product-Owner-Person und idealerweise echten Nutzenden darüber, was die Story bedeutet, was der Nutzer tatsächlich erreichen möchte, und welche Randfälle wichtig sind. Die Confirmation sind die Akzeptanzkriterien, die geteilte Vereinbarung darüber, wie "fertig" aussieht.</p>

  <h2>Wie die meisten Teams sie falsch nutzen</h2>

  <p>Der Fehler ist, User Stories als Anforderungsformat statt als Gesprächskatalysator zu behandeln. Das erzeugt Stories wie:</p>

  <p><em>Als Entwickler möchte ich eine Datenbank, damit ich Daten speichern kann.</em></p>

  <p>Oder ganze Jira-Tickets mit hunderten Wörtern angehängter Spezifikation, was einfach ein Anforderungsdokument in anderer Verpackung ist.</p>

  <p>Das sind keine User Stories. Sie haben keinen Nutzer. Sie spezifizieren, was gebaut werden soll, ohne zu erklären, warum es wichtig ist oder wie die Nutzererfahrung aussehen sollte. Sie schließen das Gespräch, statt es zu öffnen.</p>

  <p>Das Wartezeit-Beispiel veranschaulicht perfekt, was das erzeugt. Jemand hat spezifiziert, dass es eine "Wartezeit"-Nachricht geben soll. Niemand hat das Gespräch darüber geführt, was "Wartezeit" für den wartenden Nutzer bedeutet, nämlich wie lange er noch warten muss, nicht wie lange er schon gewartet hat. Der Entwickler hat genau das gebaut, was spezifiziert wurde. Die Spezifikation war falsch.</p>

  <h2>Bessere User Stories schreiben</h2>

  <p>Das Format, <em>Als, möchte ich, damit</em>, ist ein Gerüst, keine Garantie. Was eine User Story nützlich macht, ist die Klarheit ihrer drei Komponenten.</p>

  <p>Der Nutzer sollte eine reale Person oder Persona sein, deren Bedürfnisse das Team versteht. "Als Nutzer" ist fast nie spezifisch genug. "Als Kunde, der auf Support wartet und entscheiden muss, ob er in der Warteschleife bleibt oder später zurückruft" ist spezifisch genug, um ein nützliches Gespräch zu erzeugen.</p>

  <p>Die Funktion sollte Absicht beschreiben, nicht Umsetzung. "Ich möchte wissen, ob sich mein Warten lohnt" ist nützlicher als "Ich möchte eine Nachricht mit der Wartezeit", weil es die Frage öffnet, welche Information das eigentliche Bedürfnis des Nutzers tatsächlich beantworten würde.</p>

  <p>Der Wert erklärt das Warum. Das ist der Teil, der am häufigsten weggelassen wird, und oft der wichtigste: Es ist der Test, an dem die Umsetzung letztlich gemessen wird.</p>

  <p>Das Gespräch rund um eine gut konstruierte User Story ist, wo die eigentliche Spezifikationsarbeit geschieht. Die Card ist nur eine Möglichkeit, es zu beginnen.</p>
---
