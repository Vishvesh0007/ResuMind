import { Link } from "react-router";


const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/" className="flex items-center gap-2.5 group">
                <img src="/icons/resumind-icon.png" alt="ResuMind Logo" className="w-8 h-8 rounded-lg transition-transform group-hover:scale-105" />
                <p className="text-2xl font-bold text-gradient">ResuMind</p>
            </Link>
            <Link to="/upload" className="primary-button w-fit">Upload Resume</Link>
        </nav>
    );
};

export default Navbar;