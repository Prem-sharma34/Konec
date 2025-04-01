import { Box, Typography } from "@mui/material";

const Random = () => {
  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h6" color="textSecondary">
        Random Chat Coming Soon!
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
        Connect with random users for chats and calls. Stay tuned!
      </Typography>
    </Box>
  );
};

export default Random;