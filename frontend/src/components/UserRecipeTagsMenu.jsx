import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Popover, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import './UserRecipeTagsMenu.css';

function UserRecipeTagsMenu({ 
  recipeId, 
  tags = [], 
  existingTagIds = [], 
  handleTagSelect, 
  label = "+ Tag"
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchQuery('');
  };

  const open = Boolean(anchorEl);

  // Focus search input when popover opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  // Normalize existing IDs to numbers or strings for quick lookup
  const existingSet = useMemo(() => {
    const set = new Set();
    if (Array.isArray(existingTagIds)) {
      existingTagIds.forEach(id => {
        if (id !== undefined && id !== null) {
          set.add(Number(id));
        }
      });
    }
    return set;
  }, [existingTagIds]);

  // Filter tags by search query
  const filteredTags = useMemo(() => {
    if (!tags || !Array.isArray(tags)) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return tags;
    return tags.filter(tag => tag && tag.name && tag.name.toLowerCase().includes(query));
  }, [tags, searchQuery]);

  // Handle selecting an existing tag
  const onSelectTag = (e, tagId) => {
    e.preventDefault();
    e.stopPropagation();
    if (existingSet.has(Number(tagId))) {
      return; // Already attached
    }
    handleTagSelect(recipeId, tagId);
    handleClose();
  };

  return (
    <>
      <Tooltip title="Add tag to recipe" arrow placement="top">
        <button
          type="button"
          className={`urt-trigger-btn ${open ? 'is-active' : ''}`}
          onClick={handleClick}
          aria-label="Add tag"
        >
          <AddIcon sx={{ fontSize: 13 }} />
          <span>{label.replace(/^\+\s*/, '')}</span>
        </button>
      </Tooltip>

      {open && (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          disableScrollLock
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          slotProps={{
            paper: {
              className: 'urt-popover-paper'
            }
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="urt-header">
            <div className="urt-title">
              <LocalOfferOutlinedIcon sx={{ fontSize: 15, color: '#FF7D45' }} />
              <span>Select Tag</span>
            </div>
            <span className="urt-count-badge">
              {tags?.length || 0}
            </span>
          </div>

          {/* Search Box */}
          <div className="urt-search-wrapper">
            <SearchIcon className="urt-search-icon" sx={{ fontSize: 16 }} />
            <input
              ref={searchInputRef}
              type="text"
              className="urt-search-input"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (filteredTags.length > 0) {
                    const firstUnadded = filteredTags.find(t => !existingSet.has(Number(t.id)));
                    if (firstUnadded) {
                      onSelectTag(e, firstUnadded.id);
                    }
                  }
                }
              }}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="urt-search-clear" 
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </button>
            )}
          </div>

          {/* Tag List */}
          <ul className="urt-list">
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => {
                const isAdded = existingSet.has(Number(tag.id));
                return (
                  <li key={tag.id}>
                    <button
                      type="button"
                      className={`urt-item ${isAdded ? 'is-disabled' : ''}`}
                      onClick={(e) => onSelectTag(e, tag.id)}
                      disabled={isAdded}
                      title={isAdded ? "Already attached to this recipe" : `Add "${tag.name}"`}
                    >
                      <div className="urt-item-left">
                        <span className="urt-tag-bullet">#</span>
                        <span>{tag.name}</span>
                      </div>

                      {isAdded ? (
                        <span className="urt-added-badge">
                          <CheckIcon sx={{ fontSize: 11 }} /> Added
                        </span>
                      ) : (
                        <span className="urt-add-action">+ Add</span>
                      )}
                    </button>
                  </li>
                );
              })
            ) : (
              <div className="urt-empty-state">
                {searchQuery ? `No tags matching "${searchQuery}"` : "No tags available to select."}
              </div>
            )}
          </ul>
        </Popover>
      )}
    </>
  );
}

export default UserRecipeTagsMenu;
