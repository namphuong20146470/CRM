// Utilities for file handling and version management

// Extract file version and base name from a filename
export const extractFileInfo = (filename, versionRegex) => {
  const match = filename.match(versionRegex);

  if (match) {
    const number = match[1];
    const version = match[2] ? match[2].toUpperCase() : ''; // Empty string if no letter
    const restOfName = match[3];

    return {
      number,
      version,
      baseName: `${number}.${restOfName}`, // Base name without version letter
      fullName: filename
    };
  }

  return {
    number: null,
    version: null,
    baseName: filename,
    fullName: filename
  };
};

// Filter files to keep only the latest version
export const filterLatestVersions = (files, versionRegex) => {
  const fileGroups = {};
  const latestVersions = [];
  const skipped = [];

  // Group files by their base number
  files.forEach(file => {
    const fileInfo = extractFileInfo(file.name, versionRegex);

    // If we could extract a number
    if (fileInfo.number !== null) {
      const key = fileInfo.number;

      if (!fileGroups[key]) {
        fileGroups[key] = [];
      }

      fileGroups[key].push({
        file,
        version: fileInfo.version,
        info: fileInfo
      });
    } else {
      // Files that don't match our pattern are always included
      latestVersions.push(file);
    }
  });

  // For each group, find the latest version
  Object.keys(fileGroups).forEach(key => {
    const group = fileGroups[key];

    if (group.length > 1) {
      // Sorting logic:
      // 1. Files with version letters are newer than files without
      // 2. For files with version letters, higher letters come first (C > B > A)
      group.sort((a, b) => {
        // If one has a version letter and the other doesn't
        if (a.version && !b.version) {
          return -1; // a (with letter) comes first (is newer)
        }
        if (!a.version && b.version) {
          return 1; // b (with letter) comes first (is newer)
        }

        // If both have version letters, compare them alphabetically
        if (a.version && b.version) {
          return b.version.localeCompare(a.version); // Sort in reverse (C > B > A)
        }

        // If neither has a version letter, maintain original order
        return 0;
      });

      // Keep the latest version
      latestVersions.push(group[0].file);

      // Add others to skipped list
      for (let i = 1; i < group.length; i++) {
        skipped.push({
          name: group[i].file.name,
          newerVersion: group[0].file.name
        });
      }
    } else if (group.length === 1) {
      // If there's only one file in the group, keep it
      latestVersions.push(group[0].file);
    }
  });

  return { latestVersions, skipped };
}; 