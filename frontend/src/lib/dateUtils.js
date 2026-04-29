/**
 * Date formatting utility
 * Provides simple date formatting without external dependencies
 */

export const formatDate = (date, format = 'MMM dd, yyyy') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();

  // Helper to format time
  const formatTime = (format) => {
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    if (format === 'hh:mm a') {
      // 12-hour format with am/pm
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 hours should be 12
      return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    } else if (format === 'HH:mm') {
      // 24-hour format
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    }
    return '';
  };

  if (format === 'MMM dd, yyyy') {
    return `${month} ${parseInt(day)}, ${year}`;
  } else if (format === 'MMM dd') {
    return `${month} ${parseInt(day)}`;
  } else if (format === 'yyyy-MM-dd') {
    return `${year}-${String(d.getMonth() + 1).padStart(2, '0')}-${day}`;
  } else if (format === 'MM/dd/yyyy') {
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${day}/${year}`;
  } else if (format === 'hh:mm a') {
    return formatTime('hh:mm a');
  } else if (format === 'HH:mm') {
    return formatTime('HH:mm');
  } else if (format === 'MMM dd, yyyy hh:mm a') {
    return `${month} ${parseInt(day)}, ${year} ${formatTime('hh:mm a')}`;
  }

  return `${month} ${parseInt(day)}, ${year}`;
};

export const formatDateTime = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${month} ${parseInt(day)}, ${year} ${hours}:${minutes}`;
};
