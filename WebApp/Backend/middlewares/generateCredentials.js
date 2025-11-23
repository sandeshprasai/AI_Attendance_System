const generateCredentials = (FullName, RollNo) => {
  if (!FullName || !RollNo) {
    throw new Error("FullName and RollNo are required");
  }
  const FirstName = FullName.trim().split(" ")[0];
  const username = `${FirstName.toLowerCase()}${RollNo}`;
  const padString = String(RollNo).padStart(4, "0");
  const randomChars = Math.random().toString(36).substring(2, 4);
  const password = `Stu@${padString}${randomChars}`;

  return { username, password };
};

module.exports = generateCredentials;
