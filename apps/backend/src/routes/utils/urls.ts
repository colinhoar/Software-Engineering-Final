export const getFrontendUrl = () => {
  return process.env.FRONTEND_URL || "http://localhost:3000";
};
// if anyone is wondering why this file is here its because it was
// better for me to make a file instead of just make a fucntion and keep circle calling stuff
// this was just the recommended path by google so I did it
