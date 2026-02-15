options(timeout=9999)
# install.packages("devtools", repos = "http://cran.r-project.org")
# install.packages("lattice")
# install.packages("https://cran.r-project.org/src/contrib/Archive/Matrix/Matrix_1.6-5.tar.gz", repo=NULL)
# install.packages("https://cran.r-project.org/src/contrib/Archive/MASS/MASS_7.3-60.0.1.tar.gz", repo=NULL)


# TEST (Hmisc dependencies)
# install.packages("survival", dependencies=TRUE, repos = "http://cran.r-project.org")
# install.packages("Formula", dependencies=TRUE, repos = "http://cran.r-project.org")
# install.packages("ggplot2", dependencies=TRUE, repos = "http://cran.r-project.org")
# install.packages("latticeExtra", dependencies=TRUE, repos = "http://cran.r-project.org")
# install.packages("cluster", dependencies=TRUE, repos = "http://cran.r-project.org")
# install.packages("rpart", dependencies=TRUE, repos = "http://cran.r-project.org")
# install.packages("nnet", dependencies=TRUE, repos = "http://cran.r-project.org")
# install.packages("foreign", dependencies=TRUE, repos = "http://cran.r-project.org")
# install.packages("gtable", dependencies=TRUE, repos = "http://cran.r-project.org")
# install.packages("gridExtra", dependencies=TRUE, repos = "http://cran.r-project.org")
# install.packages("data.table", dependencies=TRUE, repos = "http://cran.r-project.org")
# install.packages("htmlTable", dependencies=TRUE, repos = "http://cran.r-project.org")
# install.packages("viridis", dependencies=TRUE, repos = "http://cran.r-project.org")


# install.packages('Formula')
# install.packages('latticeExtra')
# install.packages('cluster')
# install.packages('rpart')
# install.packages('nnet')
# install.packages('foreign')
# install.packages('htmlTable')
# install.packages('https://cloud.r-project.org/src/contrib/survival_3.7-0.tar.gz', repo=NULL)
# install.packages('https://cloud.r-project.org/src/contrib/gtable_0.3.6.tar.gz', repo=NULL)
# install.packages('https://cloud.r-project.org/src/contrib/ggplot2_3.5.1.tar.gz', repo=NULL)
# install.packages('https://cloud.r-project.org/src/contrib/gridExtra_2.3.tar.gz', repo=NULL)
# install.packages('https://cloud.r-project.org/src/contrib/data.table_1.16.2.tar.gz', repo=NULL)
# install.packages('https://cloud.r-project.org/src/contrib/viridis_0.6.5.tar.gz', repo=NULL)


# install.packages("https://cran.r-project.org/src/contrib/Archive/Hmisc/Hmisc_4.6-0.tar.gz", repo=NULL)

# devtools::install_gitlab(repo = "bioinfo-lapic/lacen_package_test", dependencies = TRUE, upgrade = "never", force=TRUE)
# devtools::install_github("ropensci/git2r")

install.packages(c("git2r", "Matrix", "BiocManager", "remotes"), dependencies=TRUE, repos = "http://cran.r-project.org")

BiocManager::install("sanches-leo/lacen")