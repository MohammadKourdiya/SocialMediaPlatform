import SearchUsers from "./SearchUsers";

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              SocialApp
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <SearchUsers />
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {/* ... existing navigation links ... */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
