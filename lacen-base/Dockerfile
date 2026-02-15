FROM ubuntu:jammy
ENV DEBIAN_FRONTEND=noninteractive

# Installing dependencies
RUN apt-get -y upgrade
RUN apt-get -y update
RUN apt-get --assume-yes --fix-missing install curl
RUN apt-get --assume-yes --fix-missing install gnupg
RUN apt-get --assume-yes --fix-missing install nodejs
RUN apt-get --assume-yes --fix-missing install apt-transport-https
RUN apt-get --assume-yes --fix-missing install ca-certificates
RUN apt-get --assume-yes --fix-missing install software-properties-common
RUN apt-get --assume-yes --fix-missing install libcurl4-openssl-dev
RUN apt-get --assume-yes --fix-missing install dirmngr
RUN apt-get --assume-yes --fix-missing install libssl-dev
RUN apt-get --assume-yes --fix-missing install libxml2-dev
RUN apt-get --assume-yes --fix-missing install tzdata
RUN apt-get --assume-yes --fix-missing install tk8.6-dev
RUN apt-get --assume-yes --fix-missing install tcl8.6-dev
RUN apt-get --assume-yes --fix-missing install libharfbuzz-dev libfribidi-dev
RUN apt-get --assume-yes --fix-missing install libfreetype6-dev libpng-dev libtiff5-dev libjpeg-dev
RUN apt-get --assume-yes --fix-missing install lsof strace
RUN apt-get --assume-yes --fix-missing install libudunits2-dev libgit2-dev libgdal-dev
RUN apt-get --assume-yes --fix-missing install cron git libglpk-dev libgit2-1.1
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E298A3A825C0D65DFD57CBB651716619E084DAB9

# Adding new repos
# R
RUN add-apt-repository 'deb https://cloud.r-project.org/bin/linux/ubuntu jammy-cran40/'
# Yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
# NodeJs 16 (16.15.0)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get update

# Installing R
# ENV VERSION=4.4.0-1
RUN apt-get --assume-yes --no-install-recommends install r-base r-base-core r-base-html r-doc-html r-base-dev

# Installing NodeJs and Yarn
RUN apt-get --assume-yes --fix-missing install nodejs
RUN apt-get --assume-yes --fix-missing install yarn

# Installing R packages
RUN mkdir scripts
COPY ./installpackages.R ./scripts/installpackages.R
RUN Rscript ./scripts/installpackages.R
