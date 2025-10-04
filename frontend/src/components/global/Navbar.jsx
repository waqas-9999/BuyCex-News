import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-black text-white border-b border-[#454545]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block w-2 h-2 bg-[#efb81c] rounded-sm mr-1" />
          BuyCex News
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-[#efb81c]">Home</Link>
          <Link to="/admin/articles" className="hover:text-[#efb81c]">Admin</Link>
          <Link to="/admin/analytics" className="hover:text-[#efb81c]">Analytics</Link>
        </nav>
      </div>
    </header>
  )
}

export default Navbar