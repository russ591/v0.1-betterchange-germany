# Registration confirmation email: German version

Source: registration-email-translation-brief.md (from Claude Code)
Use this version when the booking comes from a German page (/de/...). The English version stays as it is for English pages.

## Rules
- Form of address: **Sie**, used consistently throughout. First name only in the opening line.
- All `{placeholders}` are unchanged. Do not translate or rename them.
- Course names (`{course}`) stay in English, as on the site.
- No em dashes (house style).
- Dates in `{sessionDate}` and amounts in `{total}`, `{price}`, `{discount}` should use German formatting when the email is German, if the code already has a locale-aware formatter (e.g. "Mi., 4. Nov. 2026" and "€1.890"). If not, leave formatting as it is and flag it.

## Subject
```
Anmeldung bestätigt: {course}
```

## Body (standard: invoice attached, no discount)
```
Ihre Anmeldung ist bestätigt, {firstName}.

Vielen Dank für Ihre Buchung von {course}. Hier finden Sie eine Übersicht Ihrer Anmeldung.

Übersicht der Anmeldung
Kurs: {course}
Termin: {sessionDate}. {location}
Gebucht von: {name} ({email})
Unternehmen: {company}
Adresse: {address}, {postcode} {city}, {country}
Plätze: {seats}
Gesamt zzgl. MwSt.: {total}

In Google Kalender eintragen: {calendarUrl}

Teilnehmende:
- {attendeeName} ({attendeeEmail})

Wie geht es weiter?
- Ihre Rechnung finden Sie als PDF im Anhang dieser E-Mail.
- Rechtzeitig vor dem Kurstermin senden wir Ihnen alle organisatorischen Details (Einwahldaten bzw. Informationen zum Veranstaltungsort).
- Haben Sie in der Zwischenzeit Fragen? Antworten Sie einfach auf diese E-Mail.

Herzliche Grüße

Russell Hill
Zertifizierter Trainer und Coach
(FL Guide, AKT, CAL, CEC, CTC)
russ@betterchange-consulting.de
+49 151 1564 9226
```

## Variant: discount applied
Replace the single total line with:
```
Preis zzgl. MwSt.: {price}
Rabatt: -{discount}
Gesamt zzgl. MwSt.: {total}
```

## Variant: invoice not attached
Replace the first "Wie geht es weiter?" bullet with:
```
- Ihre Rechnung erhalten Sie separat per E-Mail.
```

## HTML-only strings
| English | German |
|---|---|
| Better Change Germany | Better Change Germany (unchanged) |
| Add to Google Calendar | In Google Kalender eintragen |

## Not translated
- Internal notification email to Russ: stays English.
- Waitlist notification: stays English.
