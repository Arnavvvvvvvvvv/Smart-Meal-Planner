import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ChevronDown,
    ChefHat,
    Home,
    UtensilsCrossed,
    Calendar,
    ShoppingCart,
    Settings,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsDropdownOpen(false);
        setIsMobileMenuOpen(false);
    };

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-2 text-base font-semibold text-gray-900 sm:text-lg">
                        <ChefHat className="h-6 w-6 text-emerald-500 sm:h-7 sm:w-7" />
                        <span className="truncate">AI Smart Meal Planner</span>
                    </Link>

                    <div className="hidden items-center gap-1 md:flex">
                        <NavLink to="/dashboard" icon={<Home className="h-4 w-4" />} label="Dashboard" />
                        <NavLink to="/pantry" icon={<UtensilsCrossed className="h-4 w-4" />} label="Pantry" />
                        <NavLink to="/generate" icon={<ChefHat className="h-4 w-4" />} label="Generate" />
                        <NavLink to="/recipes" icon={<UtensilsCrossed className="h-4 w-4" />} label="Recipes" />
                        <NavLink to="/meal-plan" icon={<Calendar className="h-4 w-4" />} label="Meal Plan" />
                        <NavLink to="/shopping-list" icon={<ShoppingCart className="h-4 w-4" />} label="Shopping" />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            to="/settings"
                            className="hidden rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:flex"
                        >
                            <Settings className="h-5 w-5" />
                        </Link>
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-gray-700 transition-colors hover:text-gray-900 sm:px-3"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 font-medium text-white">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <span className="hidden font-medium sm:inline">{user?.name || 'User'}</span>
                                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                                    <div className="border-b border-gray-200 px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-medium text-white">
                                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                                                <p className="truncate text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden"
                            aria-label="Toggle navigation menu"
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="border-t border-gray-200 py-3 md:hidden">
                        <div className="flex flex-col gap-1">
                            <NavLink to="/dashboard" icon={<Home className="h-4 w-4" />} label="Dashboard" onClick={closeMobileMenu} />
                            <NavLink to="/pantry" icon={<UtensilsCrossed className="h-4 w-4" />} label="Pantry" onClick={closeMobileMenu} />
                            <NavLink to="/generate" icon={<ChefHat className="h-4 w-4" />} label="Generate" onClick={closeMobileMenu} />
                            <NavLink to="/recipes" icon={<UtensilsCrossed className="h-4 w-4" />} label="Recipes" onClick={closeMobileMenu} />
                            <NavLink to="/meal-plan" icon={<Calendar className="h-4 w-4" />} label="Meal Plan" onClick={closeMobileMenu} />
                            <NavLink to="/shopping-list" icon={<ShoppingCart className="h-4 w-4" />} label="Shopping" onClick={closeMobileMenu} />
                            <NavLink to="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" onClick={closeMobileMenu} />
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

const NavLink = ({ to, icon, label, onClick }) => {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
};

export default Navbar;
