options(timeout=9999)

# Install base packages from CRAN
install.packages(c(
  "git2r",
  "Matrix",
  "BiocManager",
  "remotes"), 
  dependencies=TRUE, 
  repos = "http://cran.r-project.org")

# Install Bioconductor dependencies
BiocManager::install(
  c("preprocessCore",
    "impute",
    "GOSemSim",
    "AnnotationDbi", 
    "org.Hs.eg.db",
    "rtracklayer",
    "edgeR",
    "limma",
    "rrvgo",
    "WGCNA"),
  update=FALSE,
  ask=FALSE)

# Install from GitHub using remotes (bypasses BiocManager's validation)
remotes::install_github("sanches-leo/lacen", dependencies=TRUE)