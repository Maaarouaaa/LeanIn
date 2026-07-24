# Overview

This working prototype helps a Lean In member move from “I want support” to “I found a group that fits.”

Instead of asking someone to browse a large directory without guidance, the experience collects a small set of meaningful preferences, recommends three relevant Circles, explains each recommendation, and lets the member submit a real request to join.

The prototype focuses on one complete journey:

Share goals, career stage, location, and meeting preferences.

Receive three ranked Circle recommendations.

Review a Circle and submit a request to join.

# Why this experience

Lean In Circles are valuable because the right small group can provide practical support, accountability, and connection. But a large directory can also create choice overload—especially for a new member who may not know what type of Circle will be most useful.

I redesigned this part of onboarding around a simpler question: What if Lean In helped each member find the room most likely to support what she needs next?

The goal is not to hide choice. Members can still browse the complete community. The matching flow gives them a confident place to begin.

# The experience

1. Preferences

On /match, members share:

The kind of support they are looking for

Their career stage

Topics and goals

Preferred meeting format

Meeting frequency

Location

Optional availability

The form uses accessible radio groups, selectable cards, chips, labels, validation messages, and clear interaction states.

2. Personalized matches

On /matches, the server ranks the available Circles and returns the three strongest recommendations.

Each result includes:

Circle name and category

Location and meeting format

Schedule and member count

Match percentage

A short explanation of why the Circle was recommended

Members can filter the results, edit their preferences, or browse every available Circle through the Community page.

3. Circle details and join request

On /circles/[slug], members can review:

Who the Circle is for

Meeting details

Topics discussed

Member preview

Circle leader

The request-to-join modal accepts an optional note and creates a persisted join request. The submitted state remains accurate after refresh and is scoped to the selected member and Circle.

# Design direction

I intentionally moved away from a conventional dashboard aesthetic. The visual system combines:

A warm butter-yellow, cream, black, and soft accent palette

Editorial type hierarchy

Large, direct headlines

Asymmetrical image treatments

Thin borders and restrained shadows

Purposeful motion and hover feedback

The direction is optimistic and expressive while keeping forms and decisions clear. Editorial elements give the experience personality; the underlying interaction patterns remain familiar and accessible.

# Technical approach

Stack

Next.js with the App Router

React and TypeScript

Tailwind CSS

Supabase

Architecture

The interface is organized around shared components for the masthead, flow progress, form controls, Circle cards, image treatments, and join-request modal.

Server-side actions handle preference persistence, Circle retrieval, ranking, and join-request creation. Supabase provides the persistent data layer, while server-only credentials remain outside client components.

# Data model

The prototype uses three primary entities:

profiles:  the demo member and her saved matching preferences

circles:  Circle descriptions, topics, schedules, formats, locations, leaders, and members

join_requests:  a member’s request to join a specific Circle, including an optional note and status

Join requests are identified by both the member and Circle so that a request for one Circle does not affect another.

# How matching works

Matching is deterministic and happens on the server.

Each Circle is scored against the member’s saved preferences across the factors that matter most to the experience:

Support needs and goals

Career-stage relevance

Meeting format

Frequency and availability

Location compatibility for in-person participation

The results are sorted by score and the top three are returned. The interface also translates the strongest shared factors into a concise “Why this matches you” explanation, so the recommendation is understandable rather than opaque.

This is a lightweight matching model rather than a predictive system. It is intentionally easy to inspect, test, and adjust as the product learns from real member behavior.

# What is real

Circle data is stored in Supabase.

Member preferences persist between sessions.

Matching runs against saved preferences on the server.

Results are ranked and filtered from the available Circle data.

Join requests are written to Supabase.

Duplicate requests for the same member and Circle are prevented.

Request status remains accurate after refresh.

# What is mocked

The experience uses a seeded demo profile rather than production authentication.

Circle leaders do not yet have an approval dashboard.

Notifications and messaging are outside the prototype scope.

Images and member previews are representative demo content.

I chose to make one journey genuinely functional rather than mock a larger platform.

# Scope and tradeoffs

Within the assignment’s timebox, I prioritized making the onboarding, matching, and join-request journey work end to end.

Imagery: I used representative placeholder photography rather than sourcing or art-directing a cohesive image library for the individual Circles. With more time, I would select images that feel specific to each community while working together as one visual system.

Join-request modal: The request flow is functional, but I would give the modal another visual-design pass—refining its proportions, spacing, responsive behavior, and transition into the success state.

# What I would build next

With more time, I would explore:

A cohesive, Circle-specific photography direction

Further visual and interaction polish for the join-request modal

A multilingual interface, beginning with Spanish and French, so more members can complete the matching journey in the language most comfortable to them

A more detailed Circle filtering system, with additional ways to narrow the community beyond the lightweight format and schedule filters in this prototype

A Circle-leader workflow for reviewing requests

Request-status notifications and feedback that could improve future recommendations

# 
AI assistance note: I used GPT-5.6 to help organize and edit this README. The product decisions and reflections described here are my own.
