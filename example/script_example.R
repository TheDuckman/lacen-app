# setwd("/work/pancreas/leosanches/lacen/usage2")
# .libPaths("/work/pancreas/leosanches/R/lib")

devtools::install_gitlab(repo = "bioinfo-lapic/lacen_package_test")

# Loading the package
suppressPackageStartupMessages(library(lacen))
options(stringsAsFactors = FALSE)

#Loading The files
datCounts <- read.csv("datCounts.csv", check.names = FALSE, row.names = 1)
datExpression <- read.csv("datExpression.csv", check.names = FALSE)
datTraits <-  read.csv("datTraits.csv", check.names = FALSE)
annotationData <- loadGTF(file = "gencode.v22.annotation.gtf.gz")
ncAnnotation <- loadGTF(file = "gencode.v22.long_noncoding_RNAs.gtf.gz")

# Creator function
lacenObject <- initLacen(annotationData = annotationData,
                         datCounts = datCounts,
                         datExpression = datExpression,
                         datTraits = datTraits,
                         ncAnnotation = ncAnnotation)

# Removing old data to save memmory
# rm(annotationData, datExpression, datTraits, datCounts, ncAnnotation)

# Checking Data format function
checkData(lacenObject)


# Filtertransform
lacenObject <- filterTransform(lacenObject = lacenObject,
                               pThreshold = 0.01,
                               fcThreshold = 1,
                               filterMethod = "DEG")


#3 - Removing outliers
# Show the figure 1a
selectOutlierSample(lacenObject,
                    plot = TRUE,
                    filename = "1a_clusterTree.png",
                    height = FALSE)

# Show the figure 1b
selectOutlierSample(lacenObject,
                    plot = TRUE,
                    filename = "1b_clusterTree.png",
                    height = 220)

# Set the height
lacenObject <- cutOutlierSample(lacenObject,
                                height = 220)

#4 - Picking the Beta-Value
plotSoftThreshold(lacenObject,
                  filename = "2_indicePower.png",
                  maxBlockSize = 40000,
                  plot = TRUE
)

lacenObject <- selectSoftThreshold(lacenObject = lacenObject,
                                   indicePower = 15)

# Bootstrapping
lacenObject <- lacenBootstrap(lacenObject = lacenObject,
                              numberOfIterations = 100,
                              maxBlockSize = 40000,
                              parallel = 4,
                              nparallel = 4,
                              WGCNAThreads = 4,
                              cutBootstrap = FALSE,
                              nThreads = 32,
                              csvPath = "bootstrap.csv",
                              pathModGroupsPlot = "3_modgroups.png",
                              pathStabilityPlot = "4_stability_bootstrap.png")

# cutbootstrap is the height selected by the user, based on 4_stability_bootstrap.png
lacenObject <- setBootstrap(lacenObject = lacenObject,
                            cutBootstrap = 80)

# Final network
lacenObject <- summarizeAndEnrichModules(lacenObject = lacenObject,
                                         #WGCNA parameters
                                         maxBlockSize = 20000,
                                         TOMType = "unsigned",
                                         minModuleSize = 30,
                                         reassignThreshold = 0,
                                         mergeCutHeight = 0.3,
                                         pamRespectsDendro = FALSE,
                                         corType = "bicor",
                                         
                                         #Enrichment analysis parameters
                                         userThreshold = 0.05,
                                         ontology = "BP",
                                         organism = "hsapiens",
                                         orgdb="org.Hs.eg.db",
                                         reducedTermsThreshold=0.7,
                                         filename = "5_enrichedgraph.png",
                                         mod_path = ".", # hidden, no doc
                                         
                                         #Log parameters
                                         log = TRUE, # hidden, no doc
                                         log_path = "log.txt" # hidden, no doc
)

stackedBarplot(lacenObject = lacenObject,
               filename = "6_stackedplot_desk.png",
               plot = TRUE)

heatmapTopConnectivity(lacenObject = lacenObject,
                       module = 3,
                       submodule = 1,
                       hmDimensions = FALSE,
                       filename = "7_heatmap.png", #if false, path.file
                       removeNonDEG = FALSE,
                       outTSV = FALSE,
                       plothm = TRUE)


# This is the new function, add a new tab in LACEN and allow the user to change the parameters (except the Paths)

lncRNAEnrich(lncName = "AC015849",
             lacenObject = lacenObject,
             nGenes = 500,
             nHighlight = 32,
             sources = c("GO:BP", "GO:MF", "GO:CC", "KEGG", "REAC"),
             organism = "hsapiens",
             nGenesNet = 20,
             nTerm = 16,
             lncHighlight = TRUE,
             netPath = "./8_netPlot.png",
             enrPath = "./9_ebrPlot.png",
             enrCsvPath = "./8_enr.csv",
             connecPath = "./9_connec.csv"
)
