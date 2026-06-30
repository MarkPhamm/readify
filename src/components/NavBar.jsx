import { motion } from 'framer-motion'

export default function NavBar({ onAddClick }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a className="brand" href="./">
          <span className="brand-mark">R</span>
          <span className="brand-name">Readify</span>
        </a>
        <motion.button
          type="button"
          className="nav-add-btn"
          onClick={onAddClick}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          Add reading
        </motion.button>
      </div>
    </header>
  )
}
