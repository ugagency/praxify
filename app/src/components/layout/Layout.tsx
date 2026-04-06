import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="app-grid">
            <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={closeSidebar}></div>
            <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
            <main className="main-content">
                <Topbar toggleSidebar={toggleSidebar} />
                <section className="content">
                    {children}
                </section>
            </main>
        </div>
    );
};
