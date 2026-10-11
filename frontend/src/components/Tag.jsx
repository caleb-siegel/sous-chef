import React from 'react';
import { Checkbox, TextField, Autocomplete, Chip } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import AddIcon from '@mui/icons-material/Add';
import './Tag.css';

function Tag({ tags = [], selectedTags = [], handleTagChange }) {
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" sx={{ color: '#94a3b8' }} />;
  const checkedIcon = <CheckBoxIcon fontSize="small" sx={{ color: '#059669' }} />;

  // Quick suggestions: top tags that aren't yet selected
  const suggestedTags = (tags || [])
    .filter(t => t && t.name && !(selectedTags || []).some(st => (st.id === t.id || st.name === t.name)))
    .slice(0, 6);

  const handleQuickAdd = (tag) => {
    if (handleTagChange) {
      handleTagChange(null, [...(selectedTags || []), tag]);
    }
  };

  return (
    <div className="tag-component-root">
      <Autocomplete
        multiple
        id="recipe-tags-autocomplete"
        options={tags || []}
        disableCloseOnSelect
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.name || '')}
        isOptionEqualToValue={(option, value) => {
          if (!option || !value) return false;
          if (option.id && value.id) return option.id === value.id;
          return option.name === value.name;
        }}
        value={selectedTags || []}
        onChange={handleTagChange}
        slotProps={{
          popper: {
            disablePortal: false,
          },
          paper: {
            sx: {
              borderRadius: '14px',
              mt: 0.5,
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.14)',
            }
          }
        }}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            const name = typeof option === 'string' ? option : option.name;
            return (
              <Chip
                key={key || index}
                label={name}
                size="small"
                icon={<LocalOfferOutlinedIcon sx={{ fontSize: '13px !important', color: '#059669 !important' }} />}
                {...tagProps}
                sx={{
                  backgroundColor: 'rgba(63, 255, 194, 0.18)',
                  color: '#047857',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(5, 150, 105, 0.25)',
                  '& .MuiChip-deleteIcon': {
                    color: '#059669',
                    fontSize: '16px',
                    '&:hover': {
                      color: '#b91c1c',
                    },
                  },
                }}
              />
            );
          })
        }
        renderOption={(props, option, { selected }) => (
          <li {...props} key={option.id || option.name} style={{ padding: '4px 8px' }}>
            <div className={`tag-option-item ${selected ? 'is-selected' : ''}`}>
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                size="small"
                checked={selected}
                sx={{ p: 0.5 }}
              />
              <span style={{ fontWeight: selected ? 600 : 500 }}>{option.name}</span>
            </div>
          </li>
        )}
        fullWidth
        renderInput={(params) => (
          <TextField
            {...params}
            label="Recipe Tags & Categories"
            placeholder={selectedTags?.length > 0 ? "Add another tag..." : "Select tags (e.g. Dinner, Quick, Healthy)..."}
            size="small"
            InputProps={{
              ...params.InputProps,
              sx: {
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                '&:hover fieldset': {
                  borderColor: 'var(--rc-primary-dark, #059669)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--rc-primary-dark, #059669)',
                  borderWidth: '2px',
                },
              }
            }}
          />
        )}
      />

      {suggestedTags.length > 0 && (
        <div className="tag-suggestions-row">
          <span className="tag-suggestions-label">Suggestions:</span>
          {suggestedTags.map((tag) => (
            <button
              key={tag.id || tag.name}
              type="button"
              className="tag-suggestion-pill"
              onClick={() => handleQuickAdd(tag)}
            >
              <AddIcon sx={{ fontSize: 12, color: '#059669' }} />
              <span>{tag.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Tag;