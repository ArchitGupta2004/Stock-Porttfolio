import { Link } from 'react-router-dom';
import { LineChart, LogOut, User as UserIcon } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-dark-card border-b border-dark-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 text-brand-primary">
          <LineChart size={28} />
          <span className="text-xl font-bold text-white tracking-wide">StockFolio</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/profile" className="flex items-center space-x-2 text-dark-muted hover:text-white transition-colors hidden md:flex cursor-pointer">
                <UserIcon size={18} />
                <span>{user.name}</span>
              </Link>
              <button 
                onClick={onLogout}
                className="flex items-center space-x-2 text-brand-danger hover:text-white hover:bg-brand-danger/20 px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-dark-muted hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="bg-brand-primary hover:bg-brand-primary/80 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
