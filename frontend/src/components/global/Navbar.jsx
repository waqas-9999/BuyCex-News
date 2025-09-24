import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block w-2 h-2 bg-indigo-600 rounded-sm mr-1" />
          BuyCex News
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <Link to="/admin/articles" className="hover:text-indigo-600">Admin</Link>
        </nav>
      </div>
    </header>
  )
}

export default Navbar