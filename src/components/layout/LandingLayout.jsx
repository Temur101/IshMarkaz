import { Navbar } from './Navbar';

export const LandingLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-brand-black text-white selection:bg-brand-orange selection:text-white relative overflow-x-hidden">
            <Navbar />
            <main className="pt-20">
                {children}
            </main>
            <footer className="border-t border-white/5 py-12 text-center text-brand-muted text-sm">
                <p>© 2026 IshMarkaz. So'zda emas, amalda.</p>
            </footer>
        </div>
    );
};
