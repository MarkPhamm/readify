import { motion } from 'framer-motion'

export default function TagFilter({ tags, activeTag, onSelect }) {
  if (tags.length === 0) return null

  return (
    <section className="panel tag-filter">
      <h2 className="panel-title">Topics</h2>
      <div className="tag-list">
        <motion.button
          type="button"
          className={`tag-chip ${activeTag === null ? 'active' : ''}`}
          onClick={() => onSelect(null)}
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
            onClick={() => onSelect(tag)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            layout
          >
            {tag}
            <span className="tag-count">{count}</span>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
