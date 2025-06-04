import { renderWithErrorHighlight } from '../import/renderHelpers';

export const renderDateField = (value, record, errorItems, fieldLabel, field) => {
  const invalidKey = `invalid${field.charAt(0).toUpperCase() + field.slice(1)}`;
  if (record[invalidKey]) {
    return renderWithErrorHighlight('', record, errorItems, fieldLabel, '(Sai định dạng)');
  }
  if (!value || value.trim() === '') {
    return renderWithErrorHighlight('(Trống)', record, errorItems, fieldLabel);
  }
  return renderWithErrorHighlight(value, record, errorItems, fieldLabel);
};