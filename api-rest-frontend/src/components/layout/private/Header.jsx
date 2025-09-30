import React from 'react'
import { Nav } from './Nav'

export const Header = () => {
  return (
    <header className="layout__navbar">

      <div className="navbar__header">
        <a href="/social" className="navbar__title">ColorFullChat</a>
      </div>

      <Nav />

    </header>
  )
}

