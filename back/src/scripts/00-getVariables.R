# Get command line args ('lacenVar_' is the prefix for default system variables)
args = commandArgs(trailingOnly = TRUE)
lacenVar_rdataPath = head(args, 1)

# Load data
if (file.exists(lacenVar_rdataPath)) {
  load(lacenVar_rdataPath);
}

# Clear workspace
rm(args);

# Get existing variables
print(ls());

# Save workspace
save.image(lacenVar_rdataPath);
