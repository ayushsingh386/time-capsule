import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, LayoutDashboard, Plus, Package, Users, LogOut, Menu, X, Home, Globe, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/create', label: 'New Capsule', icon: Plus },
  { to: '/capsules', label: 'My Capsules', icon: Package },
  { to: '/batches', label: 'Batches', icon: Users },
  { to: '/hall-of-fame', label: 'Hall of Fame', icon: Globe },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-amber-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-serif font-bold text-amber-900 hidden sm:block">TimeCapsule</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.filter(link => !(user?.role === 'teacher' && link.to === '/create') && !(user?.role === 'teacher' && link.to === '/capsules')).map(link => {
              const active = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
            
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === '/admin' ? 'bg-rose-100 text-rose-800' : 'text-rose-600 hover:bg-rose-50'}`}
              >
                <ShieldAlert className="w-4 h-4" />
                Requests
              </Link>
            )}
          </div>

          {/* User + Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-capsule-dusk">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-amber-50 transition-colors">
            {open ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-t border-amber-100 px-4 py-3 space-y-1"
        >
          {navLinks.filter(link => !(user?.role === 'teacher' && link.to === '/create') && !(user?.role === 'teacher' && link.to === '/capsules')).map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${location.pathname === link.to
                ? 'bg-amber-100 text-amber-800'
                : 'text-gray-600 hover:bg-amber-50'
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
          
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${location.pathname === '/admin' ? 'bg-rose-100 text-rose-800' : 'text-rose-600 hover:bg-rose-50'}`}
            >
              <ShieldAlert className="w-4 h-4" />
              Verify Requests
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 w-full transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </motion.div>
      )}
    </nav>
  )
}
