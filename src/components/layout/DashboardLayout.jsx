import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Menu } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Link } from 'react-router-dom';

export const DashboardLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isSidebarOpen]);

    return (
        <div className="flex min-h-screen bg-brand-black text-white selection:bg-brand-orange selection:text-white relative">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-brand-black border-b border-white/5 z-40 flex items-center px-4">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 -ml-2 text-brand-muted hover:text-white transition-colors"
                >
                    <Menu size={24} />
                </button>
                <div className="ml-2">
                    <Link to="/">
                        <Logo className="h-10 w-auto object-contain" />
                    </Link>
                </div>
            </header>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main
                className={`flex-1 transition-all duration-300 
                    lg:ml-64 
                    p-4 lg:p-8 
                    mt-16 lg:mt-0 
                    overflow-y-auto w-full`}
            >
                <div className="max-w-6xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};
