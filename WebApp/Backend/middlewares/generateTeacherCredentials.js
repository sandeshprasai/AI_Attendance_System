function generateTeacherCredentials(fullName, mongoId) {
  const nameParts = fullName.trim().toLowerCase().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts[1] || "";

  const last4 = mongoId.toString().slice(-4);

  const username = `${firstName}${lastName}${last4}`;
  const randomChars = Math.random().toString(36).substring(2, 4);
  const password = `Teach@${last4}${randomChars}`;

  return { username, password };
}

module.exports = generateTeacherCredentials;
