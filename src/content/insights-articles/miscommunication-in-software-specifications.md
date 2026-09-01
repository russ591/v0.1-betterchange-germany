---
title: Why Developers Build the Wrong Thing — and How User Stories Help
contentType: Blog
primaryCategory: Product Development
categories:
  - Product Development
date: '2023-12-19T00:00:00Z'
readTimeMinutes: 3
author: niels-verdonk
excerpt: A WhatsApp message that counts how long you have been waiting instead of how long you have left. A small, telling example of what happens when developers build exactly what was specified — and the specification missed what the user actually needed.
featured: false
metaTitle: Why Developers Build the Wrong Thing — and How User Stories Help | Bet
metaDescription: A WhatsApp message that counts how long you have been waiting instead of how long you have left. A small, telling example of what happens when...
bodyHtml: |-
  <p>A customer contacts support via WhatsApp. While waiting to be connected to a human, they receive a series of messages updating them on their wait time. The messages read: "You have been waiting 1 minute." Then "You have been waiting 2 minutes." Then "You have been waiting 3 minutes."</p>

  <p>The text says "waiting time" — implying how long you still have to wait. The developer implemented it as the time already elapsed. The result: the customer expects to be served imminently and instead receives a running count of their frustration. Not ideal.</p>

  <p>This is not a story about a careless developer. It is a story about what happens when requirements are specified without a genuine shared understanding of what the user actually needs.</p>

  <h2>Where User Stories came from</h2>

  <p>User Stories have an interesting origin. Kent Beck, the founder of Extreme Programming, was approached by a user who was so delighted by a new piece of functionality that the idea arose: what if, instead of specifying what to build, you first articulated what response you hoped to get from the user when they received it?</p>

  <p>Ron Jeffries then developed the template that most teams now recognise: <em>As a [type of user], I want [some function] so that [some value]</em>. The template is not the point. The three C's that Jeffries also introduced are the point: Card, Conversation, and Confirmation.</p>

  <p>The Card is a brief description — a placeholder for a conversation, not a complete specification. The Conversation is the discussion between developers, the Product Owner, and ideally actual users about what the story means, what the user is really trying to accomplish, and what edge cases matter. The Confirmation is the acceptance criteria — the shared agreement about what "done" looks like.</p>

  <h2>How most teams misuse them</h2>

  <p>The mistake is treating User Stories as a requirements format rather than a conversation catalyst. This produces stories like:</p>

  <p><em>As a Developer, I want a database so that I can store data.</em></p>

  <p>Or entire Jira tickets with hundreds of words of specification attached — which is just a requirements document in a different frame.</p>

  <p>These are not User Stories. They have no user. They specify what to build without explaining why it matters or what the user experience should be. They close off the conversation rather than opening it.</p>

  <p>The waiting-time example is a perfect illustration of what this produces. Someone specified that there should be a "waiting time" message. No one had the conversation about what "waiting time" means to the user waiting to be served — which is how long they still have to wait, not how long they have already been waiting. The developer built exactly what was specified. The specification was wrong.</p>

  <h2>Writing better User Stories</h2>

  <p>The format — <em>As a, I want, so that</em> — is a scaffold, not a guarantee. What makes a User Story useful is the clarity of its three components.</p>

  <p>The user should be a real person or persona whose needs the team understands. "As a user" is almost never specific enough. "As a customer waiting for support who needs to decide whether to stay on hold or call back later" is specific enough to generate a useful conversation.</p>

  <p>The function should describe intent, not implementation. "I want to know whether my wait is worthwhile" is more useful than "I want a message showing wait time" — because it opens the question of what information would actually answer the user's underlying need.</p>

  <p>The value explains why. This is the part most commonly dropped, and it is often the most important: it is the test against which the implementation will ultimately be judged.</p>

  <p>The conversation around a well-constructed User Story is where the actual specification work happens. The card is just a way to start it.</p>
---
