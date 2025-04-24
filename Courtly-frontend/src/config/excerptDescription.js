const createExcerpt = (description = "", length = 500, suffix = '...') => {
    // If description is empty or shorter than the specified length, return as is
    if (!description || description.length <= length) {
      return description || '';
    }
  
    // Split the string into characters properly, including special characters
    const stringArray = Array.from(description.trim());
  
    // Ensure the length is no greater than the specified value
    const excerpt = stringArray.slice(0, length).join('');
  
    // Find the last space in the sliced string to avoid cutting words
    const lastSpaceIndex = excerpt.lastIndexOf(' ');
  
    if (lastSpaceIndex > 0) {
      return excerpt.substring(0, lastSpaceIndex) + suffix;
    } else {
      return excerpt + suffix;
    }
  };
  
  export default createExcerpt;
  
