import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import { initSupabase } from './services/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

interface CustomWindow extends Window {
    supabase?: { createClient: (url: string, key: Object) => SupabaseClient };
}
declare const window: CustomWindow;

function startApp() {
    if (window.supabase) {
        // Initialize Supabase using the global loaded via CDN in index.html
        initSupabase(window.supabase);

        ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    } else {
        console.warn('Supabase JS not loaded yet, retrying in 100ms...');
        setTimeout(startApp, 100);
    }
}

startApp();
