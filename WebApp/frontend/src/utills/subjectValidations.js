// utils/subjectValidations.js
export const validateSubjects = (subjects = []) => {
  const errors = {};

  subjects.forEach((sub = {}, index) => {
    const rowErrors = {};

    // Subject Code
    const subjectCode = sub.SubjectCode?.trim();
    if (!subjectCode) {
      rowErrors.SubjectCode = "Subject code is required";
    }

    // Subject Name
    const subjectName = sub.SubjectName?.trim();
    if (!subjectName) {
      rowErrors.SubjectName = "Subject name is required";
    } else if (subjectName.length > 100) {
      rowErrors.SubjectName = "Subject name must not exceed 100 characters";
    }

    // Department
    const department = sub.Department?.trim();
    if (!department) {
      rowErrors.Department = "Department is required";
    } else if (department.length > 100) {
      rowErrors.Department = "Department name must not exceed 100 characters";
    }

    // Semester (optional but strict)
    if (sub.Semester !== "" && sub.Semester !== undefined && sub.Semester !== null) {
      const sem = Number(sub.Semester);
      if (!Number.isInteger(sem)) {
        rowErrors.Semester = "Semester must be a valid integer";
      } else if (sem < 1 || sem > 8) {
        rowErrors.Semester = "Semester should be between 1 and 8";
      }
    }

    if (Object.keys(rowErrors).length > 0) {
      errors[index] = rowErrors;
    }
  });

  return errors;
};