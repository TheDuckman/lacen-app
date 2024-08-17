# Get command line args
args = commandArgs(trailingOnly = TRUE)
lacenVar_rdataPath <- args[1];
lacenVar_dataVar <- args[2];
lacenVar_filepath <- args[3];

# Load data
if (file.exists(lacenVar_rdataPath)) {
  load(lacenVar_rdataPath);
}

# Create variable and assing value
do.call("<-",list(lacenVar_dataVar, read.csv(lacenVar_filepath, check.names = FALSE, row.names = 1)))

# Clear workspace
rm(lacenVar_dataVar)
rm(lacenVar_filepath)
rm(args)

# Save workspace
save.image(lacenVar_rdataPath);