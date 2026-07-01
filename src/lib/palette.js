// Single source of truth for the activity-calendar color ramp. Kept in JS
// because react-activity-calendar takes its theme as a prop.
//
// Index 0 is the "no reads" cell — it must sit clearly ABOVE the panel
// background (--bg-elev #161b22) so the empty grid reads like GitHub's blank
// contribution graph rather than a void. Indices 1–4 are the green scale and
// mirror the accent tokens in styles.css (--accent / --accent-strong).
export const CALENDAR_LEVELS = ['#262d38', '#0e4429', '#026d33', '#26a641', '#39d353']
