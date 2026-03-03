import React from 'react';
import { Link } from 'react-router-dom';
import { APP_TITLES } from '../constants/app';

const Header: React.FC = () => {
    return (
        <header className="toby-header">
            <h1 className="toby-header-logo">
                <Link to="/" style={{
                    textDecoration: 'none',
                    color: '#4A90E2',
                    fontWeight: 'bold',
                    letterSpacing: '2px'
                }}>TOBY</Link>
            </h1>
            <nav className="toby-header-nav">
                <Link to="/number">{APP_TITLES.NUMBER}</Link>
                <Link to="/ball">{APP_TITLES.BALL}</Link>
                <Link to="/seat">{APP_TITLES.SEAT}</Link>
            </nav>
        </header>
    );
};

export default Header;
