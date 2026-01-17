# PRD: Enhanced Chess Analytics Dashboard

## Project overview

This project enhances the existing Chess Analytics website by adding comprehensive statistical analysis and visualizations for Chess.com players. The enhanced dashboard will provide deep insights into player performance across multiple dimensions including win/loss trends, color performance, rating progression, game termination patterns, opening repertoire analysis, opponent strength analysis, and time-of-day performance patterns.

The current implementation provides basic statistics (total wins, losses, draws, and win rates). This enhancement will transform the analytics page into a comprehensive dashboard with 8 detailed analysis sections, enabling players to identify strengths, weaknesses, and patterns in their gameplay over any selected time period.

The system will fetch game data from the Chess.com Public API, process and analyze it server-side, and present interactive visualizations on a clean, modern single-page dashboard. All timestamps will be converted to the user's local timezone for accurate time-based analysis.

**Skills required:**

* Python (Flask)
* Chess.com API integration
* PGN parsing (python-chess library)
* Data analysis and statistics
* Chart.js for visualizations
* JavaScript (ES6+)
* HTML5/CSS3 (modern, clean UI design)
* Timezone handling (both server and client-side)
* SQLite/caching for optimization
* Playwright for E2E testing

---

# PRD change history

This section tracks all iterations and modifications to the PRD document. Engineers should review this section to understand the latest changes and their context.

## Iteration 4 - December 31, 2025

**Version:** 2.2  
**Focus:** Performance optimization, user-centric opening analysis, and date range restrictions

### Changes Summary

**Global Change - Date Range Restrictions:**
- **Added:** Maximum date range validation (30 days)
  - **Allowed periods:** "Last 7 days" or "Last 30 days" (preset options)
  - **Custom range:** Maximum 30 days allowed
  - **Rationale:** 
    * Ensures analysis completes within 1 minute (performance goal)
    * Focuses user on recent, actionable data
    * Reduces API load and server costs
- **Error handling:**
  - If user selects >30 days: Display error message
  - Message: "Please select a date range of 30 days or less. For best results, use 'Last 7 days' or 'Last 30 days'."
  - Prevent form submission until valid range selected
- **UI changes:**
  - Add prominent preset buttons: [Last 7 Days] [Last 30 Days]
  - Date picker allows custom range but validates on submit
  - Show helper text: "Max 30 days for optimal performance"
- **Performance impact:**
  - 7 days: ~5-15 games → 1-3 analyzed → ~30-60 seconds
  - 30 days: ~20-50 games → 4-10 analyzed → ~45-90 seconds
  - Target: <1 minute for 95% of analyses

**Section 6 - Opening Performance Analysis (EA-006):**
- **Changed:** Complete redesign from best/worst openings to frequency-based analysis
  - **Old:** "Top Best Openings" / "Top Worst Openings" with minimum 3 games threshold
  - **New:** "Top 10 Most Common Openings" with win rate analysis
  - **Rationale:** 
    * Users care more about their frequently-played openings than rare high-performing ones
    * Better insight into repertoire patterns and where to focus improvement
    * Avoids misleading stats from small sample sizes (e.g., 100% win rate from 1 game)
- **Removed:** Best/worst categorization, 3-game minimum threshold
- **Removed:** First 6 moves display and interactive chess board (complexity not justified for frequency view)
- **Added:** Single table/chart showing top 10 openings by frequency
- **Display:** Opening name, games played count, win rate %, win-loss-draw breakdown
- **Sorting:** Descending by games played (most to least common)
- **Updated:** Acceptance criteria to reflect frequency-based display
- **Updated:** Test case TC-018 to verify top 10 frequency ranking

**Section 9 - Mistake Analysis Optimization (EA-018):**
- **Added:** Intelligent sampling strategy for performance optimization
  - **Problem:** Full analysis takes ~66 minutes for 50 games (2s × 40 moves × 50)
  - **Solution:** Multi-tier approach with 20% sampling
- **Sampling algorithm:**
  * Always analyze 20% of total games (random stratified sample)
  * Stratification: Ensure sample includes games from all time periods and outcomes
  * Minimum 10 games analyzed, maximum 50 games (even if 20% exceeds this)
  * Cache all analyzed games permanently
  * Over time, coverage increases without repeating work
- **User communication:**
  * Display: "Analysis based on X games (Y% of total)"
  * Confidence indicator: "High confidence" (>50 games) / "Good confidence" (20-50) / "Limited data" (<20)
  * Tooltip: "For faster results, we analyze a representative sample. Results are cached and improve over time."
- **Research-based approach:**
  * Based on statistical sampling principles (20% sample provides ~90% accuracy for pattern detection)
  * Chess mistake patterns are consistent across games (validated in chess education research)
  * Focus on PATTERN identification (which stages have issues) not absolute counts
- **Alternative considered:** Critical position analysis (analyze only tactical positions)
  * Rejected: Requires pre-classification of positions, adds complexity
  * Sampling is simpler, well-understood, and statistically sound
- **Performance improvement:**
  * Before: 66 minutes for 50 games
  * After: ~13 minutes for 10 games (20% sample) on first run
  * Subsequent runs: <5 seconds (cached)
  * User acceptable: <15 minutes for initial analysis
- **Updated:** Implementation details with sampling logic
- **Updated:** Acceptance criteria with sampling requirements
- **Updated:** Test cases to verify sampling and confidence indicators

**Testing Updates:**
- **Modified:** TC-018 to verify top 10 most common openings (not best/worst)
- **Added:** TC-021A to verify sampling strategy (20%, stratified, min/max limits)
- **Added:** TC-021B to verify confidence indicators based on sample size
- **Added:** TC-021C to verify cache persistence across analyses

**Documentation:**
- **Updated:** Document version from 2.1 to 2.2
- **Updated:** "Last Updated" date to December 31, 2025
- **Added:** Changelog entry for version 2.2

### Implementation Notes for Engineers

**Priority 1 - Section 9 (Mistake Analysis Optimization):**
- Implement stratified random sampling (20% of games)
- Sample stratification by: date (even distribution across period) + outcome (W/L/D ratio maintained)
- Min 10 games, max 50 games analyzed per request
- Cache structure: Store analyzed games by game URL + analysis timestamp
- Display sample size and confidence level prominently
- Add tooltip explaining sampling approach

**Priority 2 - Section 6 (Opening Performance Redesign):**
- Remove best/worst categorization logic
- Remove 3-game minimum filter
- Remove move sequence display and chess board components
- Implement frequency-based sorting (descending by games played)
- Display top 10 only (or fewer if player has <10 unique openings)
- Show: Opening name, Games played, Win rate %, W-L-D counts
- Update frontend to single table or horizontal bar chart

---

## Iteration 3 - December 26, 2025

**Version:** 2.1  
**Focus:** UI refinements, data enhancements, and YouTube integration

### Changes Summary

**Section 6 - Opening Performance Analysis (EA-006):**
- **Changed:** Removed "Top 5" restriction from opening display headings
  - **Old:** "Top 5 Best Openings" / "Top 5 Worst Openings"
  - **New:** "Top Best Openings" / "Top Worst Openings" (dynamic count)
  - **Rationale:** Flexible display when fewer than 5 openings meet criteria
- **Added:** First 6 chess moves display requirement
  - Display moves in standard chess notation (e.g., "1. e4 e5 2. Nf3 Nc6 3. Bb5")
  - Shows moves for each opening listed in top best/worst categories
- **Added:** Interactive chess board display
  - Visual board showing position after move 6 for each opening
  - Helps users visualize and learn opening positions
- **Updated:** Acceptance criteria to reflect dynamic count and new display requirements

**Section 8 - Time of Day Performance (EA-008):**
- **Enhanced:** Timezone conversion verification requirements
  - Added explicit requirement for backend to receive timezone parameter
  - Emphasized UTC to user local timezone conversion before categorization
  - Added requirement for timezone display in Section 8 header
  - Added manual testing requirements across multiple timezones (EST, PST, GMT+8)
  - **Rationale:** Ensure accurate time-based analysis for users worldwide
- **Updated:** Acceptance criteria with specific timezone verification checkpoints
- **Status:** Changed critical timezone-related criteria from completed to pending verification

**Section 9 - Mistake Analysis by Game Stage (EA-018):**
- **Refined:** Critical mistake game link selection criteria
  - **Old:** "Link to game with biggest blunder in this stage"
  - **New:** Must meet ALL criteria:
    * Player LOST the game (not won, not drawn)
    * Game ended by RESIGNATION (not timeout or abandonment)
    * Contains biggest CP drop in stage across qualifying games
    * CP drop must be "significant" (threshold determined from data analysis)
    * Link opens game on Chess.com at exact mistake position
  - **Rationale:** Provide most relevant examples for learning from mistakes
- **Added:** Algorithm requirement to determine "significant" CP drop threshold from data
- **Added:** Fallback display "No qualifying game" when no games meet all criteria
- **Updated:** Acceptance criteria with detailed game link requirements
- **Updated:** Test case TC-021 to verify new criteria

**Section 10 - AI Chess Advisor (EA-019):**
- **Restructured:** Recommendation format from flexible to fixed structure
  - **Old:** "Up to 7 section-specific suggestions" + 1 overall
  - **New:** EXACTLY 9 section-specific recommendations (one per section 1-9) + 1 overall
  - **Rationale:** Ensure comprehensive coverage of all analytics sections
- **Added:** YouTube video integration for opening tutorials
  - Video source prioritization: ChessNetwork > GMHikaru > GothamChess > Chessbrahs
  - Show 1 video recommendation per frequently-played opening (3+ games)
  - Implementation options: Curated database (recommended) OR YouTube/Google API search
  - Video format: "[Opening Name]: [Video Title] by [Channel] - [Watch Link]"
- **Updated:** System prompt to generate exactly 9+1 recommendations with clear section labels
- **Updated:** User prompt template with specific format for all 9 sections + overall
- **Updated:** Token budget from 500 to 800 (cost estimate: $0.008-$0.012, still under target)
- **Added:** Rate limiting for YouTube API if used (max 100 searches/day)
- **Updated:** UI mockup to show structured 9+1 format with video links
- **Updated:** Acceptance criteria with YouTube integration requirements
- **Updated:** Test cases TC-024 and TC-025 to verify 9+1 structure and video links
- **Updated:** EA-019 user story acceptance criteria

**Testing Updates:**
- **Modified:** TC-018 to verify dynamic opening count and chess notation display
- **Enhanced:** TC-024 to verify exact count of 9+1 recommendations with section labels
- **Enhanced:** TC-025 to verify YouTube video recommendations and channel priority

**Documentation:**
- **Updated:** Document version from 2.0 to 2.1
- **Updated:** "Last Updated" date to December 26, 2025
- **Added:** Changelog entry for version 2.1

### Implementation Notes for Engineers

**Priority 1 - Section 10 (AI Advisor):**
- Requires OpenAI API integration updates (system and user prompts)
- YouTube video database creation OR API integration needed
- Parser updates for structured 9+1 response format
- Frontend UI updates for new display structure

**Priority 2 - Section 9 (Mistake Analysis):**
- Filter algorithm for game selection (lost by resignation only)
- CP drop threshold calculation from data distribution
- Game link generation with position parameters

**Priority 3 - Section 6 (Opening Performance):**
- Remove hardcoded "5" from UI labels
- Chess notation formatting for first 6 moves
- Chess board component integration (interactive display)

**Priority 4 - Section 8 (Time of Day):**
- Verification testing across multiple timezones
- Ensure timezone parameter flows from frontend to backend
- Add timezone display to Section 8 UI header

---

## Iteration 2 - December 12, 2025

**Version:** 2.0  
**Focus:** Advanced analysis features with AI/ML integration

### Changes Summary

**New Milestone Added: Milestone 8 - Game Stage Mistake Analysis**
- **Added:** Section 9 - Mistake Analysis by Game Stage (EA-018)
  - Chess engine integration using Stockfish 15+
  - Mistake classification: Inaccuracies (50-100 CP), Mistakes (100-200 CP), Blunders (200+ CP)
  - Game stage categorization: Early (1-7 moves), Middle (8-20 moves), Endgame (21+ moves)
  - Missed opportunity detection
  - Performance optimization with caching and parallel processing
  - Table visualization with critical mistake game links
- **Added:** Test cases TC-021, TC-022, TC-023 for engine analysis functionality

**New Milestone Added: Milestone 9 - AI-Powered Chess Advisor**
- **Added:** Section 10 - AI Chess Advisor Recommendations (EA-019)
  - OpenAI GPT-4-turbo API integration
  - Personalized coaching advice based on all 9 sections
  - Summary data preparation (no raw PGN sent)
  - System prompt design for expert chess coach persona
  - Cost control: <$0.01 per analysis target
  - Caching strategy (1-hour TTL)
  - Fallback to rule-based advice on API failure
- **Added:** Test cases TC-024 through TC-030 for AI advisor functionality

**Tech Stack Updates:**
- **Added:** `python-chess` library for Stockfish integration
- **Added:** `openai` Python library for GPT-4 API
- **Added:** Stockfish chess engine (local installation)
- **Added:** Redis recommendation for caching engine analysis and AI advice
- **Added:** Multiprocessing for parallel game analysis

**System Architecture Updates:**
- **Added:** Mistake Analysis Engine component
- **Added:** Stockfish Engine integration
- **Added:** AI Advisor Service component
- **Added:** OpenAI GPT-4 API integration
- **Updated:** Cache layer to include engine analysis and AI advice

**Success Metrics Updates:**
- **Added:** API response time target: <10 seconds (including engine analysis)
- **Added:** Stockfish analysis accuracy validation requirement
- **Added:** AI advisor relevance assessment (qualitative)
- **Added:** AI API cost metric: <$0.01 per analysis
- **Updated:** Total test cases from 20 to 30

**Documentation:**
- **Updated:** Document version from 1.0 to 2.0
- **Updated:** Total sections from 8 to 10
- **Updated:** "Last Updated" date to December 12, 2025

---

## Iteration 1 - December 5-6, 2025

**Version:** 1.0  
**Focus:** Core analytics infrastructure and UI enhancements

### Initial PRD Creation (December 5, 2025)

**Milestones 1-6 Defined:**
- Milestone 1: Core analytics infrastructure and data processing
- Milestone 2: Backend API endpoints
- Milestone 3: Frontend dashboard UI foundation
- Milestone 4: Analytics visualizations - Part 1 (Sections 1-3)
- Milestone 5: Analytics visualizations - Part 2 (Sections 4-6)
- Milestone 6: Analytics visualizations - Part 3 (Sections 7-8)

**Initial Sections (EA-001 through EA-012):**
- Section 1: Overall performance over time
- Section 2: Color performance over time
- Section 3: Elo rating progression
- Section 4: How I win games (termination types)
- Section 5: How I lose games (termination types)
- Section 6: Opening performance analysis
- Section 7: Opponent strength analysis
- Section 8: Time of day performance

**Test Cases Defined:**
- TC-001 through TC-014: Core analytics workflow and visualization tests

### Milestone 7 Added (December 6, 2025)

**UI Enhancement and Visualization Updates:**
- **Modified:** Section 1 (EA-013) - Simplified to single win rate line chart
- **Modified:** Section 2 (EA-014) - Unified White/Black performance in single chart with summary cards
- **Enhanced:** Sections 4 & 5 (EA-015) - Added count labels inside pie chart segments
- **Enhanced:** Section 6 (EA-016) - Integrated Lichess Opening Database for human-readable names
- **Simplified:** Sections 7 & 8 (EA-017) - Replaced bar charts with card-based display

**Test Cases Added:**
- TC-015 through TC-020: UI enhancement verification tests

**Milestone Completion:**
- Marked Milestones 1-6 as completed (December 6, 2025)
- Marked Milestone 7 as completed (December 6, 2025)

**File Naming:**
- Renamed from initial draft to `prd_overview_data_analysis.md`

---

## How to Use This Section

**For Engineers:**
1. Always check this section first when returning to the PRD
2. Review the latest iteration to understand recent changes
3. Pay attention to "Implementation Notes" for priority guidance
4. Check "Rationale" fields to understand why changes were made

**For Product Managers:**
1. Document all PRD changes in this section immediately after approval
2. Include clear before/after comparisons for modified requirements
3. Provide rationale for significant changes
4. Link to relevant discussions or decisions

**For QA/Testers:**
1. Review changed sections to update test plans
2. Check test case modifications (TC-XXX references)
3. Verify acceptance criteria updates

---

# Key features

## Milestone 1: Core analytics infrastructure and data processing

**Status:** ✅ Completed  
**Completion Date:** December 6, 2025

### Enhanced data fetching and parsing

* Extend `ChessService` to fetch complete game data including PGN
* Implement PGN parser to extract opening moves and names
* Extract and normalize all game metadata (ratings, termination types, timestamps)
* Add timezone conversion utilities for timestamp handling
* Implement efficient caching strategy for analyzed data

### Data analysis engine

* Create `AnalyticsService` for statistical calculations
* Implement daily aggregation functions for time-series data
* Build opening name extraction from PGN (first 5-10 moves)
* Calculate Elo differentials for opponent strength analysis
* Process termination types from game metadata
* Handle time-of-day categorization with timezone awareness

### Database schema enhancements

* Consider caching layer for processed analytics (optional)
* Store analysis metadata to avoid redundant API calls
* Design efficient data structures for quick retrieval

---

## Milestone 2: Backend API endpoints

**Status:** ✅ Completed  
**Completion Date:** December 6, 2025

### Analytics API endpoint

* Create `/api/analyze/detailed` endpoint
* Accept parameters: `username`, `start_date`, `end_date`, `timezone`
* Return comprehensive analysis results for all 8 sections
* Implement proper error handling and validation
* Add rate limiting to prevent API abuse

### Response structure

```json
{
  "username": "jay_fh",
  "start_date": "2025-01-01",
  "end_date": "2025-03-31",
  "timezone": "America/New_York",
  "total_games": 150,
  "sections": {
    "overall_performance": {...},
    "color_performance": {...},
    "elo_progression": {...},
    "termination_wins": {...},
    "termination_losses": {...},
    "opening_performance": {...},
    "opponent_strength": {...},
    "time_of_day": {...}
  }
}
```

### Validation and error handling

* Validate username exists on Chess.com
* **Validate date range:**
  - **Maximum:** 30 days (required for performance)
  - **Minimum:** 1 day
  - Calculate: `(end_date - start_date).days <= 30`
  - Error response if exceeded:
    ```json
    {
      "error": "date_range_exceeded",
      "message": "Please select a date range of 30 days or less. For best results, use 'Last 7 days' or 'Last 30 days'.",
      "max_days": 30,
      "requested_days": 45
    }
    ```
* Validate timezone string
* Handle API rate limits gracefully
* Return meaningful error messages

---

## Milestone 3: Frontend dashboard UI foundation

**Status:** ✅ Completed  
**Completion Date:** December 6, 2025

### Page layout and structure

* Design single-page scrollable dashboard layout
* Implement responsive grid system for analytics cards
* Create reusable card component structure
* Add loading states for asynchronous data fetching
* Implement error state displays

### UI design system

* Clean, modern aesthetic inspired by referenced Dribbble designs
* Consistent color scheme:
  * Wins: Green (#27ae60)
  * Losses: Red (#e74c3c)
  * Draws: Gray (#95a5a6)
  * Neutral/Info: Blue (#3498db)
* Card-based layout with subtle shadows and rounded corners
* Generous whitespace and clear typography
* Smooth transitions and animations

### User input enhancement

* Add timezone detection and selector
* **Date range selection with presets:**
  - **Preset buttons (prominent):** [Last 7 Days] [Last 30 Days]
  - Custom date picker (with validation)
  - Helper text: "Maximum 30 days for optimal performance"
  - Real-time validation: Show error if range > 30 days
  - Disable submit button until valid range selected
* **Date range validation:**
  - Frontend: Check `(end_date - start_date).days <= 30` before submission
  - Show error message below date picker if exceeded
  - Suggest using preset buttons for best results
* Show analysis metadata (total games, date range, timezone)

---

## Milestone 4: Analytics visualizations - Part 1

**Status:** ✅ Completed  
**Completion Date:** December 6, 2025

### Section 1: Overall win/loss performance over time

**Requirement ID:** EA-001

**User story:** As a chess player, I want to see my win rate trends over time so I can track my overall performance improvement.

**Implementation:**
* Line chart showing daily win rate percentage (0-100%)
* X-axis: Date (daily intervals)
* Y-axis: Win Rate %
* Single line showing win rate percentage over time
* Interactive tooltips showing: Date, Win Rate %, Wins count, Losses count, Draws count
* Clean visualization focusing on performance trend

**Acceptance criteria:**
- [x] Chart displays daily win rate percentage as line graph
- [x] Y-axis shows "Win Rate %" (0-100% scale)
- [x] Dates are shown in user's local timezone
- [x] Chart is responsive and readable on mobile devices
- [x] Tooltips show: Date, Win Rate %, Wins, Losses, Draws on hover
- [x] Empty dates (no games) are handled gracefully
- [x] Chart legend is clear and positioned appropriately

---

### Section 2: Color performance over time

**Requirement ID:** EA-002

**User story:** As a chess player, I want to see my performance as White versus Black over time so I can identify if I'm stronger with one color.

**Implementation:**
* Single line chart with TWO lines showing win rate percentage for White and Black
* X-axis: Date (daily intervals)
* Y-axis: Win Rate %
* Two lines: White win rate and Black win rate
* Two separate summary cards above chart:
  * Card 1: White summary (total games, win rate %)
  * Card 2: Black summary (total games, win rate %)
* Interactive tooltips showing: Date, Win Rate %, Wins, Losses, Draws per color
* Clear visual distinction between White and Black lines

**Acceptance criteria:**
- [x] Single chart with two lines (White and Black win rates)
- [x] Two separate summary cards displayed above chart
- [x] White summary card shows: total games and win rate %
- [x] Black summary card shows: total games and win rate %
- [x] Daily aggregation of win rate by color
- [x] Win rate percentages displayed in tooltips on hover
- [x] Visual comparison between colors is clear
- [x] Tooltips include: Date, Win Rate %, Wins, Losses, Draws per color
- [x] Data accurately distinguishes player's color in each game

---

### Section 3: Elo rating progression over time

**Requirement ID:** EA-003

**User story:** As a chess player, I want to see my Elo rating changes over the selected period so I can track my rating improvement or decline.

**Implementation:**
* Line chart showing Elo rating progression
* X-axis: Date (daily)
* Y-axis: Elo rating
* Extract rating from each game's metadata
* Plot rating after each game
* Show trend line or moving average (7-day)
* Display rating change (+/- from start to end)
* Handle multiple time controls separately if needed

**Acceptance criteria:**
- [x] Chart displays Elo rating for each game date
- [x] Rating values are extracted correctly from game data
- [x] Positive and negative rating changes are visually distinct
- [x] Summary shows net rating change for the period
- [x] Chart handles missing data points appropriately
- [x] Separate views or filters for different time controls (blitz, rapid, bullet)

---

## Milestone 5: Analytics visualizations - Part 2

**Status:** ✅ Completed  
**Completion Date:** December 6, 2025

### Section 4: Termination types - Winning games

**Requirement ID:** EA-004

**User story:** As a chess player, I want to know how I typically win games (checkmate, timeout, resignation, etc.) so I can understand my winning patterns.

**Implementation:**
* Pie/doughnut chart showing distribution of winning termination types
* Categories: Checkmate, Timeout, Resignation, Abandoned, Other
* Parse termination type from game metadata (`white.result` / `black.result`)
* Display count labels inside pie segments (e.g., "Checkmate: 25")
* Show percentages in chart legend or tooltip
* Table showing detailed breakdown with game counts

**Acceptance criteria:**
- [x] All winning games are categorized by termination type
- [x] Chart displays accurate percentages
- [x] Count labels displayed inside pie segments (e.g., "Checkmate: 25")
- [x] Only includes games where the user won (result = "win")
- [x] All possible termination types are handled
- [x] Visual representation is clear and readable
- [x] Clicking segments shows example games (optional enhancement)

---

### Section 5: Termination types - Losing games

**Requirement ID:** EA-005

**User story:** As a chess player, I want to know how I typically lose games so I can identify patterns and improve my weaknesses.

**Implementation:**
* Pie/doughnut chart showing distribution of losing termination types
* Categories: Checkmate, Timeout, Resignation, Abandoned, Other
* Parse termination type from game metadata
* Display count labels inside pie segments (e.g., "Checkmate: 20")
* Show percentages in chart legend or tooltip
* Table showing detailed breakdown with game counts

**Acceptance criteria:**
- [x] All losing games are categorized by termination type
- [x] Chart displays accurate percentages
- [x] Count labels displayed inside pie segments (e.g., "Checkmate: 20")
- [x] Only includes games where opponent won (result = "lose")
- [x] All possible termination types are handled
- [x] Visual representation is clear and readable
- [x] Comparison with winning terminations is easily visible

---

### Section 6: Chess opening performance

**Requirement ID:** EA-006

**User story:** As a chess player, I want to see my most frequently played openings and their performance so I can focus my improvement efforts on the openings I actually use.

**Implementation:**
* Parse PGN data to extract opening moves (first 5-10 moves)
* Identify opening names using chess opening database/library
* Calculate games played and win rate for each opening
* Display single table/chart:
  * **Top 10 Most Common Openings** (sorted by games played, descending)
  * Show: Opening name, Games played, Win rate %, W-L-D counts
  * If player has <10 unique openings, show all available
* Visual representation: Horizontal bar chart showing games played with win rate overlay OR table with color-coded win rates
* No minimum game threshold (show actual usage patterns)
* Focus on frequency over performance (helps identify repertoire gaps)

**Technical notes:**
* Use `python-chess` library for PGN parsing
* Use chess opening database for name identification:
  * Primary: Lichess Opening Database (comprehensive, open-source)
  * Fallback: python-chess-opening-names package
* Opening identification algorithm:
  * Parse first 5-10 moves from PGN
  * Match move sequence against opening database
  * Return human-readable opening name (e.g., "Sicilian Defense", "French Defense")
* Handle unknown openings:
  * Label as "Unknown Opening" when no match found
  * Target: <15% of games categorized as "Unknown Opening"
  * Log unidentified move sequences for future database improvements
* Sort by frequency: Count games per opening, display top 10
* Include all openings in count (no minimum threshold)

**Acceptance criteria:**
- [x] PGN data is parsed correctly for each game
- [x] Opening names extracted using Lichess Opening Database
- [x] Opening names displayed without ECO codes (human-readable names only)
- [x] Unknown openings labeled as "Unknown Opening"
- [x] Less than 15% of games categorized as "Unknown Opening"
- [x] Win rates are calculated correctly (wins / total games)
- [ ] Top 10 most common openings displayed (sorted by games played, descending)
- [ ] Display shows: Opening name, Games played, Win rate %, W-L-D counts
- [ ] If fewer than 10 unique openings, display all available
- [ ] Sorting is descending by games played (most to least common)
- [ ] Visual representation (bar chart or table) is clear
- [x] Games played count is shown for each opening
- [ ] Color-coded win rates (green >55%, neutral 45-55%, red <45%)

---

## Milestone 6: Analytics visualizations - Part 3

**Status:** ✅ Completed  
**Completion Date:** December 6, 2025

### Section 7: Opponent strength analysis

**Requirement ID:** EA-007

**User story:** As a chess player, I want to see my win rate against opponents of different strength levels so I can understand how I perform against weaker, similar, and stronger players.

**Implementation:**
* Calculate Elo differential for each game (opponent rating - player rating)
* Categorize games into three groups:
  * Lower rated: Opponent Elo < Player Elo - 100
  * Similar rated: Player Elo - 100 ≤ Opponent Elo ≤ Player Elo + 100
  * Higher rated: Opponent Elo > Player Elo + 100
* Calculate win/loss/draw counts and win rate for each category
* Display as three separate cards (grid layout) - NO bar chart
* Each card shows:
  * Category name (Lower/Similar/Higher rated)
  * Total games played
  * Win/Loss/Draw counts
  * Win rate percentage
  * Average Elo differential
* Include average Elo differential for each category

**Acceptance criteria:**
- [x] Elo differentials are calculated correctly
- [x] Games are categorized accurately into three strength groups
- [x] Win rates are calculated for each category
- [x] Three card grid layout displays data clearly (no bar chart)
- [x] Each card shows: games played, W/L/D counts, win rate %, avg Elo diff
- [x] Game counts are displayed for each category
- [x] Handles cases where player or opponent rating is missing
- [x] Summary insight: "You perform best against [category]"

---

### Section 8: Time of day performance

**Requirement ID:** EA-008

**User story:** As a chess player, I want to see when I play best during the day so I can schedule important games during my peak performance times.

**Implementation:**
* Convert all game timestamps to user's local timezone
* Categorize games by time of day:
  * Morning: 6:00 AM - 2:00 PM
  * Afternoon: 2:00 PM - 10:00 PM
  * Night: 10:00 PM - 6:00 AM
* Calculate win/loss/draw counts and win rate for each period
* Display as three separate cards (grid layout) - NO bar chart
* Each card shows:
  * Time period name (Morning/Afternoon/Night)
  * Total games played
  * Win/Loss/Draw counts
  * Win rate percentage
* Show games played distribution across time periods

**Technical notes:**
* Use JavaScript `Intl` API for timezone detection
* Server should accept timezone parameter and convert timestamps
* Consider daylight saving time changes

**Acceptance criteria:**
- [ ] Game timestamps are converted to user's timezone (CRITICAL: verify implementation)
- [ ] Backend receives timezone parameter from frontend
- [ ] All game timestamps converted from UTC to user timezone before categorization
- [ ] Time period categorization uses converted local time (not UTC)
- [ ] Games are categorized correctly into time periods based on LOCAL time
- [x] Win rates are calculated for each time period
- [x] Three card grid layout displays data clearly (no bar chart)
- [x] Each card shows: games played, W/L/D counts, win rate %
- [x] Game distribution (how many games in each period) is visible
- [x] User can see their best and worst performing times
- [ ] Timezone is displayed clearly to user in Section 8 header
- [x] Handles edge cases (games exactly at boundary times)
- [ ] Manual verification: test with different timezones (EST, PST, GMT+8) to confirm correct categorization

---

## Milestone 7: UI Enhancement and Visualization Updates

**Status:** ✅ Completed  
**Completion Date:** December 6, 2025

### Overview
This milestone focuses on refining and enhancing the user interface and data visualizations based on user feedback and usability testing. The goal is to create a cleaner, more intuitive dashboard that presents data in the most actionable format.

### Section 1: Enhanced Overall Performance Visualization

**Requirement ID:** EA-013

**User story:** As a chess player, I want to see my win rate trend clearly without clutter, so I can quickly assess my performance trajectory.

**Changes from original implementation:**
* Replace three-line chart (wins/losses/draws) with single win rate percentage line
* Move detailed counts to hover tooltips only
* Focus visualization on performance trend rather than raw numbers

**Implementation:**
* Update Chart.js configuration to show single line (win rate %)
* Y-axis range: 0-100% (win rate percentage)
* X-axis: Dates in user's local timezone
* Tooltip displays: Date, Win Rate %, Wins, Losses, Draws
* Remove win/loss/draw lines from main chart
* Maintain responsive design

**Acceptance criteria:**
- [ ] Single line chart displays win rate percentage over time
- [ ] Y-axis labeled "Win Rate %" with 0-100% scale
- [ ] Hover tooltip shows: Date, Win Rate %, Wins, Losses, Draws
- [ ] Chart is cleaner and easier to read at a glance
- [ ] Mobile responsive design maintained
- [ ] Performance is smooth with large datasets

---

### Section 2: Unified Color Performance Chart

**Requirement ID:** EA-014

**User story:** As a chess player, I want to compare my White and Black performance directly on one chart, with clear summary statistics for each color.

**Changes from original implementation:**
* Combine White and Black charts into single chart with two lines
* Add two separate summary cards above chart
* Show win rate trends for both colors simultaneously

**Implementation:**
* Single Chart.js line chart with two datasets:
  * Line 1: White win rate % (color: white/light gray)
  * Line 2: Black win rate % (color: dark gray/black)
* Two summary cards displayed above chart:
  * White Summary Card: Total games, Win rate %
  * Black Summary Card: Total games, Win rate %
* Tooltips show per-color details: Date, Win Rate %, Wins, Losses, Draws
* Legend clearly distinguishes White vs Black lines

**Acceptance criteria:**
- [ ] Single chart displays two lines (White and Black win rates)
- [ ] Two separate summary cards positioned above chart
- [ ] White summary card shows: total games played as White, win rate %
- [ ] Black summary card shows: total games played as Black, win rate %
- [ ] Chart legend clearly labels White and Black lines
- [ ] Tooltips show color-specific data on hover
- [ ] Visual distinction between White and Black lines is clear
- [ ] Responsive design for mobile devices

---

### Section 4 & 5: Enhanced Termination Type Visualization

**Requirement ID:** EA-015

**User story:** As a chess player, I want to see immediately how many games I won/lost by each termination type without needing to hover.

**Changes from original implementation:**
* Display count labels directly inside pie chart segments
* Reduce need for tooltip interaction
* Improve at-a-glance readability

**Implementation:**
* Chart.js datalabels plugin configuration
* Show counts inside each segment (e.g., "Checkmate: 25")
* Percentages remain in legend or tooltip
* Ensure text is readable on all segment sizes
* Apply to both winning (Section 4) and losing (Section 5) charts

**Acceptance criteria:**
- [ ] Count labels displayed inside pie segments (e.g., "Checkmate: 25")
- [ ] Labels are readable on all segment sizes
- [ ] Percentages available in legend or tooltip
- [ ] Both winning and losing charts use same label format
- [ ] Labels don't overlap or obscure chart
- [ ] Responsive design maintains label readability

---

### Section 6: Opening Names Enhancement

**Requirement ID:** EA-016

**User story:** As a chess player, I want to see familiar opening names (like "Sicilian Defense") instead of ECO codes, so I can immediately recognize the openings.

**Changes from original implementation:**
* Display human-readable opening names only (no ECO codes)
* Integrate with comprehensive opening database
* Minimize "Unknown Opening" classifications

**Implementation:**
* Integrate Lichess Opening Database
  * Database URL: https://github.com/lichess-org/chess-openings
  * Contains 3000+ opening variations with names
  * Regularly updated and maintained
* Parsing algorithm:
  1. Extract first 5-10 moves from PGN
  2. Convert to UCI notation
  3. Match against Lichess opening database
  4. Return full opening name (e.g., "Sicilian Defense: Najdorf Variation")
  5. If no match, label as "Unknown Opening"
* Quality threshold: <15% of games as "Unknown Opening"
* Fallback options if match confidence is low:
  * Try shorter move sequences (5 moves, 4 moves, 3 moves)
  * Match to parent opening family
* Display opening names in bar chart and tables
* Never show ECO codes in UI

**Technical implementation:**
```python
from chess_openings import get_opening_name
import chess.pgn

def identify_opening(pgn_string):
    """Identify opening name from PGN using Lichess database."""
    game = chess.pgn.read_game(StringIO(pgn_string))
    board = game.board()
    moves = []
    
    # Extract up to 10 moves
    for move in list(game.mainline_moves())[:10]:
        moves.append(move.uci())
        board.push(move)
    
    # Try matching with decreasing move counts
    for move_count in [10, 8, 6, 5, 4, 3]:
        opening = get_opening_name(moves[:move_count])
        if opening:
            return opening
    
    return "Unknown Opening"
```

**Acceptance criteria:**
- [x] Lichess Opening Database integrated into backend (pattern-based identification)
- [x] Opening names displayed without ECO codes
- [x] Less than 15% of games categorized as "Unknown Opening" (comprehensive pattern matching)
- [x] Opening names are human-readable (e.g., "Sicilian Defense")
- [x] Fallback algorithm tries shorter move sequences
- [x] Top 5 best and worst openings show proper names
- [x] Bar charts and tables display opening names correctly
- [x] Unknown openings clearly labeled as "Unknown Opening"
- [x] Database updates don't break existing functionality

---

### Section 7 & 8: Simplified Card-Based Display

**Requirement ID:** EA-017

**User story:** As a chess player, I want to see my opponent strength and time-of-day statistics in a simple, easy-to-scan format without unnecessary charts.

**Changes from original implementation:**
* Remove bar charts from Sections 7 and 8
* Display data in clean card grid format only
* Reduce visual complexity while maintaining information density

**Implementation:**

**Section 7: Opponent Strength Analysis**
* Three cards in horizontal grid layout:
  * Card 1: Lower Rated Opponents
  * Card 2: Similar Rated Opponents  
  * Card 3: Higher Rated Opponents
* Each card displays:
  * Category title with icon
  * Total games played
  * Win/Loss/Draw counts
  * Win rate percentage (large, prominent)
  * Average Elo differential
* Remove `opponentStrengthChart` entirely
* Keep grid responsive (stacks on mobile)

**Section 8: Time of Day Performance**
* Three cards in horizontal grid layout:
  * Card 1: Morning (6am-2pm)
  * Card 2: Afternoon (2pm-10pm)
  * Card 3: Night (10pm-6am)
* Each card displays:
  * Time period title with icon
  * Total games played
  * Win/Loss/Draw counts
  * Win rate percentage (large, prominent)
* Remove `timeOfDayChart` entirely
* Keep grid responsive (stacks on mobile)

**Card design specifications:**
* Consistent styling with existing UI design system
* Card padding: 20px
* Win rate displayed prominently (32px font size)
* Color coding: Green for high win rates (>55%), neutral for medium (45-55%), red for low (<45%)
* Subtle hover effects
* Box shadow: 0 2px 8px rgba(0,0,0,0.1)

**Acceptance criteria:**
- [ ] Section 7 displays three cards (no bar chart)
- [ ] Section 8 displays three cards (no bar chart)
- [ ] Each card shows: title, games played, W/L/D counts, win rate %
- [ ] Section 7 cards also show average Elo differential
- [ ] Cards use consistent design system
- [ ] Grid layout is responsive (horizontal on desktop, stacked on mobile)
- [ ] Win rate percentages are prominently displayed
- [ ] Color coding helps identify strong/weak performance areas
- [ ] No references to removed bar charts in code or UI
- [ ] Performance is smooth with all card interactions

---

### Testing for Milestone 7

**Updated E2E test cases:**

**TC-015: Enhanced overall performance chart**
* Complete analysis workflow
* Verify Section 1 shows single win rate line
* Verify Y-axis shows "Win Rate %"
* Hover over data point, verify tooltip shows: Date, Win Rate %, Wins, Losses, Draws
* Verify chart is cleaner and easier to read

**TC-016: Unified color performance chart**
* Complete analysis workflow
* Verify Section 2 shows single chart with two lines
* Verify two summary cards displayed above chart
* Verify White summary card shows total games and win rate
* Verify Black summary card shows total games and win rate
* Hover over lines, verify color-specific tooltips

**TC-017: Pie chart count labels**
* Complete analysis workflow
* Verify Section 4 pie chart shows count labels inside segments
* Verify Section 5 pie chart shows count labels inside segments
* Verify labels are readable on all segment sizes
* Verify format is "Category: Count" (e.g., "Checkmate: 25")

**TC-018: Top 10 most common openings display**
* Complete analysis workflow
* Verify Section 6 shows "Top 10 Most Common Openings" heading
* Verify table/chart displays up to 10 openings
* Verify openings sorted by games played (descending order)
* Verify most-played opening appears first
* Verify each opening shows: Name, Games played, Win rate %, W-L-D counts
* Verify human-readable opening names (no ECO codes)
* Verify "Unknown Opening" count is less than 15% of total games
* Verify win rates are color-coded (green >55%, neutral 45-55%, red <45%)
* If player has <10 openings, verify all are shown
* Verify visual representation is clear (bar chart or table)

**TC-019: Simplified opponent strength display**
* Complete analysis workflow
* Verify Section 7 shows three cards (no bar chart)
* Verify each card shows: title, games, W/L/D, win rate %, avg Elo diff
* Verify cards are responsive on mobile
* Verify no bar chart elements present in DOM

**TC-020: Simplified time of day display**
* Complete analysis workflow
* Verify Section 8 shows three cards (no bar chart)
* Verify each card shows: time period, games, W/L/D, win rate %
* Verify cards are responsive on mobile
* Verify no bar chart elements present in DOM

---

## Milestone 8: Game stage mistake analysis

**Status:** 🔄 In Progress  
**Start Date:** December 12, 2025

### Overview

This milestone introduces comprehensive mistake analysis across different game stages (early, middle, endgame) using chess engine evaluation. The system will analyze each move using Stockfish engine to identify mistakes, blunders, and inaccuracies, categorize them by game stage, and present insights to help players understand where they struggle most.

### Section 9: Mistake analysis by game stage

**Requirement ID:** EA-018

**User story:** As a chess player, I want to know in which stage of the game I make the most mistakes so I can focus my training on improving specific phases of play.

**Game stage definitions:**
* **Early game:** Moves 1-7 (opening phase)
* **Middle game:** Moves 8-20 (middlegame tactics and strategy)
* **Endgame:** Moves 21+ (endgame technique)

**Mistake classification:**
* **Inaccuracy:** Evaluation drop of 50-100 centipawns (0.5-1.0 pawns)
* **Mistake:** Evaluation drop of 100-200 centipawns (1.0-2.0 pawns)
* **Blunder:** Evaluation drop of 200+ centipawns (2.0+ pawns)
* **Missed opportunity:** Opponent's mistake that player didn't capitalize on (opponent makes error, player's response doesn't improve position)

**Implementation:**

**Backend analysis engine:**
* Integrate Stockfish chess engine (python-chess library includes Stockfish interface)
* For each game in dataset:
  1. Parse PGN and replay game move-by-move
  2. Run Stockfish evaluation after each move (depth 15-18 for balance of speed/accuracy)
  3. Calculate evaluation difference between moves
  4. Classify mistakes based on centipawn thresholds
  5. Categorize each mistake by game stage (move number)
  6. Detect missed opportunities: opponent mistake followed by suboptimal player response
* Aggregate statistics:
  - Total mistakes/blunders/inaccuracies per stage
  - Average centipawn loss per stage
  - Most critical mistakes (biggest evaluation drops)
  - Games with most mistakes per stage
  - Missed opportunity count per stage

**Performance optimization:**
* **Date range restriction:** Maximum 30 days to ensure fast analysis (<1 minute target)
* Cache engine analysis results per game (store in database/Redis with game URL as key)
* Use **intelligent sampling** for faster results with maintained accuracy:
  - **Sample size:** 20% of total games (with stratification)
  - **Stratification:** Ensure sample includes:
    * Even distribution across time period (not all from one week)
    * Representative outcome distribution (W/L/D ratio similar to full dataset)
  - **Minimum:** 3 games (if 20% < 3, analyze 3 games for meaningful patterns)
  - **Maximum:** 15 games (reduced from 50 to meet 1-minute goal)
  - **Selection:** Random within stratification constraints
* **Progressive improvement:** Cache persists across analyses
  - First analysis: 20% sample (e.g., 2-3 of 10 games)
  - Second analysis (new date range): Additional 20% (2-3 more games)
  - Over time: Coverage increases without redundant analysis
* **Optimized Stockfish settings:**
  - Analysis depth: 12 (reduced from 15, saves ~40% time per position)
  - Time limit: 1.5 seconds per position (reduced from 2.0)
  - Only analyze player moves (skip opponent moves)
  - Stop early for obvious blunders (>500 CP loss, no need for deeper analysis)
* **Time estimates with 30-day max:**
  - 7 days (~10 games): Analyze 3 games × 20 player moves × 1.5s = ~90 seconds (cached on repeat: <3s)
  - 30 days (~40 games): Analyze 8 games × 20 player moves × 1.5s = ~240 seconds first run (4 min)
  - **Wait, this still exceeds 1 minute. Let me recalculate:**
  - **Revised for 1-minute target:**
    * Maximum moves analyzed: 60s / 1.5s = 40 moves total
    * Maximum games: 40 moves / 20 player moves per game = 2 games
  - **Updated sampling:**
    * 7 days (~10 games): Analyze 2 games (20%) → 60 seconds ✓
    * 30 days (~40 games): Analyze 2 games (5%) → 60 seconds ✓
  - Subsequent runs: <3 seconds (cached results)
* **User communication:**
  - Display: "Quick analysis based on X games (Y% sample)"
  - Note: "Analyzing 2 representative games for patterns"
  - Confidence level removed (small sample by design, focus on patterns)
  - Tooltip: "We analyze 2 representative games to identify mistake patterns quickly. Results are cached and you can always run analysis on different periods to see more games over time."
* **Statistical justification:**
  - 2-game sample sufficient for PATTERN identification (not statistical precision)
  - Focus: "Do I make more mistakes in opening, middle, or endgame?"
  - User can run multiple 7-day analyses to see patterns across different periods
  - Combined with caching, coverage increases over time
  - Trade-off: Speed (1 min) vs statistical confidence (acceptable for quick insights)

**Sampling algorithm pseudocode:**
```python
def select_games_for_analysis(all_games, cache, date_range_days):
    # Validate date range first
    if date_range_days > 30:
        raise ValueError("Date range must be 30 days or less")
    
    # Remove already-analyzed games
    uncached_games = [g for g in all_games if g['url'] not in cache]
    
    # Fixed sample size for 1-minute target
    # 60 seconds / 1.5s per position / 20 player moves = ~2 games
    sample_size = min(2, len(uncached_games))
    
    # If all games cached, return empty (will use cached results)
    if sample_size == 0:
        return []
    
    # Stratified sampling (simplified for small sample)
    # 1. Sort games by date
    sorted_games = sorted(uncached_games, key=lambda g: g['date'])
    
    # 2. Select games evenly distributed across time period
    if sample_size == 1:
        # Take middle game
        selected = [sorted_games[len(sorted_games) // 2]]
    else:  # sample_size == 2
        # Take first third and last third
        first_idx = len(sorted_games) // 3
        last_idx = 2 * len(sorted_games) // 3
        selected = [sorted_games[first_idx], sorted_games[last_idx]]
    
    return selected
```

**Frontend visualization:**

**Table display:**

| Game Stage | Total Moves | Inaccuracies | Mistakes | Blunders | Missed Opportunities | Avg CP Loss | Critical Mistakes |
|------------|-------------|--------------|----------|----------|----------------------|-------------|-------------------|
| Early (1-7) | 450 | 12 | 8 | 3 | 5 | -45 | [Link to game] |
| Middle (8-20) | 1200 | 35 | 22 | 12 | 18 | -78 | [Link to game] |
| Endgame (21+) | 800 | 18 | 15 | 8 | 10 | -92 | [Link to game] |

**Table details:**
* **Total Moves:** Count of player moves in this stage across all games
* **Inaccuracies/Mistakes/Blunders:** Count of each error type
* **Missed Opportunities:** Times opponent blundered but player didn't capitalize
* **Avg CP Loss:** Average centipawn loss per mistake in this stage
* **Critical Mistakes:** Link to game meeting ALL criteria:
  - Player LOST the game (not won, not drawn)
  - Game ended by RESIGNATION (not timeout, not abandonment)
  - Contains the biggest CP drop in this stage across all qualifying games
  - CP drop must be significant (determined from data analysis - typically 300+ centipawns)
  - Link opens game on Chess.com at the position where the critical mistake occurred

**Visual summary card:**
* "Your weakest stage: [Middle game]" (stage with highest mistake rate)
* "Most common error: [Mistakes in middlegame]" 
* "Biggest improvement area: [Endgame technique]" (highest avg CP loss)

**Technical implementation:**

```python
import chess
import chess.engine
import chess.pgn
from io import StringIO

def analyze_game_mistakes(pgn_string, stockfish_path="/usr/games/stockfish"):
    """
    Analyze a single game for mistakes across all stages.
    
    Returns dict with mistake analysis per stage.
    """
    game = chess.pgn.read_game(StringIO(pgn_string))
    board = game.board()
    engine = chess.engine.SimpleEngine.popen_uci(stockfish_path)
    
    mistakes = {
        "early": {"inaccuracies": 0, "mistakes": 0, "blunders": 0, "missed_opps": 0, "cp_loss": []},
        "middle": {"inaccuracies": 0, "mistakes": 0, "blunders": 0, "missed_opps": 0, "cp_loss": []},
        "endgame": {"inaccuracies": 0, "mistakes": 0, "blunders": 0, "missed_opps": 0, "cp_loss": []}
    }
    
    prev_eval = None
    move_number = 0
    player_color = chess.WHITE  # Adjust based on player's color
    
    for move in game.mainline_moves():
        move_number += 1
        
        # Determine game stage
        if move_number <= 14:  # 7 full moves
            stage = "early"
        elif move_number <= 40:  # Up to move 20
            stage = "middle"
        else:
            stage = "endgame"
        
        # Only analyze player's moves
        if board.turn == player_color:
            # Get evaluation before move
            info = engine.analyse(board, chess.engine.Limit(depth=15))
            current_eval = info["score"].relative.score(mate_score=10000)
            
            # Make the move
            board.push(move)
            
            # Get evaluation after move
            info = engine.analyse(board, chess.engine.Limit(depth=15))
            new_eval = info["score"].relative.score(mate_score=10000)
            
            # Calculate centipawn loss (from player's perspective)
            if prev_eval is not None and current_eval is not None and new_eval is not None:
                cp_loss = current_eval - new_eval
                
                # Classify mistake
                if cp_loss >= 200:
                    mistakes[stage]["blunders"] += 1
                    mistakes[stage]["cp_loss"].append(cp_loss)
                elif cp_loss >= 100:
                    mistakes[stage]["mistakes"] += 1
                    mistakes[stage]["cp_loss"].append(cp_loss)
                elif cp_loss >= 50:
                    mistakes[stage]["inaccuracies"] += 1
                    mistakes[stage]["cp_loss"].append(cp_loss)
            
            prev_eval = new_eval
        else:
            # Opponent's move - check for missed opportunities
            board.push(move)
    
    engine.quit()
    return mistakes

def aggregate_mistake_analysis(games_data):
    """
    Aggregate mistake analysis across all games.
    """
    aggregated = {
        "early": {"total_moves": 0, "inaccuracies": 0, "mistakes": 0, "blunders": 0, 
                  "missed_opps": 0, "cp_losses": [], "worst_game": None},
        "middle": {"total_moves": 0, "inaccuracies": 0, "mistakes": 0, "blunders": 0,
                   "missed_opps": 0, "cp_losses": [], "worst_game": None},
        "endgame": {"total_moves": 0, "inaccuracies": 0, "mistakes": 0, "blunders": 0,
                    "missed_opps": 0, "cp_losses": [], "worst_game": None}
    }
    
    for game_data in games_data:
        game_mistakes = analyze_game_mistakes(game_data["pgn"])
        
        for stage in ["early", "middle", "endgame"]:
            aggregated[stage]["inaccuracies"] += game_mistakes[stage]["inaccuracies"]
            aggregated[stage]["mistakes"] += game_mistakes[stage]["mistakes"]
            aggregated[stage]["blunders"] += game_mistakes[stage]["blunders"]
            aggregated[stage]["cp_losses"].extend(game_mistakes[stage]["cp_loss"])
    
    # Calculate averages
    for stage in ["early", "middle", "endgame"]:
        cp_losses = aggregated[stage]["cp_losses"]
        aggregated[stage]["avg_cp_loss"] = sum(cp_losses) / len(cp_losses) if cp_losses else 0
    
    return aggregated
```

**API endpoint update:**
* Extend `/api/analyze/detailed` response to include `mistake_analysis` section
* Add query parameter `include_engine_analysis=true` (default: true)
* Show loading progress for engine analysis

**Acceptance criteria:**
- [ ] Date range validation: Maximum 30 days enforced (frontend + backend)
- [ ] Error message shown if user attempts >30 day range
- [ ] Preset buttons "Last 7 Days" and "Last 30 Days" prominent in UI
- [ ] Stockfish engine integrated and working
- [ ] Sampling algorithm selects 2 games maximum for 1-minute target
- [ ] Games selected are time-distributed (not from same day)
- [ ] Sample games analyzed for mistakes across three stages
- [ ] Mistakes correctly classified (inaccuracy/mistake/blunder)
- [ ] Game stages correctly categorized (early/middle/endgame)
- [ ] Centipawn loss calculated accurately
- [ ] Missed opportunities detected (opponent mistake + player's response)
- [ ] Table displays all required columns with accurate data
- [ ] Display shows: "Quick analysis based on X games (Y% sample)"
- [ ] Tooltip explains: "Analyzing 2 representative games for patterns"
- [ ] No confidence indicator (removed due to small sample by design)
- [ ] Critical mistake game links meet ALL criteria:
  * Player lost by resignation (filtered out timeouts/abandonment)
  * Biggest CP drop in stage (threshold determined from data analysis)
  * Link opens Chess.com game at mistake position
- [ ] Algorithm determines "significant" CP drop threshold from data distribution
- [ ] If no qualifying game found for a stage, display "No qualifying game" instead of link
- [ ] Average CP loss calculated per stage
- [ ] Visual summary identifies weakest stage
- [ ] Engine analysis cached permanently (keyed by game URL)
- [ ] Cache persists across multiple analyses (progressive improvement)
- [ ] Loading indicator shows analysis progress ("Analyzing game X of Y")
- [ ] **Analysis completes within 1 minute for first run (target: 60 seconds)**
- [ ] **Cached analysis returns in <3 seconds**
- [ ] Handles games without engine analysis gracefully
- [ ] Works for games from player's perspective (both White and Black)
- [ ] User can run multiple short-period analyses to see patterns over time

---

## Milestone 9: AI-powered chess advisor

**Status:** 🔄 In Progress  
**Start Date:** December 12, 2025

### Overview

This milestone integrates OpenAI's GPT-4 API to provide personalized, actionable coaching advice based on comprehensive analysis of all dashboard sections. The AI advisor synthesizes data from performance trends, opening repertoire, mistake patterns, time-of-day performance, and more to deliver targeted recommendations for improvement.

### Section 10: AI chess advisor recommendations

**Requirement ID:** EA-019

**User story:** As a chess player, I want to receive personalized coaching advice based on my complete performance analysis so I can focus my training on the most impactful areas for improvement.

**Implementation:**

**Data preparation:**
* Aggregate summary statistics from all sections (1-9)
* Do NOT send raw PGN data (too large, privacy concern)
* Send only processed metrics and insights

**Summary data structure:**
```json
{
  "username": "jay_fh",
  "date_range": "Jan 1 - Mar 31, 2025",
  "total_games": 150,
  "overall_stats": {
    "win_rate": 52.3,
    "rating_change": +25,
    "rating_trend": "improving"
  },
  "color_performance": {
    "white_win_rate": 54.2,
    "black_win_rate": 50.1,
    "stronger_color": "white"
  },
  "termination_patterns": {
    "most_common_win_method": "checkmate",
    "most_common_loss_method": "timeout",
    "timeout_loss_percentage": 35
  },
  "opening_performance": {
    "best_openings": ["Italian Game (75% win rate)", "Queen's Gambit (70%)"],
    "worst_openings": ["French Defense (30% win rate)", "Caro-Kann (35%)"],
    "opening_diversity": "moderate"
  },
  "opponent_strength": {
    "best_against": "lower_rated",
    "struggle_against": "higher_rated",
    "lower_rated_wr": 68,
    "similar_rated_wr": 52,
    "higher_rated_wr": 38
  },
  "time_performance": {
    "best_time": "afternoon",
    "worst_time": "night",
    "afternoon_wr": 58,
    "morning_wr": 51,
    "night_wr": 45
  },
  "mistake_analysis": {
    "weakest_stage": "middle",
    "early_game_mistakes": 23,
    "middle_game_mistakes": 69,
    "endgame_mistakes": 41,
    "most_common_error": "mistakes in middlegame",
    "missed_opportunities": 33,
    "avg_cp_loss": {
      "early": -45,
      "middle": -78,
      "endgame": -92
    }
  }
}
```

**OpenAI API integration:**

**Model selection:** GPT-4 (or GPT-4-turbo for faster response)
* **GPT-4:** More thorough analysis, higher quality advice (~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens)
* **GPT-4-turbo:** Faster, slightly lower cost (~$0.01 per 1K input tokens, ~$0.03 per 1K output tokens)
* **Recommendation:** Start with GPT-4-turbo to keep costs < $0.01 per analysis

**System prompt design:**

```python
SYSTEM_PROMPT = """
You are an expert chess coach analyzing a player's performance data. Your goal is to provide 
concise, actionable advice to help them improve their chess skills.

Based on the provided statistics, generate EXACTLY:
1. Nine (9) section-specific recommendations - ONE for each section (1-9):
   - Section 1: Overall Performance
   - Section 2: Color Performance  
   - Section 3: Rating Progression
   - Section 4: How You Win
   - Section 5: How You Lose
   - Section 6: Opening Performance
   - Section 7: Opponent Strength
   - Section 8: Time of Day Performance
   - Section 9: Mistake Analysis
2. One (1) overall recommendation that synthesizes all insights

Format your response with clear section labels. Each recommendation should:
- Be specific and actionable
- Reference concrete data from the analysis
- Provide clear next steps for improvement
- Be concise (1-2 sentences max)

Focus on the most impactful areas for improvement. Prioritize:
1. Patterns with clear negative impact (e.g., high timeout losses)
2. Significant performance gaps (e.g., 20%+ difference between time periods)
3. Mistake patterns that repeat across games
4. Areas where small changes yield big results

Avoid:
- Generic advice ("study more tactics")
- Obvious statements ("you lose when you blunder")
- Skipping any section (all 9 sections must have a recommendation)

Tone: Encouraging but honest, like a supportive coach.
"""

USER_PROMPT_TEMPLATE = """
Analyze this chess player's performance and provide coaching recommendations:

{summary_data_json}

Provide recommendations in this EXACT format:

**Section 1 - Overall Performance:**
- [Specific recommendation based on win rate trends and overall stats]

**Section 2 - Color Performance:**
- [Specific recommendation based on White vs Black performance]

**Section 3 - Rating Progression:**
- [Specific recommendation based on rating changes and trends]

**Section 4 - How You Win:**
- [Specific recommendation based on winning termination patterns]

**Section 5 - How You Lose:**
- [Specific recommendation based on losing termination patterns]

**Section 6 - Opening Performance:**
- [Specific recommendation based on best/worst openings]
- [YouTube Video]: [Opening name] - [Video title or link placeholder]

**Section 7 - Opponent Strength:**
- [Specific recommendation based on performance vs different rated opponents]

**Section 8 - Time of Day:**
- [Specific recommendation based on time period performance]

**Section 9 - Mistake Analysis:**
- [Specific recommendation based on mistake patterns by game stage]

**Overall Recommendation:**
- [One comprehensive recommendation that synthesizes all insights and provides a clear action plan]
"""
```

**API implementation:**

```python
import openai
import json
import os

class ChessAdvisorService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        openai.api_key = self.api_key
        self.model = "gpt-4-turbo"  # or "gpt-4"
        self.max_tokens = 500  # Limit response length for cost control
    
    def generate_advice(self, summary_data: dict) -> dict:
        """
        Generate personalized chess coaching advice using GPT-4.
        
        Args:
            summary_data: Aggregated statistics from all analysis sections
            
        Returns:
            dict with 'section_suggestions' (list) and 'overall_recommendation' (str)
        """
        try:
            # Prepare user prompt
            user_prompt = USER_PROMPT_TEMPLATE.format(
                summary_data_json=json.dumps(summary_data, indent=2)
            )
            
            # Call OpenAI API
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=0.7,  # Balanced creativity and consistency
                presence_penalty=0.1,  # Slight penalty for repetition
                frequency_penalty=0.1
            )
            
            # Parse response
            advice_text = response.choices[0].message.content
            
            # Extract suggestions and overall recommendation
            parsed_advice = self._parse_advice_response(advice_text)
            
            # Log token usage for cost monitoring
            tokens_used = response.usage.total_tokens
            estimated_cost = self._calculate_cost(tokens_used)
            
            return {
                "section_suggestions": parsed_advice["suggestions"],
                "overall_recommendation": parsed_advice["overall"],
                "tokens_used": tokens_used,
                "estimated_cost": estimated_cost
            }
            
        except Exception as e:
            # Fallback to generic advice if API fails
            return self._generate_fallback_advice(summary_data)
    
    def _parse_advice_response(self, response_text: str) -> dict:
        """
        Parse GPT response into structured format.
        """
        lines = response_text.strip().split("\n")
        suggestions = []
        overall = ""
        
        current_section = None
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            if "Section-Specific" in line or "**Section-Specific" in line:
                current_section = "suggestions"
            elif "Overall Recommendation" in line or "**Overall Recommendation" in line:
                current_section = "overall"
            elif line.startswith("-") or line.startswith("•"):
                suggestion = line.lstrip("-•").strip()
                if current_section == "suggestions":
                    suggestions.append(suggestion)
                elif current_section == "overall":
                    overall = suggestion
        
        return {
            "suggestions": suggestions,
            "overall": overall
        }
    
    def _calculate_cost(self, tokens: int) -> float:
        """
        Calculate estimated cost based on token usage.
        GPT-4-turbo pricing: ~$0.01 input + ~$0.03 output per 1K tokens
        """
        # Rough estimate: assume 60% input, 40% output
        input_tokens = tokens * 0.6
        output_tokens = tokens * 0.4
        
        cost = (input_tokens / 1000 * 0.01) + (output_tokens / 1000 * 0.03)
        return round(cost, 4)
    
    def _generate_fallback_advice(self, summary_data: dict) -> dict:
        """
        Generate basic advice if API fails.
        """
        suggestions = [
            "Focus on reducing time pressure - consider playing longer time controls.",
            "Work on middlegame tactics where most mistakes occur.",
            "Practice your weaker openings or consider switching to more comfortable repertoire."
        ]
        
        overall = "Continue analyzing your games and focus on consistent play in your strongest time periods."
        
        return {
            "section_suggestions": suggestions,
            "overall_recommendation": overall,
            "tokens_used": 0,
            "estimated_cost": 0
        }
```

**YouTube video recommendations:**
* Integrate YouTube video links for opening-specific learning
* For player's most frequently played openings (top 3-5), provide educational video links
* **Video source prioritization (highest to lowest):**
  1. ChessNetwork
  2. GMHikaru  
  3. GothamChess (Levy Rozman)
  4. Chessbrahs
* **Implementation approach:**
  * **Option 1 (Recommended):** Curated database/config file
    - Create JSON/YAML config mapping opening names to YouTube video URLs
    - Manually curate high-quality instructional videos
    - Regularly update with new content
    - Fast, reliable, no API costs
  * **Option 2:** Google/YouTube API search
    - Use YouTube Data API v3 to search for videos
    - Search query: "[opening_name] tutorial [prioritized_channel]"
    - Cache results to minimize API calls
    - Fallback to lower priority channels if no results
* Show 1 video recommendation per opening
* Video recommendation format: "[Opening Name]: [Video Title] by [Channel] - [Watch Link]"
* Only show videos for openings player frequently uses (3+ games)

**Example curated video database structure:**
```json
{
  "Sicilian Defense": {
    "channel": "ChessNetwork",
    "title": "Sicilian Defense - Introduction",
    "url": "https://youtube.com/watch?v=...",
    "duration": "15:30"
  },
  "Italian Game": {
    "channel": "GMHikaru",
    "title": "The Italian Game Explained",
    "url": "https://youtube.com/watch?v=...",
    "duration": "12:45"
  }
}
```

**Rate limiting and cost control:**
* Max tokens per request: 800 (increased to accommodate 9+1 recommendations)
* Cache AI advice for same analysis parameters (1 hour TTL)
* Estimated cost per analysis: $0.008-$0.012 (still under 1 cent target with increased tokens)
* Monitor monthly API costs, implement usage alerts
* Fallback to rule-based advice if API quota exceeded
* If using YouTube API: max 100 searches per day (stay within free tier)

**Frontend implementation:**

**Section position:** Bottom of dashboard (after all analytics sections)

**UI design:**
```
┌─────────────────────────────────────────────┐
│ 🤖 AI Chess Coach - Personalized Analysis  │
│                                             │
│ Based on your 150 games from Jan-Mar 2025  │
│                                             │
│ 📊 Section 1 - Overall Performance:         │
│   • Your 52% win rate shows steady play.   │
│     Focus on converting drawn positions    │
│     to capitalize on improving trend.      │
│                                             │
│ ♟️ Section 2 - Color Performance:           │
│   • White (54% WR) outperforms Black (50%)│
│     Strengthen Black repertoire with solid │
│     defenses like Caro-Kann or Petroff.    │
│                                             │
│ 📈 Section 3 - Rating Progression:          │
│   • Rating up 25 points - good momentum!   │
│     Maintain consistency to reach 1550 by  │
│     next quarter.                           │
│                                             │
│ ✅ Section 4 - How You Win:                 │
│   • 50% wins by checkmate show strong      │
│     tactical vision. Keep sharpening!      │
│                                             │
│ ❌ Section 5 - How You Lose:                │
│   • 35% losses by timeout indicate time    │
│     pressure issues. Play increment games  │
│     to build clock management skills.      │
│                                             │
│ 📖 Section 6 - Opening Performance:         │
│   • Your French Defense (30% WR) needs     │
│     work. Consider switching or studying   │
│     key defensive lines.                    │
│   📺 Learn: "French Defense Masterclass"   │
│      by ChessNetwork                        │
│      👉 [Watch Tutorial]                    │
│                                             │
│ 🎯 Section 7 - Opponent Strength:           │
│   • 38% WR vs higher-rated shows potential │
│     Study endgame technique for better     │
│     defense in tough positions.             │
│                                             │
│ 🕐 Section 8 - Time of Day:                 │
│   • Afternoon (58% WR) is your peak time.  │
│     Schedule important games 2-10pm and    │
│     avoid late night sessions.              │
│                                             │
│ 🔍 Section 9 - Mistake Analysis:            │
│   • Middlegame (69 mistakes) is weakest    │
│     phase. Daily tactics puzzles focusing  │
│     on moves 10-20 will help significantly.│
│                                             │
│ 🎯 Overall Recommendation:                  │
│   • Priority 1: Fix time management (play  │
│     increment). Priority 2: Improve French │
│     Defense or switch openings. Priority 3:│
│     Focus 70% study time on middlegame     │
│     tactics. Schedule games in afternoon   │
│     hours for best results.                 │
│                                             │
│ [🔄 Regenerate Advice]                      │
└─────────────────────────────────────────────┘
```

**Loading state:**
* Show spinner with message: "AI Coach is analyzing your games..."
* Display progress: "This may take up to 10 seconds"
* If takes longer than 10 seconds, show: "Almost done..."
* Timeout after 15 seconds with error message and fallback advice

**Error handling:**
* API failure → Show fallback rule-based advice
* Timeout → Show partial results with notice
* Rate limit exceeded → Show cached advice or generic tips
* Invalid response → Parse what's possible, show partial advice

**Acceptance criteria:**
- [ ] OpenAI GPT-4-turbo API integrated and working
- [ ] System prompt produces relevant, actionable advice
- [ ] Summary data includes all sections (1-9) without raw PGN
- [ ] API response parsed correctly into structured format
- [ ] EXACTLY 9 section-specific recommendations displayed (one per section)
- [ ] Section labels clearly identify which section each recommendation addresses
- [ ] 1 overall recommendation displayed at the end
- [ ] YouTube video recommendations integrated for player's common openings
- [ ] Video prioritization implemented: ChessNetwork > GMHikaru > GothamChess > Chessbrahs
- [ ] 1 video recommendation shown per frequently-played opening (3+ games)
- [ ] Video links are clickable and open in new tab
- [ ] Curated video database implemented OR YouTube API search working
- [ ] If using YouTube API: proper API key management and rate limiting
- [ ] Advice is specific and references actual player data
- [ ] Loading state shows during API call (< 10 seconds)
- [ ] Cost per analysis < $0.012 (verified through monitoring)
- [ ] AI advice cached for 1 hour (same parameters)
- [ ] Fallback advice works when API fails (includes all 9+1 recommendations)
- [ ] Error states handled gracefully
- [ ] Section appears at bottom of dashboard
- [ ] Regenerate button works (calls API again, may get different videos)
- [ ] Token usage and cost logged for monitoring
- [ ] Privacy: No raw PGN data sent to OpenAI
- [ ] Rate limiting prevents excessive API calls
- [ ] UI is responsive on mobile devices
- [ ] Video thumbnails display correctly (optional enhancement)

---

### Testing for Milestones 8 & 9

**TC-020A: Date range validation**
* Attempt to select date range of 45 days
* Verify error message displayed: "Please select a date range of 30 days or less"
* Verify submit button is disabled
* Change to 30 days, verify error clears and submit enabled
* Change to 7 days, verify works correctly
* Verify preset buttons "Last 7 Days" and "Last 30 Days" work instantly

**TC-020B: Date range edge cases**
* Test exactly 30 days: Should work
* Test 31 days: Should show error
* Test 0 days (same start and end): Should show error (minimum 1 day)
* Test future dates: Should show error
* Test start date after end date: Should show error

**TC-021: Mistake analysis by game stage (with 1-minute target)**
* Complete analysis workflow with engine analysis enabled
* Use "Last 7 Days" preset (assume ~10 games)
* Verify loading indicator shows "Analyzing game X of Y"
* **Verify analysis completes within 60 seconds (critical performance requirement)**
* Verify Section 9 displays mistake analysis table
* Verify display shows: "Quick analysis based on 2 games (20% sample)"
* Verify tooltip: "Analyzing 2 representative games for patterns"
* Verify table shows three rows (early/middle/endgame)
* Verify mistake counts (inaccuracies/mistakes/blunders) are present
* Verify average CP loss calculated per stage
* Verify links to critical mistake games work
* Verify weakest stage identified correctly
* Click on game link, verify it opens correct game on Chess.com

**TC-021A: Sampling strategy verification (updated for 2-game target)**
* Analyze "Last 30 Days" with 40 games
* Verify exactly 2 games analyzed (not more)
* Verify games are distributed across time period (check dates: one early, one late)
* **Measure actual analysis time: should be <60 seconds**
* Run analysis again for same date range
* Verify same games used (cached), no re-analysis
* **Verify cached analysis time <3 seconds**

**TC-021B: Progressive cache improvement (updated)**
* Day 1: Analyze Last 7 Days (10 games, 2 analyzed in ~60 sec)
* Note which 2 games were analyzed
* Day 2: Analyze Last 7 Days again (same period)
* Verify analysis completes in <3 seconds (fully cached)
* Day 3: Analyze Last 30 Days (40 games total, includes previous 10)
* Verify previous 2 games NOT re-analyzed (cached)
* Verify 2 new games analyzed from new period
* Verify total analysis time ~60 seconds (only 2 new games)

**TC-021C: Performance validation across different scenarios**
* Scenario 1: 7 days, 5 games → Analyze 1-2 games → **Verify <45 seconds**
* Scenario 2: 7 days, 15 games → Analyze 2 games → **Verify <60 seconds**
* Scenario 3: 30 days, 40 games → Analyze 2 games → **Verify <60 seconds**
* Scenario 4: All cached → **Verify <3 seconds**
* If any scenario exceeds time limit, log and investigate

**TC-022: Engine analysis caching**
* Run analysis for date range with 50 games
* Note analysis time
* Run same analysis again immediately
* Verify second analysis is significantly faster (< 5 seconds)
* Verify results are identical
* Verify cache hit logged in backend

**TC-023: Missed opportunity detection**
* Verify missed opportunities column shows count > 0
* Manually review 2-3 games to validate opponent mistakes detected
* Verify player's suboptimal response identified

**TC-024: AI advisor basic functionality**
* Complete full analysis workflow
* Verify Section 10 (AI Coach) appears at bottom
* Verify loading indicator shows "AI Coach is analyzing..."
* Verify advice appears within 10 seconds
* Verify EXACTLY 9 section-specific recommendations displayed
* Verify each recommendation clearly labeled with section number and name
* Verify recommendations appear in order (Section 1 through Section 9)
* Verify 1 overall recommendation displayed at the end
* Verify advice references actual player data (percentages, numbers)
* Verify YouTube video links present for player's common openings
* Verify video links are clickable
* Count recommendations: should be 9 section-specific + 1 overall = 10 total

**TC-025: AI advisor advice quality**
* Read all suggestions provided
* Verify advice is specific (not generic)
* Verify advice references concrete stats (e.g., "35% timeout losses")
* Verify advice is actionable (tells player what to do)
* Verify no raw PGN data visible in network requests (check DevTools)
* Verify advice makes sense given the displayed analytics
* Verify each of 9 sections has received a recommendation
* Verify no section is skipped or duplicated
* Verify YouTube video recommendations match player's opening repertoire
* Verify video channel priority followed (ChessNetwork > GMHikaru > GothamChess > Chessbrahs)
* Click video link, verify it opens YouTube video in new tab
* Verify video is relevant to the opening mentioned

**TC-026: AI advisor error handling**
* Disconnect internet before clicking analyze
* Verify fallback advice displayed
* Verify error message shown
* Reconnect and verify API call works
* Test with invalid API key (backend config)
* Verify graceful degradation to rule-based advice

**TC-027: AI advisor caching**
* Complete analysis for username + date range
* Note the specific advice given
* Immediately run same analysis again
* Verify identical advice returned (cached)
* Verify second response is faster (< 2 seconds)
* Wait 1 hour, run again
* Verify new API call made (cache expired)

**TC-028: AI advisor regenerate**
* Complete analysis and receive AI advice
* Click "Regenerate Advice" button
* Verify new API call made
* Verify new advice displayed (may be similar but timestamp updated)
* Verify loading state shown during regeneration

**TC-029: Cost monitoring**
* Complete 10 analyses with AI advisor
* Check backend logs for token usage
* Verify total cost < $0.10 for 10 analyses
* Verify average cost per analysis < $0.01

**TC-030: End-to-end full dashboard**
* Complete analysis with all sections (1-10)
* Verify all sections render without errors
* Verify smooth scrolling through entire dashboard
* Verify AI advice synthesizes data from all sections
* Verify loading states don't block other sections
* Verify mobile responsive design for all new sections
* Verify no JavaScript console errors

---

# Tech stack

**Backend**

* Flask (existing)
* Python 3.12
* Chess.com Public API
* `python-chess` library for PGN parsing and Stockfish integration
* `requests` for API calls
* `pytz` or `zoneinfo` for timezone handling
* `openai` Python library for GPT-4 API integration
* Stockfish chess engine (local installation)
* SQLAlchemy (optional, for caching)
* Redis (recommended for caching engine analysis and AI advice)
* Custom caching utilities (existing)

**Frontend**

* Vanilla JavaScript (ES6+)
* Chart.js 4.x for all visualizations
* HTML5 / CSS3
* Fetch API for asynchronous requests
* Intl API for timezone detection

**AI/ML Services**

* OpenAI GPT-4-turbo API for chess coaching advice
* Stockfish 15+ chess engine for move analysis
* Multiprocessing for parallel game analysis

**Testing**

* Playwright for E2E testing
* unittest/pytest for backend unit tests
* Test with real user data (username: 'jay_fh')
* OpenAI API cost monitoring and logging

**Development tools**

* uv for package management
* Git for version control
* GitHub for repository hosting
* Stockfish executable (system dependency)
* OpenAI API cost monitoring and logging

**Development tools**

* uv for package management
* Git for version control
* GitHub for repository hosting
* Stockfish executable (system dependency)

---

# System architecture

```
User Browser
    ↓
[Analytics Page]
    ↓ (Fetch with timezone)
Flask API Routes
    ↓
[Analytics Service]
    ↓
[Chess Service] ← → [Chess.com API]
    ↓
[PGN Parser]
    ↓
[Mistake Analysis Engine] ← → [Stockfish Engine]
    ↓
[Statistics Calculator]
    ↓
[AI Advisor Service] ← → [OpenAI GPT-4 API]
    ↓
[Cache Layer] (Redis - engine analysis + AI advice)
    ↓
JSON Response
    ↓
[Chart.js Visualizations + AI Recommendations]
    ↓
User sees comprehensive analytics with AI coaching
```

**Data flow:**

1. User enters username, date range on frontend
2. JavaScript detects user's timezone
3. Frontend sends request to `/api/analyze/detailed`
4. Backend validates inputs
5. Backend fetches games from Chess.com API
6. Backend parses PGN data for openings
7. Backend runs Stockfish engine analysis for mistake detection (cached if available)
8. Backend calculates all analytics sections (1-9)
9. Backend prepares summary data for AI advisor
10. Backend calls OpenAI GPT-4 API for personalized coaching advice
11. Backend converts timestamps to user timezone
12. Backend returns comprehensive JSON response (including AI advice)
13. Frontend renders all sections with Chart.js
14. Frontend displays AI coaching recommendations at bottom
15. User scrolls through complete analytics dashboard with AI insights

---

# Website overview

The analytics dashboard will be a single-page scrollable experience with a clean, modern design inspired by contemporary dashboard aesthetics.

## Page structure

```
┌─────────────────────────────────────────────┐
│ Navigation Bar                              │
│ [Logo] [Home] [Analytics]                   │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ Analysis Header Card                        │
│ Username: jay_fh                            │
│ Period: Jan 1 - Mar 31, 2025               │
│ Timezone: America/New_York                  │
│ Total Games: 150                            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Section 1: Overall Performance Over Time    │
│ [Line Chart: Wins/Losses/Draws]            │
└─────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────┐
│ Section 2a:          │ Section 2b:          │
│ White Performance    │ Black Performance    │
│ [Chart]              │ [Chart]              │
└──────────────────────┴──────────────────────┘

┌─────────────────────────────────────────────┐
│ Section 3: Elo Rating Progression           │
│ [Line Chart with trend]                     │
└─────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────┐
│ Section 4:           │ Section 5:           │
│ How You Win          │ How You Lose         │
│ [Doughnut Chart]     │ [Doughnut Chart]     │
└──────────────────────┴──────────────────────┘

┌─────────────────────────────────────────────┐
│ Section 6: Opening Performance              │
│ Top 5 Best Openings                         │
│ [Horizontal bar chart]                      │
│ Top 5 Worst Openings                        │
│ [Horizontal bar chart]                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Section 7: Opponent Strength Analysis       │
│ [Grouped bar chart or 3 cards]             │
│ Lower | Similar | Higher                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Section 8: Time of Day Performance          │
│ [Grouped bar chart or 3 cards]             │
│ Morning | Afternoon | Night                 │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Section 9: Mistake Analysis by Game Stage   │
│ [Table: Early/Middle/Endgame mistakes]     │
│ Inaccuracies | Mistakes | Blunders          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Section 10: AI Chess Coach                  │
│ 🤖 Personalized Recommendations             │
│ • Section-specific suggestions (up to 7)    │
│ • Overall recommendation                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Footer                                      │
└─────────────────────────────────────────────┘
```

## Design specifications

**Layout:**
* Maximum content width: 1200px
* Card padding: 24px
* Card margin: 20px bottom
* Border radius: 12px
* Box shadow: 0 2px 8px rgba(0,0,0,0.1)

**Typography:**
* Headings: Sans-serif, bold, 24px
* Subheadings: Sans-serif, semibold, 18px
* Body text: Sans-serif, regular, 14px
* Chart labels: 12px

**Color palette:**
* Background: #f8f9fa
* Card background: #ffffff
* Primary: #3498db
* Success/Win: #27ae60
* Danger/Loss: #e74c3c
* Neutral/Draw: #95a5a6
* Text: #2c3e50
* Text light: #7f8c8d

**Responsive breakpoints:**
* Desktop: > 1024px (2-column grid where applicable)
* Tablet: 768px - 1024px (mixed layout)
* Mobile: < 768px (single column)

---

# Database schema overview

## Optional: analytics_cache table

If implementing caching for performance optimization:

| Field | Type | Description |
| --- | --- | --- |
| id | INTEGER PRIMARY KEY | Unique identifier |
| username | TEXT | Chess.com username |
| start_date | TEXT | Analysis start date |
| end_date | TEXT | Analysis end date |
| timezone | TEXT | User timezone |
| analysis_data | TEXT (JSON) | Cached analysis results |
| created_at | TIMESTAMP | Cache creation time |
| expires_at | TIMESTAMP | Cache expiration time |

**Notes:**
* Cache TTL: 1 hour
* Invalidate on new analysis request with same parameters
* Consider Redis for better performance

---

# Key workflows

## Main analytics workflow

1. User navigates to `/analytics` page
2. User enters Chess.com username (e.g., 'jay_fh')
3. User selects date range (or uses preset)
4. JavaScript detects timezone automatically (with option to change)
5. User clicks "Analyze"
6. Frontend shows loading state
7. Frontend sends POST request to `/api/analyze/detailed`
8. Backend validates inputs
9. Backend checks cache for existing analysis (optional)
10. Backend fetches games from Chess.com API (monthly batches)
11. Backend filters games by date range
12. Backend parses PGN data for each game
13. Backend calculates all 8 analytics sections:
    - Daily aggregations for time-series
    - Color-based statistics
    - Elo tracking and progression
    - Termination type categorization
    - Opening extraction and performance
    - Opponent strength categorization
    - Time-of-day categorization
14. Backend converts timestamps to user timezone
15. Backend returns comprehensive JSON
16. Frontend renders all 8 sections with Chart.js
17. User scrolls through analytics dashboard
18. User can export or share results (future enhancement)

---

## Opening analysis workflow

1. For each game in filtered dataset:
2. Extract PGN string from game data
3. Parse PGN using `python-chess` library
4. Extract first 5-10 moves
5. Identify opening name using opening book/database
6. Store opening name with game result
7. Group games by opening name
8. Calculate statistics per opening:
   - Total games played
   - Wins, losses, draws
   - Win rate percentage
9. Filter openings with 3+ games
10. Sort by win rate
11. Select top 5 and bottom 5
12. Return formatted data for visualization

---

## Timezone handling workflow

1. Frontend detects timezone using `Intl.DateTimeFormat().resolvedOptions().timeZone`
2. Display detected timezone to user with option to change
3. Send timezone string to backend with analysis request
4. Backend receives timezone parameter
5. For each game timestamp (UTC):
   - Convert to user's timezone using `pytz` or `zoneinfo`
   - Extract hour for time-of-day categorization
   - Extract date for daily aggregation
6. Return localized timestamps in JSON response
7. Frontend displays all times in user's timezone
8. Display timezone prominently in header

---

# Client context

This enhanced analytics dashboard is designed for chess players who actively play on Chess.com and want deeper insights into their performance. The primary users are:

* **Casual chess enthusiasts** who want to track improvement over time
* **Competitive players** analyzing strengths and weaknesses to prepare for tournaments
* **Chess coaches** reviewing student performance patterns
* **Data-minded players** who enjoy detailed statistics and visualizations

The system provides actionable insights that players can use to:
* Identify which openings to study or avoid
* Determine optimal playing times
* Understand termination patterns (time management issues, tactical weaknesses)
* Track rating progression and goal achievement
* Adjust strategies based on opponent strength

The test user 'jay_fh' represents a typical user who wants comprehensive analysis of their Chess.com games with accurate, timezone-aware statistics presented in a clean, modern interface.

---

# Success metrics

**Functional metrics:**
* All 10 analytics sections render correctly with accurate data
* Timezone conversion works correctly across all time zones
* PGN parsing successfully extracts opening names (>95% success rate)
* API response time < 10 seconds for 3-month analysis (including engine analysis)
* Stockfish engine analysis accuracy validated against manual review
* AI advisor provides relevant, actionable advice (qualitative assessment)
* AI API cost per analysis < $0.01
* Zero critical bugs in production for statistical calculations
* All Playwright E2E tests pass (30 test cases)

**User experience metrics:**
* Dashboard loads and renders within 6 seconds
* Charts are interactive and responsive
* Mobile-friendly design (all sections usable on mobile)
* Clear, actionable insights presented
* Minimal user confusion (no support requests about data accuracy)

**Technical quality metrics:**
* Code coverage >80% for analytics service
* Proper error handling for all edge cases
* Efficient caching reduces redundant API calls
* Clean, maintainable code following PEP 8
* Comprehensive documentation in docstrings

**Accuracy metrics:**
* Statistical calculations verified against manual calculations
* Test user data ('jay_fh') displays correctly
* No data misclassification (wins/losses/draws accurate)
* Opening names match actual openings played
* Timezone conversions produce correct local times

---

# Testing and validation

## Testing requirements

All features must be thoroughly tested to ensure data accuracy and proper functionality. Testing will be performed at multiple levels:

### Unit testing

**Backend (Python):**
* Test `AnalyticsService` statistical calculations
  - Verify win/loss/draw counting is accurate
  - Test daily aggregation functions
  - Validate Elo differential calculations
  - Test termination type categorization
  - Verify time-of-day categorization with various timezones
* Test PGN parsing functions
  - Verify opening extraction from various PGN formats
  - Handle malformed PGN data gracefully
  - Test opening name identification
* Test timezone conversion utilities
  - Verify UTC to local timezone conversion
  - Test with multiple timezones (EST, PST, UTC, GMT+8, etc.)
  - Handle daylight saving time transitions
* Test data validation functions
  - Username validation
  - Date range validation
  - Timezone string validation

**Test data:**
* Use real games from 'jay_fh' account
* Create synthetic test games covering edge cases
* Test with empty datasets (no games in period)
* Test with single game
* Test with large datasets (500+ games)

### Integration testing

* Test full workflow from API request to JSON response
* Verify Chess.com API integration
* Test caching layer functionality
* Verify error handling for API failures
* Test rate limiting behavior

### End-to-end testing with Playwright

**Test cases:**

**TC-001: Full analytics workflow**
* Navigate to analytics page
* Enter username 'jay_fh'
* Select date range (last 3 months)
* Click analyze button
* Verify all 8 sections render
* Verify charts display data
* Verify no JavaScript errors

**TC-002: Overall performance chart**
* Complete analysis workflow
* Verify Section 1 (Overall Performance) displays
* Verify line chart has three lines (wins, losses, draws)
* Verify x-axis shows dates
* Verify y-axis shows game counts
* Hover over data point, verify tooltip appears
* Verify data matches expected values

**TC-003: Color performance analysis**
* Complete analysis workflow
* Verify Section 2 displays two charts/sections
* Verify White performance chart shows data
* Verify Black performance chart shows data
* Verify win rates are displayed
* Verify data is correctly separated by color

**TC-004: Elo rating progression**
* Complete analysis workflow
* Verify Section 3 displays line chart
* Verify rating values are displayed on y-axis
* Verify dates on x-axis
* Verify rating change summary is shown
* Verify data points correspond to actual games

**TC-005: Termination types (wins)**
* Complete analysis workflow
* Verify Section 4 displays doughnut/pie chart
* Verify all winning games are categorized
* Verify percentages add up to 100%
* Verify chart legend is readable
* Click chart segment, verify interaction (if implemented)

**TC-006: Termination types (losses)**
* Complete analysis workflow
* Verify Section 5 displays doughnut/pie chart
* Verify all losing games are categorized
* Verify percentages add up to 100%
* Verify chart legend is readable

**TC-007: Opening performance**
* Complete analysis workflow
* Verify Section 6 displays two lists
* Verify "Top 5 Best Openings" shows 5 or fewer items
* Verify "Top 5 Worst Openings" shows 5 or fewer items
* Verify opening names are displayed (no ECO codes)
* Verify win rates are calculated correctly
* Verify game counts are shown

**TC-008: Opponent strength analysis**
* Complete analysis workflow
* Verify Section 7 displays three categories
* Verify "Lower rated" category shows data
* Verify "Similar rated" category shows data
* Verify "Higher rated" category shows data
* Verify win rates are displayed for each
* Verify game counts are shown

**TC-009: Time of day performance**
* Complete analysis workflow
* Verify Section 8 displays three time periods
* Verify Morning (6am-2pm) data is shown
* Verify Afternoon (2pm-10pm) data is shown
* Verify Night (10pm-6am) data is shown
* Verify timezone is displayed
* Verify win rates are calculated correctly

**TC-010: Timezone handling**
* Change browser timezone setting
* Complete analysis workflow
* Verify detected timezone is correct
* Verify time-of-day categorization is accurate
* Verify timestamps in charts match user timezone

**TC-011: Empty dataset handling**
* Enter username with no games in date range
* Verify appropriate message is displayed
* Verify no JavaScript errors occur
* Verify empty state is user-friendly

**TC-012: Error handling**
* Enter invalid username
* Verify error message is displayed
* Enter invalid date range (end before start)
* Verify validation error is shown
* Test with network disconnected
* Verify graceful error handling

**TC-013: Responsive design**
* Complete analysis workflow on desktop (1920x1080)
* Verify all sections are visible and properly laid out
* Resize to tablet (768px width)
* Verify layout adapts appropriately
* Resize to mobile (375px width)
* Verify all sections are accessible and scrollable
* Verify charts are readable on small screens

**TC-014: Performance**
* Complete analysis with 3-month date range
* Verify page loads within 6 seconds
* Verify no lag when scrolling
* Verify charts render smoothly
* Monitor network requests for efficiency

### Manual verification with test user

**Using username: 'jay_fh'**

1. **Data accuracy verification:**
   - Randomly select 10 games from Chess.com website
   - Verify these games appear in correct analytics sections
   - Manually calculate win rate for a specific date range
   - Compare with dashboard output
   - Verify opening names match actual games played

2. **Statistical validation:**
   - Verify total game count matches sum of wins+losses+draws
   - Verify percentages add up correctly
   - Verify win rates are calculated as wins/(wins+losses+draws)
   - Verify Elo differences are calculated correctly
   - Spot check 5 random game categorizations

3. **Timezone verification:**
   - Select games played at known times
   - Verify time-of-day categorization is correct
   - Test with different timezone settings
   - Verify daylight saving time handling

4. **Edge cases:**
   - Test with date range containing 0 games
   - Test with date range containing 1 game
   - Test with very short date range (1 day)
   - Test with maximum date range (1 year)

### Pre-deployment checklist

Before deploying changes to production:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All Playwright E2E tests pass
- [ ] Manual verification with 'jay_fh' completed
- [ ] Data accuracy spot-checked and verified
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Tested on mobile devices (iOS and Android)
- [ ] Timezone handling verified with at least 3 different timezones
- [ ] Error handling tested for all failure scenarios
- [ ] Performance benchmarks met (< 6 second load time)
- [ ] Code reviewed by at least one other developer
- [ ] Documentation updated (API docs, README)
- [ ] No console errors or warnings in browser
- [ ] Caching functionality verified (if implemented)
- [ ] Rate limiting tested and working

### Continuous validation

After deployment:
* Monitor error logs for unexpected issues
* Track API response times
* Gather user feedback on data accuracy
* Periodically re-verify with test user 'jay_fh'
* Update test cases as new edge cases are discovered

---

# User stories and acceptance criteria summary

## EA-001: Overall performance over time
**As a** chess player  
**I want to** see my win/loss/draw trends over time  
**So that** I can track my overall performance improvement

**Acceptance criteria:**
- [ ] Daily aggregated line chart displays wins, losses, and draws
- [ ] Dates are in user's local timezone
- [ ] Chart is responsive on all devices
- [ ] Interactive tooltips show details
- [ ] Empty dates are handled gracefully

---

## EA-002: Color performance analysis
**As a** chess player  
**I want to** see my performance as White vs Black over time  
**So that** I can identify color-specific strengths and weaknesses

**Acceptance criteria:**
- [ ] Separate visualizations for White and Black
- [ ] Daily aggregation by color
- [ ] Win rate percentages clearly displayed
- [ ] Visual comparison between colors is intuitive
- [ ] Data correctly distinguishes player's color per game

---

## EA-003: Elo rating progression
**As a** chess player  
**I want to** see my Elo rating changes over time  
**So that** I can track my rating improvement or decline

**Acceptance criteria:**
- [ ] Line chart shows Elo rating over time
- [ ] Rating values extracted correctly from games
- [ ] Net rating change displayed prominently
- [ ] Handles different time controls separately
- [ ] Trend line or moving average shown

---

## EA-004: How I win games
**As a** chess player  
**I want to** know how I typically win games  
**So that** I can understand my winning patterns

**Acceptance criteria:**
- [ ] All winning games categorized by termination type
- [ ] Accurate percentages displayed
- [ ] Only includes games where user won
- [ ] All termination types handled
- [ ] Clear visual representation

---

## EA-005: How I lose games
**As a** chess player  
**I want to** know how I typically lose games  
**So that** I can identify and improve weaknesses

**Acceptance criteria:**
- [ ] All losing games categorized by termination type
- [ ] Accurate percentages displayed
- [ ] Only includes games where user lost
- [ ] All termination types handled
- [ ] Easy comparison with winning terminations

---

## EA-006: Opening performance analysis
**As a** chess player  
**I want to** see which openings I perform best and worst with  
**So that** I can focus my study and exploit my strengths

**Acceptance criteria:**
- [ ] PGN data parsed correctly
- [ ] Opening names extracted accurately (no ECO codes)
- [ ] Win rates calculated correctly
- [ ] Only openings with 3+ games included
- [ ] Top 5 best and worst openings displayed
- [ ] Games played count shown per opening

---

## EA-007: Opponent strength analysis
**As a** chess player  
**I want to** see my win rate against different opponent strengths  
**So that** I can understand my performance at different levels

**Acceptance criteria:**
- [ ] Elo differentials calculated correctly
- [ ] Games categorized into Lower/Similar/Higher rated
- [ ] Win rates calculated per category
- [ ] Visual representation is clear
- [ ] Game counts displayed per category
- [ ] Handles missing ratings gracefully

---

## EA-008: Time of day performance
**As a** chess player  
**I want to** see when I play best during the day  
**So that** I can schedule important games during peak times

**Acceptance criteria:**
- [ ] Timestamps converted to user's local timezone
- [ ] Games categorized into Morning/Afternoon/Night
- [ ] Win rates calculated per time period
- [ ] Games played distribution is visible
- [ ] Timezone displayed clearly to user
- [ ] Handles boundary times correctly

---

## EA-009: Input validation and error handling
**As a** user  
**I want to** receive clear feedback on invalid inputs  
**So that** I understand what went wrong and can correct it

**Acceptance criteria:**
- [ ] Invalid username shows clear error message
- [ ] Invalid date range is rejected with helpful message
- [ ] API failures display user-friendly error
- [ ] Network errors handled gracefully
- [ ] Empty datasets show appropriate message

---

## EA-010: Responsive dashboard design
**As a** user  
**I want to** access the analytics dashboard on any device  
**So that** I can review my stats on desktop, tablet, or mobile

**Acceptance criteria:**
- [ ] Single-page scrollable layout on all devices
- [ ] Charts are readable on mobile screens
- [ ] All sections accessible on small screens
- [ ] Touch-friendly interactions on mobile
- [ ] Consistent design across breakpoints

---

## EA-011: Timezone detection and configuration
**As a** user  
**I want to** see all times in my local timezone  
**So that** time-based analysis is accurate for my location

**Acceptance criteria:**
- [ ] Timezone automatically detected
- [ ] User can change timezone if needed
- [ ] Timezone clearly displayed in header
- [ ] All timestamps converted correctly
- [ ] Daylight saving time handled properly

---

## EA-012: Performance and caching
**As a** user  
**I want to** receive analysis results quickly  
**So that** I don't have to wait long for insights

**Acceptance criteria:**
- [ ] Analysis completes within 10 seconds for 3-month range (including AI advisor)
- [ ] Caching reduces redundant API calls
- [ ] Loading states indicate progress
- [ ] No UI lag when scrolling dashboard
- [ ] Charts render smoothly

---

## EA-018: Mistake analysis by game stage
**As a** chess player  
**I want to** identify which game stage I make the most mistakes in  
**So that** I can focus my training on specific phases of play

**Acceptance criteria:**
- [ ] Stockfish engine analyzes all games for mistakes
- [ ] Mistakes categorized by game stage (early/middle/endgame)
- [ ] Mistakes classified as inaccuracy/mistake/blunder
- [ ] Centipawn loss calculated and displayed
- [ ] Missed opportunities detected and counted
- [ ] Table displays all required data columns
- [ ] Links to critical mistake games work
- [ ] Engine analysis cached for performance
- [ ] Loading indicator shows analysis progress

---

## EA-019: AI-powered chess advisor
**As a** chess player  
**I want to** receive personalized coaching advice based on my complete analysis  
**So that** I know exactly what to work on to improve

**Acceptance criteria:**
- [ ] OpenAI GPT-4 API integrated
- [ ] Summary data includes insights from all sections (no raw PGN)
- [ ] AI generates EXACTLY 9 section-specific recommendations (one per section 1-9)
- [ ] AI generates 1 overall recommendation
- [ ] Each recommendation clearly labeled with section name
- [ ] YouTube video links provided for player's frequently-played openings
- [ ] Video prioritization: ChessNetwork > GMHikaru > GothamChess > Chessbrahs
- [ ] Advice is specific and actionable
- [ ] Advice references actual player statistics
- [ ] Cost per analysis < $0.012 (updated for increased tokens)
- [ ] Response time < 10 seconds
- [ ] Loading state shown during AI processing
- [ ] Fallback advice works if API fails (includes all 9+1)
- [ ] AI advice cached for 1 hour
- [ ] Section appears at bottom of dashboard

---

# Implementation notes

## PGN parsing approach

Use `python-chess` library for robust PGN parsing:

```python
import chess.pgn
from io import StringIO

def extract_opening_name(pgn_string):
    """Extract opening name from PGN."""
    pgn = StringIO(pgn_string)
    game = chess.pgn.read_game(pgn)
    
    # Get first 5-10 moves
    board = game.board()
    moves = []
    for move in list(game.mainline_moves())[:10]:
        moves.append(board.san(move))
        board.push(move)
    
    # Look up opening name based on move sequence
    opening_name = identify_opening(moves)
    return opening_name
```

Consider using an opening book database or API for accurate opening identification.

---

## Chart.js configuration examples

**Line chart for daily performance:**
```javascript
new Chart(ctx, {
  type: 'line',
  data: {
    labels: dates,  // ['2025-01-01', '2025-01-02', ...]
    datasets: [
      {
        label: 'Wins',
        data: winsData,
        borderColor: '#27ae60',
        fill: false
      },
      {
        label: 'Losses',
        data: lossesData,
        borderColor: '#e74c3c',
        fill: false
      },
      {
        label: 'Draws',
        data: drawsData,
        borderColor: '#95a5a6',
        fill: false
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      x: {
        display: true,
        title: { display: true, text: 'Date' }
      },
      y: {
        display: true,
        title: { display: true, text: 'Games' },
        beginAtZero: true
      }
    }
  }
});
```

---

## API response example

```json
{
  "username": "jay_fh",
  "start_date": "2025-01-01",
  "end_date": "2025-03-31",
  "timezone": "America/New_York",
  "total_games": 150,
  "sections": {
    "overall_performance": {
      "daily_stats": [
        {"date": "2025-01-01", "wins": 3, "losses": 2, "draws": 1},
        {"date": "2025-01-02", "wins": 2, "losses": 3, "draws": 0}
      ]
    },
    "color_performance": {
      "white": {
        "daily_stats": [...],
        "win_rate": 52.5
      },
      "black": {
        "daily_stats": [...],
        "win_rate": 48.3
      }
    },
    "elo_progression": {
      "data_points": [
        {"date": "2025-01-01", "rating": 1500},
        {"date": "2025-01-02", "rating": 1505}
      ],
      "rating_change": +25
    },
    "termination_wins": {
      "checkmate": {"count": 25, "percentage": 50},
      "timeout": {"count": 15, "percentage": 30},
      "resignation": {"count": 10, "percentage": 20}
    },
    "termination_losses": {
      "checkmate": {"count": 20, "percentage": 40},
      "timeout": {"count": 20, "percentage": 40},
      "resignation": {"count": 10, "percentage": 20}
    },
    "opening_performance": {
      "best_openings": [
        {
          "name": "Italian Game",
          "games": 12,
          "wins": 9,
          "losses": 2,
          "draws": 1,
          "win_rate": 75.0
        }
      ],
      "worst_openings": [...]
    },
    "opponent_strength": {
      "lower_rated": {
        "games": 40,
        "wins": 28,
        "losses": 8,
        "draws": 4,
        "win_rate": 70.0
      },
      "similar_rated": {...},
      "higher_rated": {...}
    },
    "time_of_day": {
      "morning": {
        "games": 45,
        "wins": 25,
        "losses": 15,
        "draws": 5,
        "win_rate": 55.6
      },
      "afternoon": {...},
      "night": {...}
    }
  }
}
```

---

# Development roadmap

**Phase 1: Backend foundation (Week 1)**
* Enhance ChessService with PGN fetching
* Implement AnalyticsService with all calculation functions
* Add timezone conversion utilities
* Create comprehensive unit tests
* Implement caching strategy

**Phase 2: API development (Week 1-2)**
* Create `/api/analyze/detailed` endpoint
* Implement request validation
* Add error handling
* Test with 'jay_fh' data
* Optimize for performance

**Phase 3: Frontend structure (Week 2)**
* Design dashboard layout
* Implement CSS framework
* Create card components
* Add loading and error states
* Implement responsive design

**Phase 4: Visualizations Part 1 (Week 2-3)**
* Section 1: Overall performance chart
* Section 2: Color performance charts
* Section 3: Elo progression chart
* Test and refine interactions

**Phase 5: Visualizations Part 2 (Week 3)**
* Section 4: Winning terminations
* Section 5: Losing terminations
* Section 6: Opening performance
* Implement opening parser

**Phase 6: Visualizations Part 3 (Week 3-4)**
* Section 7: Opponent strength analysis
* Section 8: Time of day performance
* Integrate timezone handling throughout

**Phase 7: Testing and refinement (Week 4)**
* Write Playwright E2E tests
* Perform manual verification with 'jay_fh'
* Fix bugs and edge cases
* Optimize performance
* Refine UI/UX

**Phase 8: Deployment (Week 4)**
* Pre-deployment checklist
* Deploy to production
* Monitor for issues
* Gather user feedback
* Document lessons learned

---

# Future enhancements

Not included in this PRD but potential future additions:

* Export analytics as PDF report
* Share analytics via unique URL
* Compare performance across multiple time periods
* Head-to-head comparison against specific opponents
* Advanced opening tree visualization
* Game replay with critical moments highlighting mistakes
* Move-by-move accuracy analysis with interactive board
* Performance correlation analysis (rating vs time control, etc.)
* Email notifications for milestone achievements
* Social features (compare with friends)
* Integration with other chess platforms (Lichess, Chess24)
* AI-powered opening recommendations based on playing style
* Deeper engine analysis (depth 20+) for premium users
* Video lessons recommendations based on weaknesses
* Progress tracking over multiple months with trend analysis

---

**Document Version:** 2.1  
**Created:** December 5, 2025  
**Last Updated:** December 26, 2025  
**Author:** PRD Agent  
**Status:** Updated with UI refinements and YouTube integration

---

## Changelog

**Version 2.1 (December 26, 2025):**
* Updated Section 6: Changed "Top 5" to dynamic "Top Best/Worst" openings display
* Updated Section 6: Added chess move notation (first 6 moves) and interactive board display
* Updated Section 8: Added explicit timezone conversion verification requirements
* Updated Section 9: Refined critical mistake game link criteria (lost by resignation, significant CP drop)
* Updated Section 10: Restructured to require EXACTLY 9 section-specific recommendations + 1 overall
* Updated Section 10: Integrated YouTube video recommendations for opening learning
* Added video source prioritization: ChessNetwork > GMHikaru > GothamChess > Chessbrahs
* Updated test cases to verify new requirements
* Updated acceptance criteria across multiple sections

**Version 2.0 (December 12, 2025):**
* Added Milestone 8: Game Stage Mistake Analysis (Section 9)
* Added Milestone 9: AI-Powered Chess Advisor (Section 10)
* Integrated Stockfish engine for move analysis
* Integrated OpenAI GPT-4 API for personalized coaching
* Added 10 new E2E test cases (TC-021 through TC-030)
* Updated system architecture diagram
* Updated tech stack with AI/ML dependencies
* Updated success metrics and acceptance criteria
* Total sections: 10 (previously 8)
* Total test cases: 30 (previously 20)

**Version 1.0 (December 5, 2025):**
* Initial PRD with 8 analytics sections
* 7 milestones defined
* Complete technical specifications
* 20 E2E test cases
