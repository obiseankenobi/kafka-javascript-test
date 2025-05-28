# Use Ubuntu 22.04 as the base image
FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install -y curl gnupg ca-certificates software-properties-common && \
    rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js and npm
RUN apt-get install -y nodejs && \
    apt-get install -y npm && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
COPY ..
CMD ["bash"]
