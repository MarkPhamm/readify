import { motion } from 'framer-motion'

export default function Filters({ query, onQueryChange, tags, activeTag, onSelectTag }) {
  return (
    <section className="panel filters" aria-label="Filter readings">
      <div className="filters-head">
        <h2 className="panel-title">Filter</h2>
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm5 12l4 4"
            />
          </svg>
          <input
            type="search"
            className="search-input"
            placeholder="Search titles, notes, tags…"
            aria-label="Search readings"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          {query ? (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onClick={() => onQueryChange('')}
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      {tags.length > 0 ? (
        <div className="tag-list">
          <motion.button
            type="button"
            className={`tag-chip ${activeTag === null ? 'active' : ''}`}
            onClick={() => onSelectTag(null)}
            aria-pressed={activeTag === null}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            All
          </motion.button>
          {tags.map(({ tag, count }) => (
            <motion.button
              key={tag}
              type="button"
              className={`tag-chip ${activeTag === tag ? 'active' : ''}`}
              onClick={() => onSelectTag(tag)}
              aria-pressed={activeTag === tag}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              layout
            >
              {tag}
              <span className="tag-count">{count}</span>
            </motion.button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
