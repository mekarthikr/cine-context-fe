import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, X } from 'lucide-react';
import { Input } from '@app/ui/input';
import { Button } from '@app/ui/button';
import { SearchResults } from './SearchResults';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className = '',
  placeholder = 'Search by emotion, theme, or title',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsFocused(false);
        inputRef.current?.blur();
      } else if (event.key === 'Enter' && query.trim() && isFocused) {
        // Navigate to search results page
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [query, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setQuery(value);
    setIsOpen(value.length >= 2);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (query.length >= 2) {
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className={`pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 transition-all duration-200 ${
            isFocused ? 'ring-2 ring-purple-500 border-purple-500' : ''
          }`}
          autoComplete="off"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {/* Search Results Dropdown */}
      <SearchResults
        query={query}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
      />

      {/* Search Suggestions */}
      {isFocused && !query && (
        <div className="absolute top-full left-0 right-0 z-40 mt-2">
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Popular Searches</h4>
            <div className="flex flex-wrap gap-2">
              {[
                'The Bear',
                'Succession',
                'Dune',
                'Breaking Bad',
                'Stranger Things',
                'The Office',
                'Marvel',
                'Christopher Nolan',
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    setIsOpen(true);
                  }}
                  className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-400">
                Try searching for movies, TV shows, actors, or directors
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
