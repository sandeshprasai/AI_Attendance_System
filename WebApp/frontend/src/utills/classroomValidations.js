/**
 * Validates classroom data before submission
 * @param {Array} classrooms - Array of classroom objects
 * @returns {Object} - Object with row indices as keys and error objects as values
 */
export const validateClassrooms = (classrooms) => {
  const errors = {};

  classrooms.forEach((room, index) => {
    const rowErrors = {};

    // Validate Classroom Code
    if (!room.Code || !room.Code.trim()) {
      rowErrors.Code = "Classroom code is required";
    } else if (room.Code.trim().length < 2) {
      rowErrors.Code = "Classroom code must be at least 2 characters";
    } else if (room.Code.trim().length > 20) {
      rowErrors.Code = "Classroom code must be less than 20 characters";
    }

    // Validate Capacity
    if (!room.Capacity || !room.Capacity.toString().trim()) {
      rowErrors.Capacity = "Capacity is required";
    } else {
      const capacity = Number(room.Capacity);
      if (isNaN(capacity) || !Number.isInteger(capacity)) {
        rowErrors.Capacity = "Capacity must be a valid number";
      } else if (capacity <= 0) {
        rowErrors.Capacity = "Capacity must be greater than 0";
      } else if (capacity > 500) {
        rowErrors.Capacity = "Capacity cannot exceed 500";
      }
    }

    // Validate Description (optional, but if provided should have reasonable length)
    if (room.Description && room.Description.trim().length > 200) {
      rowErrors.Description = "Description must be less than 200 characters";
    }

    if (Object.keys(rowErrors).length > 0) {
      errors[index] = rowErrors;
    }
  });

  return errors;
};
