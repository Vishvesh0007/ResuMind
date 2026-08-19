import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
    const { auth } = usePuterStore();

    return (
        <nav className="navbar">
            <Link to="/" className="flex items-center gap-2.5 group">
                <img src="/icons/resumind-icon.png" alt="ResuMind Logo" className="w-8 h-8 rounded-lg transition-transform group-hover:scale-105" />
                <p className="text-2xl font-bold text-gradient">ResuMind</p>
            </Link>

            <div className="flex items-center gap-3">
                <Link to="/admin" className="text-slate-300 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5">
                    <span>📊</span>
                    <span>Admin</span>
                </Link>

                {auth.isAuthenticated && auth.user ? (
                    <Link to="/auth" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-200 text-xs font-medium hover:bg-slate-700/80 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>{auth.user.username}</span>
                    </Link>
                ) : (
                    <Link to="/auth" className="text-slate-300 hover:text-white text-xs font-medium px-3 py-1.5 transition-colors">
                        Log In
                    </Link>
                )}

                <Link to="/upload" className="primary-button w-fit">Upload Resume</Link>
            </div>
        </nav>
    );
};

export default Navbar;