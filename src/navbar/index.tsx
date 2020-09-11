import React from 'react';
import './navbar.css';

const Navbar = ({onFilterChange,activeFilter}:any) => {
  return (
    <header className="header-wrapper">
      <nav className="header-filter-wrapper">
        <p className={`header-filter ${activeFilter==='all_events'?'active':''}`} onClick={ ()=>onFilterChange('all_events') }>All Events</p>
        <p className={`header-filter ${activeFilter==='my_events'?'active':''}`} onClick={ ()=>onFilterChange('my_events') }>My Events</p>
      </nav>
    </header>  
  )
}

export default Navbar;