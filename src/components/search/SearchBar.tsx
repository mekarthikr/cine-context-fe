import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, X } from 'lucide-react';
import { Input } from '@app/ui/input';
import { Button } from '@app/ui/button';
import { SearchResults } from '@app/components/SearchResults';
// import { SearchResults } from './SearchResult';

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim() && isFocused) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setIsFocused(false);
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsOpen(true);
            setIsFocused(true);
          }}
          className="w-full pl-10"
        />
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2"
        >
          Search
        </Button>
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
