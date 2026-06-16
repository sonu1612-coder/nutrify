# Graph Report - .  (2026-06-16)

## Corpus Check
- Corpus is ~27,754 words - fits in a single context window. You may not need a graph.

## Summary
- 81 nodes · 78 edges · 18 communities (14 shown, 4 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 18,563 input · 1,223 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Manifest Config|Manifest Config]]
- [[_COMMUNITY_Admin Features|Admin Features]]
- [[_COMMUNITY_AI Assistant|AI Assistant]]
- [[_COMMUNITY_User Profile|User Profile]]
- [[_COMMUNITY_Customer Support|Customer Support]]
- [[_COMMUNITY_Nutrition API|Nutrition API]]
- [[_COMMUNITY_Database Seeding|Database Seeding]]
- [[_COMMUNITY_App Intro Assets|App Intro Assets]]
- [[_COMMUNITY_Graphify Workflows|Graphify Workflows]]
- [[_COMMUNITY_Service Worker|Service Worker]]

## God Nodes (most connected - your core abstractions)
1. `sendMessage()` - 5 edges
2. `render()` - 4 edges
3. `fetchAllMessages()` - 3 edges
4. `updateHeaderAvatar()` - 3 edges
5. `updateAvatarUrl()` - 3 edges
6. `renderMessages()` - 3 edges
7. `processMessagesToUsersMap()` - 2 edges
8. `renderUserList()` - 2 edges
9. `renderChatBubble()` - 2 edges
10. `renderLoadingBubble()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Graphify Workflow` --conceptually_related_to--> `Graphify Rules`  [INFERRED]
  C:/Users/HP/OneDrive/Desktop/nutrify/.agents/workflows/graphify.md → C:/Users/HP/OneDrive/Desktop/nutrify/.agents/rules/graphify.md

## Import Cycles
- None detected.

## Communities (18 total, 4 thin omitted)

### Community 0 - "Manifest Config"
Cohesion: 0.20
Nodes (9): background_color, description, display, icons, name, orientation, short_name, start_url (+1 more)

### Community 2 - "Admin Features"
Cohesion: 0.32
Nodes (3): fetchAllMessages(), processMessagesToUsersMap(), renderUserList()

### Community 3 - "AI Assistant"
Cohesion: 0.48
Nodes (5): callNvidiaAssistant(), removeLoadingBubble(), renderChatBubble(), renderLoadingBubble(), sendMessage()

### Community 4 - "User Profile"
Cohesion: 0.52
Nodes (6): bindTabEvents(), fetchDbProfile(), getTabContent(), render(), updateAvatarUrl(), updateHeaderAvatar()

### Community 5 - "Customer Support"
Cohesion: 0.38
Nodes (3): loadMessages(), renderMessages(), scrollToBottom()

### Community 8 - "Database Seeding"
Cohesion: 0.40
Nodes (3): bulkFoods, { createClient }, supabase

## Knowledge Gaps
- **13 isolated node(s):** `name`, `short_name`, `description`, `start_url`, `display` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `name`, `short_name`, `description` to the rest of the system?**
  _15 weakly-connected nodes found - possible documentation gaps or missing edges._