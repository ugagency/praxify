import type { CSSProperties } from 'react';

// Movido para o CSS como `.calendar-wrapper` para herdar var(--bg-panel) dinamicamente.
export const calendarContainerStyle: CSSProperties = {};

export const calendarCss = `
/* ===== Responsive Theme for react-big-calendar (Dashboard scoped) ===== */
.calendar-wrapper {
  padding: 0.75rem;
  overflow: hidden;
  height: 450px;
  border-radius: 18px;
  border: 1px solid var(--border-color);
  background: var(--bg-panel);
  box-shadow: 0 16px 40px rgba(0,0,0,0.05);
}

.rbc-calendar {
  font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  color: var(--text-main);
  height: 100%;
}

/* RBC layout fix (evita grid "colapsada" / visual quebrado) */
.rbc-month-view,
.rbc-time-view,
.rbc-agenda-view {
  height: 100%;
  min-height: 0;
}

/* Toolbar label */
.rbc-toolbar {
  margin-bottom: 10px;
}
.rbc-toolbar-label {
  text-transform: capitalize;
  font-family: 'Clash Grotesk', Inter, system-ui, sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
}

/* Buttons (toolbar) */
.rbc-btn-group button {
  color: var(--text-main);
  border: 1px solid var(--border-color);
  background: var(--bg-darker);
  padding: 6px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform .15s ease, background .15s ease, border-color .15s ease;
}
.rbc-btn-group button:hover {
  background: var(--border-color);
  border-color: var(--text-dim);
  transform: translateY(-1px);
}
.rbc-btn-group button.rbc-active {
  background: var(--primary-dim);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow: none;
}

/* Frame */
.rbc-month-view,
.rbc-time-view,
.rbc-agenda-view {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: transparent;
}

/* Headers */
.rbc-header {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
  font-weight: 700;
  letter-spacing: .2px;
  color: var(--text-muted);
  text-transform: capitalize;
}
.rbc-header + .rbc-header {
  border-left: 1px solid var(--border-color);
}

/* Grid lines */
.rbc-month-view,
.rbc-day-bg,
.rbc-month-row,
.rbc-time-content,
.rbc-timeslot-group {
  border-color: var(--border-color) !important;
}

/* Date cell */
.rbc-date-cell {
  padding: 10px 10px 6px;
  font-weight: 800;
  color: var(--text-muted);
}
.rbc-off-range-bg {
  background: var(--table-stripe);
}
.rbc-off-range .rbc-date-cell {
  color: var(--text-dim);
}

/* Today */
.rbc-today {
  background: var(--primary-dim) !important;
  box-shadow: inset 0 0 0 1px var(--primary);
}

/* Hover day cell */
.rbc-day-bg:hover {
  background: var(--table-stripe);
}

/* Show more */
.rbc-show-more {
  color: var(--primary);
  font-weight: 800;
  background: var(--primary-dim);
  border: 1px solid var(--primary);
  padding: 2px 8px;
  border-radius: 999px;
  display: inline-block;
  margin-top: 3px;
}

/* Events (chip style) */
.rbc-event {
  background-color: var(--primary-dim) !important;
  border: 1px solid var(--primary) !important;
  color: var(--text-main) !important;
  border-radius: 999px !important;
  padding: 2px 10px !important;
  font-size: 0.78rem !important;
  line-height: 1.35 !important;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.rbc-event:focus { outline: none; }
.rbc-event.rbc-selected {
  outline: 2px solid var(--primary);
  transform: translateY(-1px);
}

.rbc-event.done-event {
  background-color: var(--primary-dim) !important;
  border-color: var(--success) !important;
  color: var(--text-main) !important;
}
.rbc-event.late-event {
  background-color: var(--primary-dim) !important;
  border-color: var(--danger) !important;
  color: var(--text-main) !important;
}

/* Month row content spacing */
.rbc-row-content {
  padding: 0 6px 8px;
}
.rbc-row-segment {
  padding: 2px 0;
}

/* Agenda refinements */
.rbc-agenda-view {
  margin-top: 0.5rem;
}
.rbc-agenda-table {
  border-collapse: separate !important;
  border-spacing: 0;
  width: 100%;
  border: none !important;
}
.rbc-agenda-table thead > tr > th {
  background: var(--bg-darker) !important;
  color: var(--text-muted) !important;
  padding: 1rem !important;
  font-weight: 800 !important;
  text-transform: uppercase;
  font-size: 0.78rem !important;
  border-bottom: 1px solid var(--border-color) !important;
  border-left: none !important;
  border-right: none !important;
}
.rbc-agenda-table tbody > tr {
  transition: background 0.2s;
  border-bottom: 1px solid var(--border-color) !important;
  cursor: pointer;
}
.rbc-agenda-table tbody > tr:hover {
  background: var(--table-stripe);
}
.rbc-agenda-table td {
  padding: 1rem !important;
  color: var(--text-main) !important;
  font-size: 0.9rem !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
}
.rbc-agenda-date-cell {
  font-weight: 900 !important;
  color: var(--primary) !important;
  white-space: nowrap;
  text-transform: capitalize;
}
.rbc-agenda-time-cell, th.rbc-agenda-time-cell {
  display: none !important;
}
.rbc-agenda-event-cell {
  font-weight: 600 !important;
}
`;